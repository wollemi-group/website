# Wollemi Group website

This is the website for Wollemi Group Pty Ltd (Melbourne builders, building permits, NDIS home modifications, civil and concrete works). Live at wollemigroup.co; wollemihomes.com.au redirects here. Hosted on Cloudflare Pages from this repository.

## How it is built

- `build.js` writes every page into `public/`. **Edit `build.js`, then run `node build.js`.** Never edit the files in `public/` by hand, they are overwritten.
- Pages: Home, Building, Granny flats, Building permits, NDIS modifications, Civil and concrete, Projects, About, Contact.
- Photos live in `public/assets/img/` (`jobs/` for job photos). Web size only: about 1600 px on the long side, JPG.
- `functions/api/enquiry.js` sends the contact form by email. Do not change it without Runs Itself; keys live in Cloudflare, never here.

## House rules for changes

1. Plain Australian English, short sentences. Write as Wollemi: "we". No made-up numbers, awards or claims.
2. Real photos only, captioned with the suburb (never a street address).
3. Say nothing about registrations, licences or NDIS provider status unless Helen or Ben ask for it.
4. Every change goes on a branch and a pull request. Helen or Ben check the preview link, then approve. Nothing goes live without that.
5. Check every changed page at phone width.
6. No keys, passwords or customer details in this repository, ever.

## Who to ask

Runs Itself, hello@runsitself.com.au, 0424 551 551.
