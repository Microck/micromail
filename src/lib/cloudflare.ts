/**
 * Cloudflare Email Workers backend for micromail.
 *
 * Instead of reading from Gmail, this backend reads email from a
 * Cloudflare D1 database that is populated by a separate Email Worker.
 *
 * The Email Worker uses postal-mime to parse inbound email and stores
 * it in D1. micromail reads from D1 via the REST API.
 *
 * Required env vars:
 *   EMAIL_BACKEND=cloudflare
 *   CF_ACCOUNT_ID     - your Cloudflare account ID
 *   CF_D1_DATABASE_ID - the D1 database ID
 *   CF_API_TOKEN      - API token with D1 read access
 *   ALLOWED_DOMAINS   - comma-separated domains
 *   API_KEY           - (optional) API key for auth
 */

export interface EmailMessage {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  snippet: string;
  body: string;
  date: string;
  labels: string[];
}

const CF_BASE = "https://api.cloudflare.com/client/v4";

async function d1Query<T = unknown>(
  accountId: string,
  databaseId: string,
  apiToken: string,
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const res = await fetch(
    `${CF_BASE}/accounts/${accountId}/d1/database/${databaseId}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params }),
    }
  );

  const data = await res.json();
  if (!data.success) {
    throw new Error(
      `D1 query failed: ${data.errors?.map((e: { message: string }) => e.message).join(", ") || "unknown"}`
    );
  }

  // D1 API returns results[0].results for the first statement
  const rows = data.result?.[0]?.results ?? [];
  return rows as T[];
}

interface D1EmailRow {
  id: string;
  message_id: string;
  from_email: string;
  to_email: string;
  subject: string;
  text_body: string;
  html_body: string;
  received_at: string;
  is_read: number;
}

function rowToMessage(row: D1EmailRow): EmailMessage {
  const html = row.html_body || "";
  const text = row.text_body || "";
  const body = html || text;

  return {
    id: row.id,
    threadId: row.message_id || row.id,
    from: row.from_email,
    to: row.to_email,
    subject: row.subject || "(no subject)",
    snippet: body.substring(0, 200).replace(/<[^>]*>/g, ""),
    body,
    date: row.received_at,
    labels: row.is_read ? ["INBOX"] : ["INBOX", "UNREAD"],
  };
}

export function getConfig() {
  const accountId = process.env.CF_ACCOUNT_ID;
  const databaseId = process.env.CF_D1_DATABASE_ID;
  const apiToken = process.env.CF_API_TOKEN;

  if (!accountId || !databaseId || !apiToken) {
    throw new Error(
      "Cloudflare backend requires CF_ACCOUNT_ID, CF_D1_DATABASE_ID, and CF_API_TOKEN"
    );
  }

  return { accountId, databaseId, apiToken };
}

export async function getDomains(): Promise<string[]> {
  // For the Cloudflare backend, domains are configured via ALLOWED_DOMAINS
  // just like the Gmail backend
  const raw = process.env.ALLOWED_DOMAINS || "";
  return raw
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
}

export async function getInbox(
  username: string,
  domain: string,
  limit: number
): Promise<EmailMessage[]> {
  const { accountId, databaseId, apiToken } = getConfig();
  const email = `${username.toLowerCase()}@${domain.toLowerCase()}`;

  const rows = await d1Query<D1EmailRow>(
    accountId,
    databaseId,
    apiToken,
    `SELECT id, message_id, from_email, to_email, subject, text_body, html_body, received_at, is_read
     FROM emails
     WHERE to_email = ?
     ORDER BY received_at DESC
     LIMIT ?`,
    [email, limit]
  );

  return rows.map(rowToMessage);
}

export async function getMessage(
  username: string,
  domain: string,
  id: string
): Promise<EmailMessage | null> {
  const { accountId, databaseId, apiToken } = getConfig();
  const email = `${username.toLowerCase()}@${domain.toLowerCase()}`;

  const rows = await d1Query<D1EmailRow>(
    accountId,
    databaseId,
    apiToken,
    `SELECT id, message_id, from_email, to_email, subject, text_body, html_body, received_at, is_read
     FROM emails
     WHERE id = ? AND to_email = ?
     LIMIT 1`,
    [id, email]
  );

  if (rows.length === 0) return null;
  return rowToMessage(rows[0]);
}

export async function deleteMessage(
  _username: string,
  _domain: string,
  id: string
): Promise<void> {
  const { accountId, databaseId, apiToken } = getConfig();

  await d1Query(
    accountId,
    databaseId,
    apiToken,
    `DELETE FROM emails WHERE id = ?`,
    [id]
  );
}

/**
 * SQL schema for the D1 database.
 * Run this in your Cloudflare dashboard or via wrangler d1 execute.
 *
 * CREATE TABLE IF NOT EXISTS emails (
 *   id TEXT PRIMARY KEY,
 *   message_id TEXT,
 *   from_email TEXT NOT NULL,
 *   to_email TEXT NOT NULL,
 *   subject TEXT,
 *   text_body TEXT,
 *   html_body TEXT,
 *   received_at TEXT NOT NULL DEFAULT (datetime('now')),
 *   is_read INTEGER NOT NULL DEFAULT 0
 * );
 *
 * CREATE INDEX IF NOT EXISTS idx_emails_to ON emails(to_email);
 * CREATE INDEX IF NOT EXISTS idx_emails_received ON emails(received_at);
 */
