<p align="center">
  <img src="public/logo.png" alt="micromail" width="480">
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-mit-000000?style=flat-square" alt="license badge"></a>
</p>


---

`micromail` is a self-hosted temporary email service built with Next.js and the Gmail API. you point your domains at Google, and it turns a single Gmail inbox into unlimited disposable addresses. no sign-up, no tracking, no third-party mail provider.

<p align="center">
  <img src="public/banner.png" alt="micromail banner">
</p>


## how it works

1. you own one or more domains
2. point their MX records at Google (Google Workspace or a catch-all Gmail setup)
3. create a Google Cloud service account with Gmail API access and domain-wide delegation
4. all mail to `anything@yourdomain.com` lands in one Gmail inbox
5. micromail reads it via the Gmail API and presents each `user@domain` as a separate temporary mailbox

the frontend polls every 5 seconds so new messages appear automatically. the API is fully documented with an interactive Scalar docs page at `/docs`.

## features

- multi-domain support out of the box - add as many domains as you want, just update `.env`
- real-time inbox polling without websockets
- random username generation
- full message body rendering (HTML and plain text)
- delete messages (moves to Gmail trash)
- API key authentication (header, bearer token, or query param)
- interactive API docs via Scalar at `/docs`
- OpenAPI 3.1 spec at `/api/openapi.json`
- light mode, clean UI

## prerequisites

- a Google Cloud project with the Gmail API enabled
- a Google Workspace domain with catch-all email routing (or a regular Gmail account with domain setup)
- a service account with domain-wide delegation for scope `https://www.googleapis.com/auth/gmail.modify`

## setup

### 1. Google Cloud

1. go to [Google Cloud Console](https://console.cloud.google.com/)
2. create a project (or select existing)
3. enable the **Gmail API**
4. go to **IAM & Admin > Service Accounts**
5. create a service account
6. create a JSON key and download it
7. in Google Workspace Admin, enable **Domain-wide Delegation** for the service account client ID with scope `https://www.googleapis.com/auth/gmail.modify`

### 2. domain MX records

point your domain at Google:

| priority | mail server |
| --- | --- |
| 1 | `ASPMX.L.GOOGLE.COM` |
| 5 | `ALT1.ASPMX.L.GOOGLE.COM` |
| 5 | `ALT2.ASPMX.L.GOOGLE.COM` |
| 10 | `ALT3.ASPMX.L.GOOGLE.COM` |
| 10 | `ALT4.ASPMX.L.GOOGLE.COM` |

set up a catch-all routing rule in Google Workspace Admin so all mail to `*@yourdomain.com` goes to a single Gmail user.

### 3. environment

copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

```env
# paste the full service account JSON
GOOGLE_SERVICE_ACCOUNT={"type":"service_account",...}

# the Gmail address that receives all catch-all emails
GMAIL_USER=admin@yourdomain.com

# domains you want to allow (comma-separated)
ALLOWED_DOMAINS=yourdomain.com,yourotherdomain.com

# secret API key for authentication (leave empty to disable)
API_KEY=your-secret-api-key-here
```

### 4. install and run

```bash
npm install
npm run dev
```

open `http://localhost:3000`

## api

| endpoint | method | description |
| --- | --- | --- |
| `/api/domains` | `GET` | list allowed domains |
| `/api/i/{username}/{domain}` | `GET` | get inbox messages |
| `/api/i/{username}/{domain}/{id}` | `GET` | get a single message |
| `/api/i/{username}/{domain}/{id}` | `DELETE` | delete a message (move to trash) |
| `/api/openapi.json` | `GET` | OpenAPI 3.1 spec |
| `/docs` | `GET` | interactive Scalar API docs |

### authentication

all API endpoints accept an API key via:

- `x-api-key` header
- `Authorization: Bearer <key>` header
- `?api_key=` query parameter

leave `API_KEY` empty in your environment to disable authentication.

## deployment

works on Vercel, Netlify, or any Node.js host:

```bash
npm run build
npm start
```

for Vercel, connect the repo and add the environment variables.

## architecture

micromail supports two email backends. pick the one that fits your setup.

### gmail backend (default)

uses a Google service account to read mail from a catch-all Gmail inbox via the Gmail API. best if you already use Google Workspace.

```mermaid
flowchart LR
    sender[sender on the internet]
    domain[your domain]
    gmail[Google Gmail inbox]
    mm[micromail]
    api[api/i]
    docs[docs]

    sender -->|SMTP| domain
    domain -->|MX records| gmail
    gmail -->|Gmail API, service account| mm
    mm --> api
    mm --> docs
```

### cloudflare email workers backend

uses [Cloudflare Email Routing](https://developers.cloudflare.com/email-routing/) and a [Cloudflare Worker](https://developers.cloudflare.com/workers/) to receive and store email directly. no Gmail, no Google Workspace, no service account. inspired by [cloud-mail](https://github.com/maillab/cloud-mail).

```mermaid
flowchart LR
    sender[sender on the internet]
    domain[your domain on Cloudflare]
    cf[Cloudflare Email Routing]
    worker[Email Worker, postal-mime]
    db[Cloudflare D1]
    r2[Cloudflare R2 attachments]
    mm[micromail]
    api[api/i]
    docs[docs]

    sender -->|SMTP| domain
    domain -->|MX records| cf
    cf -->|email event| worker
    worker -->|parse and store| db
    worker -.->|attachments| r2
    db -->|D1 HTTP API| mm
    r2 -.->|R2 API| mm
    mm --> api
    mm --> docs
```

**how it works:**

1. your domain uses Cloudflare DNS with Email Routing enabled
2. Cloudflare receives inbound email and forwards it to a Worker via the `email()` handler
3. the Worker parses the raw email with `postal-mime`, stores it in D1 (metadata + body), and uploads attachments to R2
4. micromail reads from D1 via its REST API instead of the Gmail API

**what you need:**

- a Cloudflare account with Email Routing enabled for your domain
- a Cloudflare D1 database for mail storage
- a Cloudflare R2 bucket for attachments (optional)
- the email Worker deployed alongside micromail (or as a separate Worker)

set `EMAIL_BACKEND=cloudflare` in your environment to switch from Gmail to Cloudflare.

See [cloudflare-setup.md](cloudflare-setup.md) for the Namecheap-to-Cloudflare setup flow and the deployable Email Worker in [worker/](worker/).

## license

[mit license](LICENSE)
