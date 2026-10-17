# Source basis / implementation vs external facts

## Local task sources
- Uploaded smart_samsung_optic_webapp_v6_netlify_github.zip: inspected actual HTML/CSS/assets/server code.
- Uploaded Homepage.zip and October promotional image: existing style/assets preserved through v6 source.
- User reported looping consult/inquiry submission and wanted OTP/delete. Production failing request traces were not supplied; exact live root cause was not conclusively identified.

## External official documentation reviewed 2026-10-17
- https://docs.netlify.com/build/data-and-storage/netlify-blobs/ (site-wide persistence, strong consistency, conditional writes)
- https://github.com/netlify/primitives/blob/main/packages/blobs/CHANGELOG.md (SDK 11.1.4)
- https://docs.netlify.com/build/functions/scheduled-functions/ (production schedule, UTC and execution limits)
- https://docs.netlify.com/build/functions/environment-variables/ (server secrets/redeploy)
- https://docs.netlify.com/manage/accounts-and-billing/billing/resume-paused-projects/ (usage-limit pauses)
- https://supabase.com/docs/guides/deployment/going-into-prod (7-day low-activity free-project pausing; Pro not paused for inactivity)
- https://resend.com/docs/api-reference/errors (test recipient restriction, mail API errors)
- https://resend.com/docs/dashboard/domains/introduction (verified production sender)

## Design decision
Keep the existing small-data Netlify store, no Supabase migration or dummy keepalive. Daily backup/cleanup is application maintenance, not a guarantee against platform suspension.
