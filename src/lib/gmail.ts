import { google } from "googleapis";
import type { gmail_v1 } from "googleapis";

let _gmail: gmail_v1.Gmail | null = null;

function getServiceAccount() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT env var is missing");
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("GOOGLE_SERVICE_ACCOUNT is not valid JSON");
  }
}

export async function getGmailClient(): Promise<gmail_v1.Gmail> {
  if (_gmail) return _gmail;

  const sa = getServiceAccount();

  const auth = new google.auth.JWT({
    email: sa.client_email,
    key: sa.private_key,
    scopes: ["https://www.googleapis.com/auth/gmail.modify"],
    subject: process.env.GMAIL_USER,
  });

  await auth.authorize();

  _gmail = google.gmail({ version: "v1", auth });
  return _gmail;
}

export function getAllowedDomains(): string[] {
  const raw = process.env.ALLOWED_DOMAINS || "";
  return raw
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
}

export function validateApiKey(request: Request): boolean {
  const key = process.env.API_KEY;
  if (!key) return true; // no key configured means open access

  // Check x-api-key header
  const headerKey = request.headers.get("x-api-key");
  if (headerKey === key) return true;

  // Check Authorization: Bearer <key>
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ") && authHeader.slice(7) === key)
    return true;

  // Check ?api_key= query param
  const url = new URL(request.url);
  if (url.searchParams.get("api_key") === key) return true;

  return false;
}

export function extractEmailBody(payload: gmail_v1.Schema$MessagePart): string {
  if (payload.body?.data) {
    return Buffer.from(payload.body.data, "base64").toString("utf-8");
  }

  if (payload.parts) {
    // Prefer text/html, fall back to text/plain
    const html = payload.parts.find((p) => p.mimeType === "text/html");
    if (html?.body?.data) {
      return Buffer.from(html.body.data, "base64").toString("utf-8");
    }

    const text = payload.parts.find((p) => p.mimeType === "text/plain");
    if (text?.body?.data) {
      return Buffer.from(text.body.data, "base64").toString("utf-8");
    }

    // Multipart nesting
    const multi = payload.parts.find((p) =>
      p.mimeType?.startsWith("multipart/")
    );
    if (multi) return extractEmailBody(multi);
  }

  return "";
}

function extractHeader(
  headers: gmail_v1.Schema$MessagePartHeader[] | undefined,
  name: string
): string {
  if (!headers) return "";
  const h = headers.find(
    (hdr) => hdr.name?.toLowerCase() === name.toLowerCase()
  );
  return h?.value || "";
}

export function formatMessage(msg: gmail_v1.Schema$Message) {
  const headers = msg.payload?.headers;
  return {
    id: msg.id,
    threadId: msg.threadId,
    from: extractHeader(headers, "From"),
    to: extractHeader(headers, "To"),
    subject: extractHeader(headers, "Subject"),
    date: extractHeader(headers, "Date"),
    snippet: msg.snippet || "",
    body: extractEmailBody(msg.payload || {}),
    labels: msg.labelIds || [],
  };
}
