// Wollemi Group: enquiry form, server side.
// Cloudflare Pages Function at POST /api/enquiry.
//
// Checks the form, then emails it to Wollemi through Resend. Nothing is stored here.
//
// Settings (Cloudflare Pages > Settings > Variables and secrets):
//   RESEND_API_KEY     secret. A Resend key with sending access for the domain wollemigroup.co.
//   TURNSTILE_SECRET   secret. The form must carry a valid Cloudflare Turnstile token when this is set.
//   ENQUIRY_TO         optional. Where enquiries go. Default admin@wollemigroup.co.
//   ENQUIRY_FROM       optional. Default "Wollemi Group website <website@wollemigroup.co>".
// With no RESEND_API_KEY this answers "offline" and the page tells the visitor to call or email instead.

const MAX_BODY_BYTES = 8000;
const EMAIL = /^(?=.{1,64}@)[A-Za-z0-9_%+-]+(?:\.[A-Za-z0-9_%+-]+)*@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;
const TYPES = new Set(["New home", "Granny flat", "Renovation or extension", "NDIS home modification", "Development", "Commercial fit-out", "Building permit or inspection", "Vehicle turntable", "Civil, council or concrete works", "Something else"]);
const ROLES = new Set(["", "Owner", "Builder", "Designer or OT", "Other"]);

const json = (body, status) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

function sameSite(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try { return new URL(origin).host === new URL(request.url).host; } catch (e) { return false; }
}

const field = (v, max) => (typeof v === "string" ? v.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "").trim().slice(0, max) : "");

async function turnstileOk(token, request, env) {
  if (!env.TURNSTILE_SECRET) return true;
  if (typeof token !== "string" || token.length < 10 || token.length > 2200) return false;
  try {
    const form = new FormData();
    form.append("secret", env.TURNSTILE_SECRET);
    form.append("response", token);
    form.append("remoteip", request.headers.get("cf-connecting-ip") || "");
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
    const data = await res.json();
    return data && data.success === true && (!data.hostname || data.hostname === new URL(request.url).host);
  } catch (e) {
    return false;
  }
}

export async function onRequestPost({ request, env }) {
  if (!sameSite(request)) return json({ error: "forbidden" }, 403);
  if (!env.RESEND_API_KEY) return json({ error: "offline" }, 503);

  if (Number(request.headers.get("content-length") || 0) > MAX_BODY_BYTES) return json({ error: "bad request" }, 413);
  let body;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return json({ error: "bad request" }, 413);
    body = JSON.parse(text);
  } catch (e) { return json({ error: "bad request" }, 400); }

  // A hidden field real visitors never fill in. Anything that fills it is a robot: say thanks and drop it.
  if (field(body.website, 200)) return json({ ok: true }, 200);

  const e = {
    name: field(body.name, 120),
    phone: field(body.phone, 40),
    email: field(body.email, 200),
    suburb: field(body.suburb, 80),
    type: field(body.type, 60),
    role: field(body.role, 40),
    message: field(body.message, 3000),
    received: new Date().toISOString(),
  };
  const errors = {};
  if (!e.name) errors.name = "missing";
  if (!e.phone) errors.phone = "missing";
  if (!EMAIL.test(e.email)) errors.email = "invalid";
  if (!TYPES.has(e.type)) errors.type = "invalid";
  if (!ROLES.has(e.role)) errors.role = "invalid";
  if (!e.message) errors.message = "missing";
  if (Object.keys(errors).length) return json({ error: "invalid", fields: errors }, 422);

  if (!(await turnstileOk(body.token, request, env))) return json({ error: "check" }, 403);

  const lines = [
    "Name: " + e.name,
    "Phone: " + e.phone,
    "Email: " + e.email,
    "Suburb of the job: " + (e.suburb || "-"),
    "Type of work: " + e.type,
    "They are: " + (e.role || "-"),
    "",
    "About the job:",
    e.message,
    "",
    "Sent from the enquiry form on wollemigroup.co, " + e.received,
  ];
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: "Bearer " + env.RESEND_API_KEY },
      body: JSON.stringify({
        from: env.ENQUIRY_FROM || "Wollemi Group website <website@wollemigroup.co>",
        to: [env.ENQUIRY_TO || "admin@wollemigroup.co"],
        reply_to: e.email,
        subject: "Website enquiry: " + e.type + " - " + e.name.replace(/[\r\n]+/g, " "),
        text: lines.join("\n"),
      }),
    });
    if (!res.ok) { console.error("enquiry: email service answered", res.status); return json({ error: "offline" }, 502); }
  } catch (err) {
    console.error("enquiry: email service could not be reached");
    return json({ error: "offline" }, 502);
  }
  return json({ ok: true }, 200);
}

export function onRequest() {
  return json({ error: "method not allowed" }, 405);
}
