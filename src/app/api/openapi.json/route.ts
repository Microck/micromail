import { NextResponse } from "next/server";

const openapiSpec = {
  openapi: "3.1.0",
  info: {
    title: "micromail Temporary Email API",
    version: "1.0.0",
    description:
      "REST API for generating and reading temporary disposable email addresses. All email addresses must use one of the allowed domains returned by `/api/domains`.",
    license: { name: "MIT" },
  },
  servers: [{ url: "", description: "Current server" }],
  tags: [
    { name: "Domains", description: "Query available email domains" },
    {
      name: "Inbox",
      description: "Read and manage messages for a temp email address",
    },
  ],
  security: [{ ApiKeyHeader: [] }, { BearerAuth: [] }],
  paths: {
    "/api/domains": {
      get: {
        tags: ["Domains"],
        summary: "List allowed domains",
        description:
          "Returns all domains configured in ALLOWED_DOMAINS. Only these domains can be used for temporary email addresses.",
        operationId: "getDomains",
        security: [{ ApiKeyHeader: [] }, { BearerAuth: [] }],
        responses: {
          "200": {
            description: "List of allowed domains",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    count: { type: "integer", example: 1 },
                    domains: {
                      type: "array",
                      items: { type: "string" },
                      example: ["yourdomain.com"],
                    },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/api/i/{username}/{domain}": {
      get: {
        tags: ["Inbox"],
        summary: "Get inbox messages",
        description:
          "Fetch all messages received by {username}@{domain}. The domain must be in the allowed list.",
        operationId: "getInbox",
        security: [{ ApiKeyHeader: [] }, { BearerAuth: [] }],
        parameters: [
          {
            name: "username",
            in: "path",
            required: true,
            description: "The local part of the email address (before @)",
            schema: { type: "string", example: "hello" },
          },
          {
            name: "domain",
            in: "path",
            required: true,
            description: "The domain part (must be in allowed list)",
            schema: { type: "string", example: "yourdomain.com" },
          },
          {
            name: "limit",
            in: "query",
            required: false,
            description: "Max messages to return (1-100, default: 50)",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 50 },
          },
        ],
        responses: {
          "200": {
            description: "Inbox messages",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    email: { type: "string", example: "hello@yourdomain.com" },
                    count: { type: "integer", example: 2 },
                    messages: {
                      type: "array",
                      items: { $ref: "#/components/schemas/EmailMessage" },
                    },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "500": { $ref: "#/components/responses/ServerError" },
        },
      },
    },
    "/api/i/{username}/{domain}/{id}": {
      get: {
        tags: ["Inbox"],
        summary: "Get a single message",
        description: "Fetch one specific message by its Gmail message ID.",
        operationId: "getMessage",
        security: [{ ApiKeyHeader: [] }, { BearerAuth: [] }],
        parameters: [
          { name: "username", in: "path", required: true, schema: { type: "string", example: "hello" } },
          { name: "domain", in: "path", required: true, schema: { type: "string", example: "yourdomain.com" } },
          { name: "id", in: "path", required: true, description: "Gmail message ID", schema: { type: "string", example: "18f3b2a1c0d4e5f6" } },
        ],
        responses: {
          "200": {
            description: "Single message detail",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { $ref: "#/components/schemas/EmailMessage" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { description: "Message not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          "500": { $ref: "#/components/responses/ServerError" },
        },
      },
      delete: {
        tags: ["Inbox"],
        summary: "Delete a message",
        description: "Move a message to Gmail Trash by its message ID.",
        operationId: "deleteMessage",
        security: [{ ApiKeyHeader: [] }, { BearerAuth: [] }],
        parameters: [
          { name: "username", in: "path", required: true, schema: { type: "string", example: "hello" } },
          { name: "domain", in: "path", required: true, schema: { type: "string", example: "yourdomain.com" } },
          { name: "id", in: "path", required: true, description: "Gmail message ID", schema: { type: "string", example: "18f3b2a1c0d4e5f6" } },
        ],
        responses: {
          "200": {
            description: "Message moved to trash",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Email moved to trash" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "500": { $ref: "#/components/responses/ServerError" },
        },
      },
    },
  },
  components: {
    schemas: {
      EmailMessage: {
        type: "object",
        properties: {
          id: { type: "string", example: "18f3b2a1c0d4e5f6" },
          threadId: { type: "string", example: "18f3b2a1c0d4e5f6" },
          from: { type: "string", example: "sender@example.com" },
          to: { type: "string", example: "hello@yourdomain.com" },
          subject: { type: "string", example: "Welcome!" },
          snippet: { type: "string", example: "Hello there, this is a preview..." },
          body: { type: "string", example: "<p>Full email body HTML or plain text</p>" },
          date: { type: "string", format: "date-time", example: "2026-03-09T10:00:00.000Z" },
          labels: { type: "array", items: { type: "string" }, example: ["INBOX", "UNREAD"] },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: { type: "string", example: "Domain not allowed" },
        },
      },
    },
    securitySchemes: {
      ApiKeyHeader: {
        type: "apiKey",
        in: "header",
        name: "x-api-key",
        description: "Pass your API key in the x-api-key request header.",
      },
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        description: "Pass your API key as a Bearer token: Authorization: Bearer <key>.",
      },
    },
    responses: {
      Unauthorized: {
        description: "Missing API key",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            example: { success: false, error: "Missing API key. Provide it via x-api-key header, Authorization: Bearer <key>, or ?api_key= query param." },
          },
        },
      },
      BadRequest: {
        description: "Bad request - invalid format or domain not allowed",
        content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
      },
      ServerError: {
        description: "Internal server error",
        content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(openapiSpec);
}
