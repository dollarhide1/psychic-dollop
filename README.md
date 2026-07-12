# Tender Days

A gentle, private wellness companion for the early days of motherhood — breathing, calming
sounds, journaling, letters & moments for your little one (with printable keepsake PDFs),
CBT-style reframing worksheets, a personal support-circle map, and five soft pastel themes.

This repository is a **static site** — no build step, no server. It's ready to deploy to
Netlify (or any static host) as-is.

## Structure

```
.
├── index.html            Landing / marketing page (site entry point)
├── app.html              The Tender Days app itself  (also at /app)
├── privacy.html          Privacy Policy   (TEMPLATE — replace, see notes below)
├── terms.html            Terms of Service (TEMPLATE — replace, see notes below)
├── 404.html              Custom not-found page
├── favicon.svg           Vector favicon (the orb)
├── favicon.ico           Fallback favicon
├── favicon-16x16.png / favicon-32x32.png
├── apple-touch-icon.png  Home-screen icon (iOS)
├── icon-192.png / icon-512.png   PWA / manifest icons
├── og-image.png          Social share image (1200×630)
├── site.webmanifest      PWA manifest (installable app)
├── netlify.toml          Netlify config (publish dir, headers, /app clean URL)
├── _redirects            Netlify redirects (clean URL for the app)
├── robots.txt            Search-engine directives
├── sitemap.xml           Sitemap
└── .gitignore
```

## Deploy to Netlify

**Option A — from GitHub (recommended)**
1. Create a new GitHub repo and push these files:
   ```bash
   git init
   git add .
   git commit -m "Tender Days"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
2. In Netlify: **Add new site → Import an existing project → GitHub**, pick the repo.
3. Build command: *(leave blank)*.  Publish directory: `.`  → **Deploy**.

**Option B — drag & drop**
Zip the folder (or drag it) into the Netlify **Deploys** dropzone. Done.

After deploying, set your custom domain in Netlify, then **find-and-replace
`YOUR-DOMAIN.netlify.app`** across `index.html`, `robots.txt`, and `sitemap.xml`, and the
placeholder email `hello@YOUR-DOMAIN.com`.

## Before you charge money — please read

This project was built to keep you on the right side of the rules we care about:

- **It's a wellness companion, not medical care.** Keep the language "support/comfort,"
  never "treats/cures postpartum depression." That framing keeps it out of medical-device
  and false-advertising territory.
- **Private by default.** The app stores nothing on a server; entries live in the browser
  session and are exported via PDF. The Privacy button includes an **opt-in** cloud-sync
  consent flow whose upload/download is a clearly-marked stub — wire your backend
  (e.g., Supabase) into `syncToCloud()` / `loadFromCloud()` in `app.html` if you add sync.
- **`privacy.html` and `terms.html` are TEMPLATES**, not legal advice. Have a qualified
  attorney review and finalize them (especially the medical disclaimer, limitation of
  liability, and subscription/refund terms) before publishing or selling.
- **Testimonials on the landing page are placeholders** — replace them with genuine,
  verifiable reviews (the FTC requires testimonials to be real).
- **Payments aren't wired.** The "Start free" buttons currently open the app (`app.html`).
  Connect your real checkout / trial flow (e.g., Stripe Checkout or an app-store trial).
- **Fonts** load from Google Fonts. For a truly no-third-party page, self-host the
  Fraunces and Nunito Sans files and update the `<link>` tags.

## Local preview

Any static server works, e.g.:
```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## License / ownership

© Tender Days. All rights reserved. This is a commercial product, not open source.
