# Tender Days — Accounts & Billing setup

This adds passwordless sign-in (magic link), a 7-day free trial, and $7.99/month
billing. The private things people write stay on their device; only **email** and
**subscription status** are stored on the server.

Pieces: **Supabase** (accounts + a `subscriptions` table + Edge Functions),
**Stripe** (trial + payments), **Resend** (sends the sign-in / account emails).

> Do the whole thing in Stripe **Test mode** first. Switch to live only at the end.

## Key safety (read once)
- **Safe in the browser + GitHub** (these go in `config.js`): Supabase URL, Supabase **anon** key, Stripe **publishable** key.
- **Secret — only in Supabase → Edge Functions → Secrets, never in the repo:** Stripe **secret** key, Stripe **webhook signing secret**, Supabase **service_role** key.

## 1. Stripe
1. Create the account; toggle **Test mode**.
2. **Products → Add product** → "Tender Days", recurring **$7.99 / month**. Copy the **Price ID** (`price_…`).
3. **Settings → Billing → Customer portal** → enable, allow **cancellation**, save.
4. **Developers → API keys** → copy the **Secret key** (`sk_test_…`) for later.

## 2. Supabase
1. Create a project. From **Project Settings → API** copy: **Project URL**, **anon public** key, **service_role** key.
2. **Authentication → Providers → Email** → enable. Turn on "Email OTP / magic link".
3. **Authentication → URL Configuration** → add `https://tender-days.app` (and `http://localhost:8080` for testing) to redirect URLs.
4. **SQL Editor** → paste and run `supabase/schema.sql`.

### Point Supabase auth emails at Resend (so links come from your domain)
- In Resend, verify your sending domain and create an SMTP credential.
- In Supabase → **Authentication → Emails → SMTP settings**, enter Resend's SMTP host/port/user/pass and your From address (e.g. `hello@tender-days.app`).

## 3. Deploy the Edge Functions (Supabase CLI)
```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR-PROJECT-REF

# secrets (server-only)
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx
supabase secrets set STRIPE_PRICE_ID=price_xxx
supabase secrets set SITE_URL=https://tender-days.app
# SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically to functions.

supabase functions deploy create-checkout-session
supabase functions deploy create-portal-session
supabase functions deploy stripe-webhook --no-verify-jwt   # <-- must be --no-verify-jwt
```

## 4. Connect the Stripe webhook
1. Stripe → **Developers → Webhooks → Add endpoint**.
2. Endpoint URL: `https://YOUR-PROJECT-REF.functions.supabase.co/stripe-webhook`
3. Events: `checkout.session.completed`, `customer.subscription.created`,
   `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`.
4. Copy the **Signing secret** (`whsec_…`) and set it:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
   supabase functions deploy stripe-webhook --no-verify-jwt
   ```

## 5. Fill in the client
Edit **`config.js`** with your Supabase **URL** and **anon** key. Commit & redeploy to Netlify.
`app.html` already loads the Supabase client, `config.js`, and `auth-gate.js`, and shows the
sign-in / trial gate over the app until someone is signed in AND trialing/active.

## 6. Test (test mode)
1. Open the app, sign in with your email (check the emailed link).
2. Click **Start my 7-day free trial** → Stripe Checkout.
3. Use test card **4242 4242 4242 4242**, any future date, any CVC, any ZIP.
4. You return to the app and it unlocks; the `subscriptions` row shows `trialing`.
5. In the app, **Manage subscription** → cancel in the portal → the app locks again.

## 7. Go live
Switch Stripe to **Live mode**; recreate the product/price and webhook there; swap every key
(secret, publishable/anon where relevant, and the new `whsec_`) to live values; update
`config.js`. Then finalize `privacy.html` + `terms.html` with a lawyer, and make sure the
sign-up screen clearly discloses the auto-renewal terms (California law requires clear
pre-purchase disclosure and an easy cancel path — the Stripe portal covers cancellation).

## Files added
```
config.js                                  client-safe keys (you fill in)
auth-gate.js                               sign-in + subscription gate
supabase/schema.sql                        subscriptions table + RLS + signup trigger
supabase/functions/create-checkout-session/index.ts
supabase/functions/create-portal-session/index.ts
supabase/functions/stripe-webhook/index.ts
supabase/functions/_shared/cors.ts
```
