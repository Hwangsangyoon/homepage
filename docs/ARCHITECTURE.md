# v7 Architecture and operating boundaries

## Request path
Browser -> same-origin /api/optic -> Netlify Function -> site-scoped private Netlify Blobs.
Images -> /api/media/:key using existing optic-v6-media. Uploaded images are public website assets; do not upload IDs/medical documents.
OTP request -> configured owner only -> Resend API using server-only key. No Netlify Identity/Supabase needed.

## Persistence
`optic-v6-data` and `optic-v6-media` are deliberately unchanged. getStore strong consistency; conditional ETag writes avoid stale overwrite for mutable records.
Site-wide store means production and draft share data. No test seeding against live projects.
No cross-record transactional invariant: orders and inventory are independently maintained; no ACID stock/order decrement guarantee.
Small shop use, mostly reads, low write concurrency. SDK 11.1.4 documented conditional mutations.

## Secrets/auth
Server-generated random HMAC secret, no fixed passwords. OTP code stored only as HMAC, owner email read from env.
Server sessions stored by hashed random token; browser HttpOnly SameSite=Strict Secure cookie (HTTPS).
5 attempts / 600 seconds / owner/global/IP throttles. Mail key/from access configured by owner, never client-visible.
Only authenticated owner CRUD, export, trash, restore, permanent purge and messages.
Public titles are intentionally public; phone/name/private content filtered. Private post password scrypt with salt. Inline scripts forbidden by CSP.

## Robustness
Client AbortController 20s, no background automatic retries of POST. Timeout does not prove server rollback.
The same form keeps a UUID request key. Server atomic onlyIfNew plus HMAC content fingerprint returns receipt once; deletion keeps non-PII tombstone to stop retry resurrection.
Storage operations bounded 8 seconds each, batched reads of12, explicit size/record ceilings. Total provider/platform function timeout still applies.
Logs carry safe codes/request IDs, not OTP/password/key. Provider dispatch UNKNOWN must be reconciled, never blindly resent.

## Backups/trash
Read-only logical export of active records/posts/messages/config. No image binaries or auth secrets. 4.5MB export ceiling, per-collection import ceiling3000.
Daily UTC19:17(KST04:17) on production only; keep7 dates. Same-project snapshot is not offsite backup or ACID point-in-time recovery.
30day soft delete with explicit restore/purge and tombstones. Prior snapshots/owner downloaded backups can still contain older data, retention must be managed.
Scheduled invocation is subject to platform time/resource limits. Verify lastCompletedAt; manual backup available.

## Scaling
Move to a managed relational database when bulk data, multiple staff writes, complex joins, financial integrity or automated stock deduction needs transactions. No daily fake query to promise a free-tier uptime SLA.
