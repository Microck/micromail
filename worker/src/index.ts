import PostalMime from "postal-mime";

export interface Env {
  MAIL_DB: D1Database;
  ALLOWED_DOMAINS?: string;
}

type ParsedAddress = {
  address?: string;
  name?: string;
};

function normalizeAddress(value: unknown): string {
  if (typeof value === "string") return value.toLowerCase();
  if (value && typeof value === "object" && "address" in value) {
    const address = (value as ParsedAddress).address;
    if (typeof address === "string") return address.toLowerCase();
  }

  return "";
}

function getRecipients(message: ForwardableEmailMessage, parsed: Awaited<ReturnType<typeof PostalMime.parse>>): string[] {
  const parsedTo = Array.isArray(parsed.to) ? parsed.to.map(normalizeAddress) : [];
  const headerTo = normalizeAddress(message.to);

  return [...parsedTo, headerTo].filter(Boolean);
}

function isAllowedRecipient(toEmail: string, allowedDomains?: string): boolean {
  const domains = (allowedDomains || "")
    .split(",")
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean);

  if (domains.length === 0) return true;

  const domain = toEmail.split("@").at(1);
  return domain ? domains.includes(domain) : false;
}

function createMessageId(message: ForwardableEmailMessage, index: number): string {
  const stableParts = [message.from, message.to, message.headers.get("message-id") || crypto.randomUUID(), String(index)];
  const source = stableParts.join(":");

  return crypto.randomUUID() + "-" + source.length.toString(36);
}

async function storeEmail(env: Env, message: ForwardableEmailMessage): Promise<void> {
  const parsed = await PostalMime.parse(message.raw);
  const recipients = getRecipients(message, parsed);
  const fromEmail = normalizeAddress(parsed.from) || message.from.toLowerCase();
  const subject = parsed.subject || "";
  const textBody = parsed.text || "";
  const htmlBody = parsed.html || "";
  const messageId = message.headers.get("message-id") || null;
  const receivedAt = new Date().toISOString();

  for (const [index, toEmail] of recipients.entries()) {
    if (!isAllowedRecipient(toEmail, env.ALLOWED_DOMAINS)) continue;

    await env.MAIL_DB.prepare(
      `INSERT INTO emails (
        id,
        message_id,
        from_email,
        to_email,
        subject,
        text_body,
        html_body,
        received_at,
        is_read
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`
    )
      .bind(createMessageId(message, index), messageId, fromEmail, toEmail, subject, textBody, htmlBody, receivedAt)
      .run();
  }
}

export default {
  async email(message, env) {
    await storeEmail(env, message);
  },
} satisfies ExportedHandler<Env>;
