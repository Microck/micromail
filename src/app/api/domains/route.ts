import { NextResponse } from "next/server";

function getBackend() {
  return (process.env.EMAIL_BACKEND || "gmail").toLowerCase();
}

export { getBackend };

import { getActiveDomains as getGmailDomains, validateApiKey } from "@/lib/gmail";
import * as cf from "@/lib/cloudflare";

export async function GET(request: Request) {
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

  const domains =
    getBackend() === "cloudflare" ? await cf.getDomains() : getGmailDomains();

  if (domains.length === 0) {
    return NextResponse.json(
      { success: false, error: "No domains configured" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    count: domains.length,
    domains,
  });
}
