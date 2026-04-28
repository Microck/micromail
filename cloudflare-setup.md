# Cloudflare Backend Setup

This guide configures micromail at `mail.micr.dev` with the Cloudflare backend.

The canonical flow is:

```text
sender -> Cloudflare Email Routing -> micromail Email Worker -> Cloudflare D1 -> mail.micr.dev
```

`mail.micr.dev` hosts the micromail web app and API. It does not receive SMTP directly. Cloudflare receives inbound email for each domain and invokes the Email Worker.

## 1. Move Namecheap Domains To Cloudflare DNS

For each Namecheap domain:

1. Add the domain as a Cloudflare zone.
2. Copy the Cloudflare nameservers.
3. In Namecheap, replace the domain's nameservers with Cloudflare's nameservers.
4. Wait until Cloudflare marks the zone active.

Do not keep old MX records from Namecheap, Google, or another mail provider for domains that should use micromail.

## 2. Deploy The Email Worker

From this repo:

```bash
cd worker
npm install
npx wrangler login
npx wrangler d1 create micromail-mail
```

Copy the returned D1 `database_id` into `worker/wrangler.jsonc`.

Apply the D1 schema:

```bash
npx wrangler d1 migrations apply micromail-mail --remote
```

Set the domains the Worker should accept:

```bash
npx wrangler secret put ALLOWED_DOMAINS
```

Use your Namecheap domains as a comma-separated value:

```text
opendots.me,kefine.store,bdss.club,chiffn.site,relegendabl.es
```

Deploy:

```bash
npx wrangler deploy
```

## 3. Enable Cloudflare Email Routing

For each domain in Cloudflare:

1. Open **Email Routing**.
2. Enable Email Routing and let Cloudflare create its required MX/TXT records.
3. Add a catch-all custom address.
4. Route that catch-all address to the `micromail-email-worker` Worker.

Repeat this for:

- `opendots.me`
- `kefine.store`
- `bdss.club`
- `chiffn.site`
- `relegendabl.es`

After this, any address at those domains, such as `anything@opendots.me`, should be delivered to the Worker and stored in D1.

## 4. Configure The Micromail App

Set these environment variables wherever `mail.micr.dev` is deployed:

```env
EMAIL_BACKEND=cloudflare
CF_ACCOUNT_ID=your-cloudflare-account-id
CF_D1_DATABASE_ID=your-d1-database-id
CF_API_TOKEN=your-cloudflare-api-token
ALLOWED_DOMAINS=opendots.me,kefine.store,bdss.club,chiffn.site,relegendabl.es
API_KEY=your-secret-api-key
```

The Cloudflare API token must be able to query the D1 database. Keep it scoped to the account and database access micromail needs.

## 5. Point `mail.micr.dev` At The App

In the Cloudflare zone for `micr.dev`, add the DNS record for the web app host:

```text
Type: CNAME
Name: mail
Target: your-app-hostname
Proxy: enabled if your host supports Cloudflare proxying
```

If the app is hosted on a server with a fixed IP, use an `A` record instead.

## 6. Smoke Test

After DNS and deployment have propagated:

1. Send a test message to `hello@opendots.me`.
2. Open `https://mail.micr.dev`.
3. Select `opendots.me`.
4. Enter `hello`.
5. Confirm the message appears.

If the message does not appear, check in this order:

1. Cloudflare Email Routing activity for the domain.
2. Worker logs with `npx wrangler tail`.
3. D1 rows with:

   ```bash
   npx wrangler d1 execute micromail-mail --remote --command "SELECT to_email, subject, received_at FROM emails ORDER BY received_at DESC LIMIT 5"
   ```

4. The micromail app environment variables on `mail.micr.dev`.
