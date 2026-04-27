import { NextResponse } from "next/server";
import {
  getGmailClient,
  getAllowedDomains,
  validateApiKey,
  formatMessage,
} from "@/lib/gmail";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ username: string; domain: string }>;
  }
) {
  const { username, domain } = await params;

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

  const email = `${username.toLowerCase()}@${domain.toLowerCase()}`;

  const url = new URL(request.url);
  const limit = Math.min(
    Math.max(parseInt(url.searchParams.get("limit") || "50") || 50, 1),
    100
  );

  try {
    const gmail = await getGmailClient();

    // Search for messages sent to this specific email
    const listRes = await gmail.users.messages.list({
      userId: "me",
      q: `to:${email}`,
      maxResults: limit,
    });

    const messageIds = listRes.data.messages || [];

    if (messageIds.length === 0) {
      return NextResponse.json({
        success: true,
        email,
        count: 0,
        messages: [],
      });
    }

    // Fetch metadata for each message (lightweight)
    const messages = await Promise.all(
      messageIds.map(async (msg) => {
        const full = await gmail.users.messages.get({
          userId: "me",
          id: msg.id!,
          format: "metadata",
          metadataHeaders: ["From", "To", "Subject", "Date"],
        });
        return formatMessage(full.data);
      })
    );

    return NextResponse.json({
      success: true,
      email,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error("Gmail API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
