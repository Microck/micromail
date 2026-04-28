# micromail Cloudflare Email Worker

This Worker receives mail from Cloudflare Email Routing, parses it with `postal-mime`, and writes messages into the D1 table that the micromail Next.js app reads when `EMAIL_BACKEND=cloudflare`.

## Setup

1. Install Worker dependencies:

   ```bash
   cd worker
   npm install
   ```

2. Create the D1 database:

   ```bash
   npx wrangler d1 create micromail-mail
   ```

3. Copy the returned `database_id` into `worker/wrangler.jsonc`.

4. Apply the schema:

   ```bash
   npx wrangler d1 migrations apply micromail-mail --remote
   ```

5. Deploy the Worker:

   ```bash
   npx wrangler deploy
   ```

6. In Cloudflare Email Routing for each domain, add a catch-all custom address and route it to this Worker.

## Runtime Variables

Set `ALLOWED_DOMAINS` as a Worker variable when you want the Worker itself to reject domains outside your micromail instance:

```bash
npx wrangler secret put ALLOWED_DOMAINS
```

Use a comma-separated value such as:

```text
opendots.me,kefine.store,bdss.club,chiffn.site,relegendabl.es
```

Attachments are parsed by `postal-mime` but are not stored yet because the current micromail API only exposes message body content.
