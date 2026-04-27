import { NextResponse } from "next/server";
import {
  getGmailClient,
  getAllowedDomains,
  validateApiKey,
  formatMessage,
} from "@/lib/gmail";
import { getBackend } from "@/app/api/domains/route";
import * as cf from "@/lib/cloudflare";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ username: string; domain: string; id: string }>;
  }
) {
  const { username, domain, id } = await params;

  if (!validateApiKey(request)) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Missing API key. Provide it via x-api-key header, Authorization: Bearer <key>, or ?api_key= query param.",
      },
      { status: 401 }
    );
  }

  const domains = getAllowedDomains();
  if (!domains.includes(domain.toLowerCase())) {
    return NextResponse.json(
      { success: false, error: "Domain not allowed" },
      { status: 400 }
    );
  }

  try {
    const backend = getBackend();

    if (backend === "cloudflare") {
      const message = await cf.getMessage(username, domain, id);
      if (!message) {
        return NextResponse.json(
          { success: false, error: "Message not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, message });
    }

    // Gmail backend (default)
    const gmail = await getGmailClient();
    const msg = await gmail.users.messages.get({
      userId: "me",
      id,
      format: "full",
    });

    if (!msg.data) {
      return NextResponse.json(
        { success: false, error: "Message not found" },
        { status: 404 }
      );
    }

    const toHeader = msg.data.payload?.headers?.find(
      (h) => h.name?.toLowerCase() === "to"
    );
    const expectedEmail = `${username.toLowerCase()}@${domain.toLowerCase()}`;
    if (
      toHeader?.value &&
      !toHeader.value.toLowerCase().includes(expectedEmail)
    ) {
      return NextResponse.json(
        { success: false, error: "Message not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: formatMessage(msg.data),
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ username: string; domain: string; id: string }>;
  }
) {
  const { username, domain, id } = await params;

  if (!validateApiKey(request)) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Missing API key. Provide it via x-api-key header, Authorization: Bearer <key>, or ?api_key= query param.",
      },
      { status: 401 }
    );
  }

  const domains = getAllowedDomains();
  if (!domains.includes(domain.toLowerCase())) {
    return NextResponse.json(
      { success: false, error: "Domain not allowed" },
      { status: 400 }
    );
  }

  try {
    const backend = getBackend();

    if (backend === "cloudflare") {
      await cf.deleteMessage(username, domain, id);
      return NextResponse.json({
        success: true,
        message: "Email deleted",
      });
    }

    // Gmail backend (default)
    const gmail = await getGmailClient();
    await gmail.users.messages.trash({ userId: "me", id });

    return NextResponse.json({
      success: true,
      message: "Email moved to trash",
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
