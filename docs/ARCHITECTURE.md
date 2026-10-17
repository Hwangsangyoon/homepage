# SMART OPTIC v6.0.0 — structure and operating boundaries

## Components
- Public entry: index.html / app.js / v3-base.css / enhancements.css.
- Public build: scripts/build.mjs copies an explicit allowlist to dist. Server, tests, documentation, credentials, SQL, and backups are excluded.
- API: Netlify Functions v2 path /api/optic; image path /api/media/:key.
- Persistence: Netlify Blobs site-wide stores optic-v6-data and optic-v6-media. Strong reads and ETag conditional writes protect per-object updates. Multiple objects are not a database transaction.
- Default bootstrap: 1111 remains until changed but also requires an owner-only OPTIC_SETUP_KEY. Personal intake, import/backup, and messages are locked until a new password is set. Intake also needs operator-reviewed privacy notice.
- Authentication: salted scrypt password hash, random session token, SHA256 token key, 8-hour session, HttpOnly+Secure+SameSite=Strict cookie. Session generation changes on password update/reset. No browser-stored passwords.
- Recovery: Netlify owner sets a fresh OPTIC_RESET_VERSION and redeploys; owner key + new password are checked server-side. No reset email or Supabase.
- Secret posts: only whitelisted metadata is returned publicly. Optional post password uses salted scrypt. Correct password returns body/reply only, not contact details. Authenticated non-default admin can read all and reply.
- Photos: client re-encodes JPG to <=2000px and strips EXIF; server accepts JPG/PNG/WEBP <=2MiB after signature checks. No SVG uploads, no arbitrary remote URLs. Image store contains only public website images.
- Concurrency: edits send observed ETag; conflicts return409. Message idempotency uses onlyIfNew to avoid duplicate dispatch. No automatic order-to-stock deduction.
- Abuse controls: same-origin JSON writes, Netlify IP/domain rate-limit plus per-IP/action persistent windows. Expired session/rate-limit metadata cleanup daily. Customer retention is not automatic; operator must define and execute it.
- Messaging: optional SOLAPI HMAC server connection. TEST != real dispatch; manual != delivery verification; ACCEPTED != DELIVERED. UNKNOWN must be reconciled before retry. SMS/LMS/approved Alimtalk only, no unvalidated arbitrary API URL proxy.

## Stored keys
config/public, config/seed; auth/admin; sessions/<hash>; limits/<bucket>/<hash>; records/<collection>/<id>; posts/<time>-<uuid>; messages/<id>.

## Operations
GitHub code updates redeploy to the SAME Netlify project. Different projects have different stores. Drafts of the same project may share production data. Code rollback does not rollback content. Preserve old systems until export/import is verified.

## Backup and migration limits
Admin JSON backup includes personal records, private post hashes, settings, and message logs; protect it. No session token or admin password is exported. Photos are references, not image bytes. Import is additive and deduplicated, not a full transactional restore. Settings, image binary transfer, and complete message-log restoration require separate review. V3 inquiries/reservations/message history become admin-only legacy collections. V3 notice active=false maps to v6 ordinary published notice; a v6 hidden event remains hidden.

## Security boundaries
Project owners/authorized platform collaborators can access backend data. Protect GitHub/Netlify accounts with MFA and least privilege. This package is not an audited medical records or accounting system. Do not collect unnecessary health data, identifying public titles, or publish personal images. An audit/penetration test and legal compliance review have not been performed.

## Dependency build
Netlify installs the pinned direct dependency @netlify/blobs from npm. The application tests use a memory adapter, not the provider SDK. A live Netlify build, storage operations, GitHub permissions, DNS/TLS, and paid messaging must be verified in the owner's account.
