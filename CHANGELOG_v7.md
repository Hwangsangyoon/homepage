# v7.0.0 · 2026-10-17

## Added
- Owner email allowlist, 6-digit OTP, HMAC verification, one-use CAS, 10-minute expiry, five attempts, 60-second resend.
- HttpOnly secure owner session, logout all, owner-email change invalidation.
- Trash/restore/purge for records, customer posts and message logs.
- JSON backup, 7-day per-day private snapshots, scheduled expired auth cleanup and 30-day trash purge.

## Fixed
- Form double-submit: busy guard plus per-form requestKey, atomic store onlyIfNew.
- Browser timeout 20s, storage operation timeout 8s; input remains on failure, no automatic POST loop.
- Stale async render guard and form field access through elements.
- Pagination/list ordering; limited-concurrency data fetch.
- Provider mail error codes, data recovery safeguards and delete/retry tombstones.

## Compatibility
- Preserve v6 store names/IDs, images and v3-derived navy/gold/ivory styling.
- Supabase is not required. No SQL/RLS/password-recovery redirect steps.
- Replace 1111/OPTIC_SETUP_KEY login with Resend-backed OTP. One-time sender configuration required.
- Existing SOLAPI test/manual/live message modes retained; accepted does not mean delivered.
- No automatic import from old Supabase. No external account changes performed.
