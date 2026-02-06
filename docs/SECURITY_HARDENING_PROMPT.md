# Cursor prompt: Production security hardening (Next.js on Vercel)

**Copy the block below into Cursor as your instruction.** This prompt encodes the full scope of a production security hardening task and the exact fixes to implement—nothing more, nothing less.

---

## PROMPT (paste this into Cursor)

```
You are a senior Next.js security engineer performing production hardening.

Context:
- A full CLI security audit (testssl, nmap, whatweb, lighthouse, httpx, hakrawler) was run on the Vercel-hosted Next.js site: https://fair-price-predictor.vercel.app
- Only the following findings are real and in scope. Implement fixes ONLY for items 1–5.

Project layout (use these paths):
- Next.js app: web/ (App Router)
- Config: web/next.config.js — use headers() for CSP and COOP
- API routes: web/src/app/api/**/route.ts (e.g. comments, feedback, admin, analytics, upvote)
- No middleware file exists; do not add global CORS via middleware
- Email exposure: web/src/components/Footer.tsx (mailto link), web/src/app/contact/page.tsx (plain emails in HTML), web/src/app/admin/page.tsx (mailto in admin UI)

Confirmed findings and required fixes:

1) CORS is globally open (Access-Control-Allow-Origin: *)
   - Remove any global CORS. Apply CORS ONLY to API routes.
   - Allowed origin: https://fair-price-predictor.vercel.app only.
   - Handle OPTIONS preflight; include Vary: Origin in responses.
   - Implement in each API route handler (or a shared helper used by API routes only), not in next.config.js for all routes.

2) Content-Security-Policy is missing
   - Add via web/next.config.js headers() as Content-Security-Policy-Report-Only (not enforcing yet).
   - Use a safe, permissive baseline suitable for Google AdSense (e.g. script-src 'self' https://pagead2.googlesyndication.com https://cloud.umami.is; other directives as needed for ads and existing scripts). Do not block ads or break the site.

3) Cross-Origin-Opener-Policy is missing
   - Add via web/next.config.js headers(): Cross-Origin-Opener-Policy: same-origin

4) Cross-Origin-Resource-Policy (CORP)
   - Optional defense-in-depth. Add only if safe for third-party embeds (e.g. AdSense, Umami). If in doubt, omit or use a value that does not break embeds.

5) Plain-text email addresses exposed in HTML/meta
   - Found by whatweb. Obfuscate or replace without harming SEO.
   - Footer: mailto link with plain address — keep contact possible (e.g. mailto or click-to-reveal), but avoid raw address in static HTML where crawlers see it.
   - Contact page: multiple emails in plain text — use obfuscation (e.g. JS-reveal, or replace with a single “Contact” form link) so the address is not in initial HTML/meta.
   - Admin page: mailto for reply — ensure it’s not in public meta; obfuscation optional if only in admin UI.

Explicit non-issues (DO NOT modify):
- TLS, HTTPS, HSTS, cipher suites
- HTTP methods (GET/HEAD/OPTIONS)
- Compression/BREACH (low risk; no change)
- Trusted Types or other advanced JS hardening
- Vercel infrastructure headers (x-vercel-*, x-matched-path) — cannot be removed; document only if needed

Constraints:
- Do NOT add unrelated security changes.
- Do NOT over-harden.
- Do NOT break Google AdSense or site functionality.

Deliverables:
1) Exact code changes (file paths and snippets).
2) Brief explanation per fix.
3) No assumptions beyond what is stated here.
```

---

## How to use

1. Open Cursor in this repo.
2. Start a new chat (or thread) and paste the entire **PROMPT** block above (from "You are a senior Next.js security engineer" through "No assumptions beyond what is stated here").
3. Let the agent implement only fixes 1–5; reject any change that adds unrelated hardening or touches TLS/HSTS/methods/Vercel headers.

## Cross-check (for your reference)

| # | Finding            | Fix in prompt | Status   |
|---|--------------------|---------------|----------|
| 1 | Open CORS          | CORS only on API, origin = site | ✅ |
| 2 | Missing CSP        | Report-Only in next.config.js, AdSense-safe | ✅ |
| 3 | Missing COOP       | same-origin in next.config.js | ✅ |
| 4 | CORP (optional)    | Optional, only if safe for embeds | ✅ |
| 5 | Email in HTML       | Obfuscate/replace, SEO-safe | ✅ |
| 6 | Vercel headers     | Document, do not change | ✅ (no fix) |
| 7 | TLS/HSTS/methods   | No change    | ✅ (out of scope) |

This prompt is a controlled security hardening task, not a general refactor.
