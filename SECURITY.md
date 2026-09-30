# Security Checklist

This project now includes baseline route protections, but a few security checks still belong in deployment and review workflow.

## Required Environment Rules

- Keep `SUPABASE_SERVICE_ROLE_KEY` only in server-side environment storage.
- Never place the service role key in `NEXT_PUBLIC_*`.
- Rotate any secret immediately if it was ever committed or shared.

## Supabase Dashboard Checks

Verify these directly in Supabase before production:

- Enable RLS on `products`, `categories`, and `transactions`.
- Review policies so only authenticated users can read/write what their role allows.
- Confirm admin-only operations are not available through anon/public policies.
- Review Auth rate-limit settings in Supabase for password sign-in and recovery flows.

## Secret Exposure Checks

Run these before release:

```powershell
git log --all -- .env.local
git log -S "SUPABASE_SERVICE_ROLE_KEY" --all --source --stat
git grep -n "SUPABASE_SERVICE_ROLE_KEY"
```

If a secret ever appeared in history, rotate it even if the file is deleted now.

## Manual XSS and Injection Checks

Test these flows with suspicious input:

- Product name: `<script>alert(1)</script>`
- Category name: `"><img src=x onerror=alert(1)>`
- Cashier/user display text: `' OR '1'='1`
- Transaction item names containing HTML-like strings

Expected result:

- UI renders the text literally.
- Print flow renders escaped text, not executable markup.
- API routes reject malformed requests without crashing.

## API Review Checklist

- Privileged routes require authenticated admin users.
- Mutating routes reject cross-origin browser requests.
- Session/admin routes return `429` when rate limits are exceeded.
- Response headers include frame, sniffing, referrer, and CSP protections.
