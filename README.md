# Wollemi Group website

Static site for wollemigroup.co, built by `node build.js` into `public/` and hosted on Cloudflare Pages. The enquiry form is a Pages Function (`functions/api/enquiry.js`) that emails through Resend, with Cloudflare Turnstile for spam. See `CLAUDE.md` for how changes are made.
