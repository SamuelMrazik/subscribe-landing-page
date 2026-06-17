# Subscribe Landing Page

Minimal landing page with Meta Pixel (browser) and Conversions API (server) tracking.

Tracked events:

- **PageView** — Meta Pixel on load
- **ViewContent** — Pixel + CAPI on load
- **Lead** — Pixel + CAPI on subscribe
- **CompleteRegistration** — Pixel + CAPI on subscribe (includes hashed email)

Pixel ID: `2411788459345520`

## Enter your CAPI access token

### Local development

1. Copy the example env file:

   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and paste your token:

   ```env
   META_CAPI_ACCESS_TOKEN=paste_your_token_here
   ```

3. Run the local dev server (loads `.env.local` automatically):

   ```bash
   npx vercel dev
   ```

### Production (Vercel)

1. Open [Vercel Project Settings → Environment Variables](https://vercel.com/samuel-mrazs-projects/subscribe-landing-page/settings/environment-variables)
2. Add:

   | Name | Value |
   |------|-------|
   | `META_CAPI_ACCESS_TOKEN` | Your Meta access token |
   | `META_PIXEL_ID` | `2411788459345520` (optional) |

3. Optional for testing in Meta Events Manager:

   | Name | Value |
   |------|-------|
   | `META_TEST_EVENT_CODE` | Code from Meta Test Events tool |

4. Redeploy after adding variables (or push to `main` for auto-deploy).

## Local preview (static only, no CAPI)

```bash
npx serve .
```

Note: CAPI requires `npx vercel dev` so `/api/capi` runs locally.

## Deploy

Connected to Vercel — pushes to `main` deploy automatically.

Live URL: https://subscribe-landing-page.vercel.app
