import { NextResponse } from "next/server";
import { getAllowedDomains, validateApiKey } from "@/lib/gmail";

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

  const apiKey = process.env.API_KEY;
  // If API key is configured, we already validated above. If not, still allow.
  // But check if a key was expected and wrong one was provided
  if (apiKey) {
    // already validated
  }

  const domains = getAllowedDomains();

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
