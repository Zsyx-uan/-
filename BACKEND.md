# Cloud backend handoff (Supabase)

The current MVP is fully usable in one browser: routes, merchants, offers, coupon issuance, and redemption are persisted in `localStorage`.

For cross-device operation, replace `src/operations.js` storage methods with a Supabase data provider. The target tables are:

- `merchants(id, name, category, contact, status, route_id, note, created_at)`
- `routes(id, title, duration, stops, status, created_at)`
- `offers(id, merchant_id, route_id, title, price, original_price, quota, active, created_at)`
- `coupons(id, code, phone, visitor, offer_id, merchant_id, status, created_at, redeemed_at)`
- `profiles(id, role, merchant_id, display_name)`

Recommended roles:

- `admin`: full operation access
- `merchant`: access only to its own merchant, offers and coupons
- `visitor`: anonymous coupon issuance only

## Environment variables

Create `.env.local` from `.env.example` after creating a Supabase project:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Do not put the Supabase service-role key in the browser.

## Deployment note

GitHub Pages is suitable for a public preview only and may be unreliable on mainland Chinese networks. For production, deploy the same Vite build to Tencent Cloud CloudBase / Alibaba Cloud OSS + CDN, and connect a domain with the required ICP process.
