# micromail - Temporary Email Service

A Next.js temporary email service that uses Gmail API as the backend. Configure your own domains and receive emails instantly.

## How It Works

1. You own one or more domains
2. Set up those domains' MX records to point to Google (Google Workspace / Gmail)
3. Create a Google Cloud service account with Gmail API access
4. All emails sent to `anything@yourdomain.com` arrive in the Gmail inbox
5. This app reads them via the Gmail API and presents them as temporary mailboxes

## Prerequisites

- A Google Cloud project with Gmail API enabled
- A Google Workspace domain with a catch-all email routing (or a regular Gmail account with domain setup)
- A service account with domain-wide delegation for the Gmail API

## Setup

### 1. Google Cloud Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable the **Gmail API**
4. Go to **IAM & Admin > Service Accounts**
5. Create a service account
6. Create a key (JSON) and download it
7. In Google Workspace Admin, enable **Domain-wide Delegation** for the service account client ID with scope: `https://www.googleapis.com/auth/gmail.modify`

### 2. Domain Configuration

Point your domain's MX records to Google:

```
Priority  Mail Server
1         ASPMX.L.GOOGLE.COM
5         ALT1.ASPMX.L.GOOGLE.COM
5         ALT2.ASPMX.L.GOOGLE.COM
10        ALT3.ASPMX.L.GOOGLE.COM
10        ALT4.ASPMX.L.GOOGLE.COM
```

Set up a catch-all routing rule in Google Workspace Admin so all emails to `*@yourdomain.com` go to a single Gmail user.

### 3. Environment Configuration

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

```
# Paste the full service account JSON
GOOGLE_SERVICE_ACCOUNT={"type":"service_account",...}

# The Gmail address that receives all catch-all emails
GMAIL_USER=admin@yourdomain.com

# Domains you want to allow (comma-separated)
ALLOWED_DOMAINS=yourdomain.com,yourotherdomain.com

# Secret API key for authentication (optional - leave empty to disable auth)
API_KEY=your-secret-api-key-here
```

### 4. Install & Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## API Endpoints

### List Allowed Domains
```
GET /api/domains
```

### Get Inbox Messages
```
GET /api/i/{username}/{domain}?limit=50
```

### Get Single Message
```
GET /api/i/{username}/{domain}/{id}
```

### Delete Message
```
DELETE /api/i/{username}/{domain}/{id}
```

### OpenAPI Spec
```
GET /api/openapi.json
```

### Interactive API Docs
```
GET /docs
```

## Authentication

All API endpoints support authentication via:

1. `x-api-key` header
2. `Authorization: Bearer <key>` header
3. `?api_key=` query parameter

Set `API_KEY` in your environment. Leave empty to disable authentication.

## Deployment

Works on Vercel, Netlify, or any Node.js hosting:

```bash
npm run build
npm start
```

For Vercel, just connect the repo and add the environment variables.
