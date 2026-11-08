import { NextResponse } from "next/server";
import {
  getGmailClient,
  getAllowedDomains,
  validateApiKey,
  formatMessage,
} from "@/lib/gmail";
import { getBackend } from "@/app/api/domains/route";
import * as cf from "@/lib/cloudflare";
import { checkRateLimit } from "@/lib/rate-limit";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;
const INBOX_RATE_LIMIT = 60; // requests per minute per IP

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ username: string; domain: string }>;
  }
) {
  const { username, domain } = await params;

  const rate = checkRateLimit(request, "inbox", INBOX_RATE_LIMIT);
  if (rate.limited) {
    return NextResponse.json(
      {
        success: false,
        error: "Too many requests. Please slow down and try again shortly.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfter) },
      }
    );
  }

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

  const requestedLimit = Number.parseInt(url.searchParams.get("limit") || "", 10);
  const limit = Math.min(
    Math.max(Number.isFinite(requestedLimit) ? requestedLimit : DEFAULT_LIMIT, 1),
    MAX_LIMIT
  );

  const requestedAfter = Number.parseInt(url.searchParams.get("after") || "", 10);
  const after =
    Number.isFinite(requestedAfter) && requestedAfter > 0 ? requestedAfter : 0;

  // Sent back to clients so they can ask for only newer messages on the next
  // poll without relying on their own clock.
  const serverTime = Math.floor(Date.now() / 1000);

  const respond = (messages: cf.EmailMessage[]) =>
    NextResponse.json(
      {
        success: true,
        email,
        serverTime,
        count: messages.length,
        messages,
      },
      { headers: { "Cache-Control": "no-store" } }
    );

  try {
    const backend = getBackend();

    if (backend === "cloudflare") {
      const messages = await cf.getInbox(username, domain, limit, after);
      return respond(messages);
    }

    // Gmail backend (default)
    const gmail = await getGmailClient();
    const query = after ? `to:${email} after:${after}` : `to:${email}`;

    const listRes = await gmail.users.messages.list({
      userId: "me",
      q: query,
      maxResults: limit,
    });

    const messageIds = listRes.data.messages || [];

    if (messageIds.length === 0) {
      return respond([]);
    }

    const messages = await Promise.all(
      messageIds.map(async (msg) => {
        const full = await gmail.users.messages.get({
          userId: "me",
          id: msg.id!,
          format: "metadata",
          metadataHeaders: ["From", "To", "Subject", "Date"],
          // Ask Gmail for metadata only. This keeps payloads tiny and avoids
          // parsing fields the inbox list never renders.
          fields:
            "id,threadId,labelIds,snippet,payload/headers",
        });
        return formatMessage(full.data);
      })
    );

    return respond(messages);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
