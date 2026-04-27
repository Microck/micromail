import { NextResponse } from "next/server";

export async function GET() {
  const html = `<!doctype html>
<html>
  <head>
    <title>micromail API Docs</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
    <style type="text/css">
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Inter', sans-serif; background: #fafaf9; }
    </style>
  </head>
  <body>
    <div id="app"></div>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
    <script type="text/javascript">
      Scalar.createApiReference('#app', {
        "_integration": "nextjs",
        "url": "/api/openapi.json",
        "darkMode": false,
        "layout": "modern",
        "hideDownloadButton": false,
        "theme": "default",
        "customCss": "\\n        :root {\\n            --scalar-color-1: #1c1917;\\n            --scalar-color-2: #78716c;\\n            --scalar-color-3: #a8a29e;\\n            --scalar-color-accent: #1c1917;\\n        }\\n        .scalar-app {\\n            background: #fafaf9 !important;\\n        }\\n    "
      })
    </script>
  </body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
}
