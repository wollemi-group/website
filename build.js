// Builds the Wollemi Group website draft into site\: eight pages sharing one header, footer and stylesheet.
// Run: node build.js   No packages. Content comes from Wollemi's own material (see website-plan.md);
// anything they haven't confirmed is wrapped in <span class="confirm"> so it shows up in review.
// Draft 2, 16 Oct 2026: rebuilt around "Wollemi services.docx" and Helen's answers of 16 Oct
// (registrations screenshot, Ben as the contact, not a registered NDIS provider, no personal names).
// Draft 1 is kept as build-draft1-2026-10-15.js and site-draft1\.
const fs = require("fs");
const path = require("path");
const OUT = path.join(__dirname, "public");

const TURNSTILE_SITEKEY = "0x4AAAAAAFgcMMGbJPckkNkw"; // public site key (the secret key lives in Cloudflare only)
const PHONE = "0481 008 080", TEL = "+61481008080", EMAIL = "admin@wollemigroup.co", CONTACT = "Ben";
const C = (t) => `<span class="confirm">${t}</span>`;            // to confirm with Wollemi

// Home page hero video. PLACEHOLDER (25 Oct 2026): a 17-second loop made from Wollemi's own job photos.
// To use their real video: put the MP4 in public/assets/video/, change src (and poster, a still from it), rebuild.
// Keep it short, silent and under about 8 MB; the page mutes it and loops it anyway.
const HERO_VIDEO = {
  src: "assets/video/hero-placeholder.mp4",
  poster: "assets/video/hero-placeholder-poster.jpg",
  caption: "Wollemi jobs across Melbourne",
};

// Footer social links. PLACEHOLDERS (25 Oct 2026): no real pages yet, so href is "#".
// Put the real page address in href when Wollemi has it. Delete a line to hide that icon; [] hides the whole row.
const SOCIAL = [
  { name: "Facebook", href: "#", icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11.5" fill="#fff"/><path fill="#0866FF" d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/></svg>` },
  { name: "Instagram", href: "#", icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><defs><radialGradient id="ig-grad" cx="30%" cy="107%" r="150%"><stop offset="0" stop-color="#fdf497"/><stop offset=".05" stop-color="#fdf497"/><stop offset=".45" stop-color="#fd5949"/><stop offset=".6" stop-color="#d6249f"/><stop offset=".9" stop-color="#285AEB"/></radialGradient></defs><rect width="24" height="24" rx="6" fill="url(#ig-grad)"/><rect x="5" y="5" width="14" height="14" rx="4" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="12" cy="12" r="3.3" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="16.1" cy="7.9" r="1" fill="#fff"/></svg>` },
];
const socialRow = SOCIAL.length ? `<ul class="social" aria-label="Wollemi Group on social media">${SOCIAL.map((s) => `<li><a href="${s.href}" aria-label="Wollemi Group on ${s.name}${s.href === "#" ? " (coming soon)" : ""}"${s.href === "#" ? ' data-placeholder="true"' : ' target="_blank" rel="noopener"'}>${s.icon}</a></li>`).join("")}</ul>` : "";

// Fade-up on scroll, every page. Visitors who ask their device for less motion see everything at once.
// ?motion=on forces the motion on for review on test addresses (pages.dev, localhost), never the live domain.
const MOTION_JS = `<script>
(function () {
  var d = document.documentElement;
  var host = location.hostname;
  var force = new URLSearchParams(location.search).get("motion") === "on" && (host.slice(-10) === ".pages.dev" || host === "localhost" || host === "127.0.0.1");
  var rm = window.matchMedia("(prefers-reduced-motion: reduce)");
  var still = !force && rm.matches;
  if (force) d.classList.add("motion-on");

  // Placeholder social links (href "#") do nothing rather than jump to the top
  [].forEach.call(document.querySelectorAll("a[data-placeholder]"), function (a) { a.addEventListener("click", function (e) { e.preventDefault(); }); });

  var v = document.querySelector(".hero-video"), b = document.querySelector(".hero-pause");
  if (v && b) {
    var set = function (playing) { b.textContent = playing ? "Pause" : "Play"; b.setAttribute("aria-label", (playing ? "Pause" : "Play") + " the background video"); };
    v.addEventListener("play", function () { set(true); });
    v.addEventListener("pause", function () { set(false); });
    set(false);
    if (!still) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    b.addEventListener("click", function () { if (v.paused) v.play(); else v.pause(); });
    // Less motion switched on while the page is open: stop the video
    var onRm = function (e) { if (e.matches && !force) v.pause(); };
    if (rm.addEventListener) rm.addEventListener("change", onRm); else if (rm.addListener) rm.addListener(onRm);
  }

  if (still || !("IntersectionObserver" in window)) return;
  var sel = "main section h2, main section .lead, main .path, main .card, main .steps li, main .split > *, main .notice, main .gallery > *, main .ticks li, main .details, main figure";
  var all = [].slice.call(document.querySelectorAll(sel)).filter(function (el) { return !el.closest(".video-hero, .page-hero"); });
  var els = all.filter(function (el) { return !all.some(function (o) { return o !== el && o.contains(el); }); });
  els.forEach(function (el) {
    var sibs = [].slice.call(el.parentElement.children).filter(function (s) { return els.indexOf(s) > -1; });
    el.style.setProperty("--d", Math.min(sibs.indexOf(el), 5) * 90 + "ms");
    el.classList.add("reveal");
  });
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px" });
  els.forEach(function (el) { io.observe(el); });
  // Keyboard users never tab onto something still invisible
  document.addEventListener("focusin", function (e) { var r = e.target.closest && e.target.closest(".reveal"); if (r) r.classList.add("in"); });
})();
</script>`;
const roof = `<svg class="roof" viewBox="0 0 46 14" aria-hidden="true"><path d="M2 12 L23 2 L44 12"/></svg>`;
const img = (file, alt, tag, cap) => `<figure><img src="assets/img/${file}" alt="${alt}" loading="lazy">${tag || cap ? `<figcaption>${tag === "real" ? '<span class="tag real">Wollemi job</span>' : tag === "concept" ? '<span class="tag">Concept image</span>' : ""}${cap || ""}</figcaption>` : ""}</figure>`;
const tag = (t) => t === "real" ? '<span class="tag real" style="margin-bottom:8px">Wollemi job</span>' : '<span class="tag" style="margin-bottom:8px">Concept image</span>';
const card = (href, file, t, h, p) => `<a class="card photo" href="${href}" style="text-decoration:none;color:inherit"><img src="assets/img/${file}" alt="" loading="lazy"><div class="t">${tag(t)}<h3>${h}</h3><p>${p}</p></div></a>`;

const NAV = [
  ["building.html", "Building"],
  ["granny-flats.html", "Granny flats"],
  ["surveying.html", "Building permits"],
  ["accessible-homes.html", "NDIS modifications"],
  ["civil-concrete.html", "Civil and concrete"],
  ["projects.html", "Projects"],
  ["about.html", "About"],
];

const FORM_JS = `<script>
(function () {
  var form = document.querySelector("form[action='/api/enquiry']"); if (!form) return;
  var status = document.getElementById("form-status");
  var btn = form.querySelector("button[type=submit]");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var d = {}; new FormData(form).forEach(function (v, k) { d[k] = v; });
    d.token = d["cf-turnstile-response"] || "";
    btn.disabled = true; status.textContent = "Sending...";
    fetch("/api/enquiry", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(d) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (x) {
        if (x.ok) { form.reset(); status.textContent = "Thanks, we have your enquiry and will be in touch."; }
        else { btn.disabled = false; status.textContent = "That did not send. Please call or email us instead, or check the details and try again."; }
      })
      .catch(function () { btn.disabled = false; status.textContent = "That did not send. Please call or email us instead."; });
  });
})();
</script>${TURNSTILE_SITEKEY ? '<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>' : ""}`;

const page = (file, title, desc, body) => {
  const nav = NAV.map(([h, t]) => `<a href="${h}"${h === file ? ' aria-current="page"' : ""}>${t}</a>`).join("");
  return `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta name="robots" content="noindex">
<link rel="icon" href="assets/logo/favicon-32.png" sizes="32x32">
<link rel="icon" href="assets/logo/favicon-16.png" sizes="16x16">
<link rel="apple-touch-icon" href="assets/logo/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,700..900&family=Atkinson+Hyperlegible+Next:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/site.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-head">
  <div class="wrap">
    <a class="brand" href="index.html" aria-label="Wollemi Group home"><img class="logo-full" src="assets/logo/wollemi-lockup.svg" alt="Wollemi Group" width="300" height="89"><img class="logo-name" src="assets/logo/wollemi-wordmark.svg" alt="Wollemi Group" width="220" height="50"></a>
    <nav class="nav" aria-label="Main">${nav}<a class="btn" href="contact.html">${file === "surveying.html" ? "Send your plans" : "Book a site visit"}</a></nav>
    <details class="menu"><summary>Menu</summary><nav class="menu-list" aria-label="Main">${nav}<a href="contact.html">Book a site visit</a><a href="tel:${TEL}">Call ${CONTACT} on ${PHONE}</a></nav></details>
  </div>
</header>
<main id="main">
${body}
</main>
${file === "contact.html" ? FORM_JS : ""}
<footer class="site-foot">
  <div class="wrap">
    <div class="cols">
      <div>
        <img src="assets/logo/wollemi-lockup-reversed.svg" alt="Wollemi Group" width="300" height="89">
        <p>Building, building permits and civil works in Melbourne. Homes, granny flats, NDIS modifications, turntables, and the concrete under them.</p>
        ${socialRow}
      </div>
      <div>
        <h3>Contact</h3>
        <ul>
          <li>${CONTACT}: <a href="tel:${TEL}">${PHONE}</a></li>
          <li><a href="mailto:${EMAIL}">${EMAIL}</a></li>
          <li>Suite 4/48 Edgewater Blvd<br>Maribyrnong VIC 3032</li>
        </ul>
      </div>
      <div>
        <h3>Pages</h3>
        <ul>${NAV.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}<li><a href="contact.html">Contact</a></li><li><a href="privacy.html">Privacy</a></li></ul>
      </div>
    </div>
    <div class="base">
      <span>Wollemi Group Pty Ltd · ABN 17 684 114 529</span>
    </div>
  </div>
</footer>
${MOTION_JS}
</body>
</html>
`;
};

const cta = (h = "Talk to us about your project", p = `Book a time for us to see the site, or call ${CONTACT} on ${PHONE}. Send plans or photos with your enquiry and we'll come back to you with the next step.`) => `
<section class="band navy">
  <div class="wrap">
    ${roof}
    <h2>${h}</h2>
    <p>${p}</p>
    <div class="btns"><a class="btn light" href="contact.html">Book a site visit</a><a class="btn ghost" href="tel:${TEL}">Call ${PHONE}</a></div>
  </div>
</section>`;

// When Wollemi builds, the permit and inspections come from an independent surveyor (their own conflict notice).
const buildSteps = `
<ol class="steps">
  <li><h3>First talk</h3><p>We talk through what you want to build, your budget and the site.</p></li>
  <li><h3>Design</h3><p>A design that works for how you'll use it and meets the building rules.</p></li>
  <li><h3>Building permit</h3><p>An independent registered building surveyor checks the plans and issues the permit. By law you, the owner, appoint them, not the builder. You can also use the council's building surveyor.</p></li>
  <li><h3>Construction</h3><p>We build it, including the civil works. The surveyor inspects at the stages set in the permit.</p></li>
  <li><h3>Handover</h3><p>The surveyor issues the final document the job needs, an occupancy permit or a certificate of final inspection, and we hand over.</p></li>
</ol>`;

const surveySteps = `
<ol class="steps">
  <li><h3>Send your plans</h3><p>Drawings, engineering and a short description of the work.</p></li>
  <li><h3>Assessment</h3><p>We check the plans against the National Construction Code, the Victorian building regulations and the Australian Standards that apply.</p></li>
  <li><h3>Building permit</h3><p>Once the plans comply, we issue the building permit.</p></li>
  <li><h3>Stage inspections</h3><p>The mandatory inspections set in the permit, such as before the slab is poured, the frame, and the final.</p></li>
  <li><h3>Final sign-off</h3><p>The final document the job needs: an occupancy permit or a certificate of final inspection. Where an occupancy permit is needed, the building can't be used until it's issued.</p></li>
</ol>`;

const independence = `
<div class="notice">
  <h3>Surveyor, or designer and builder. Never both on one job.</h3>
  <p>Under Victoria's Building Act, our surveyor can't issue the permit or do the inspections on a job that Wollemi designs or builds. If we issue your permit, you choose the builder, and we have no arrangement with them. If we design or build it, you appoint an independent building surveyor, who issues the permit and does the inspections.</p>
</div>`;

const pages = {};

// ---------------- Home ----------------
pages["index.html"] = page("index.html", "Wollemi Group | Builders, building permits and civil works, Melbourne",
  "Wollemi Group builds homes, granny flats and NDIS home modifications, and does civil and concrete works including vehicle turntables. Building permits from our registered building surveyor. Maribyrnong, Melbourne.", `
<section class="hero video-hero">
  <video class="hero-video" src="${HERO_VIDEO.src}" poster="${HERO_VIDEO.poster}" muted loop playsinline preload="metadata" aria-hidden="true"></video>
  <div class="hero-shade" aria-hidden="true"></div>
  <div class="wrap">
    <div class="hero-text">
      <p class="eyebrow">Building · Building permits · Civil · Melbourne</p>
      <h1>Building and civil works, from the ground up.</h1>
      <p class="lead">Wollemi Group builds homes, granny flats and NDIS home modifications, and does civil and concrete works. Our registered building surveyor also assesses plans and issues building permits.</p>
      <div class="btns"><a class="btn light" href="contact.html">Book a site visit</a><a class="btn ghost" href="tel:${TEL}">Call ${CONTACT} on ${PHONE}</a></div>
    </div>
  </div>
  <p class="hero-credit">${HERO_VIDEO.caption}</p>
  <button class="hero-pause" type="button" aria-label="Pause the background video">Pause</button>
</section>

<section class="band">
  <div class="wrap">
    <div class="paths three">
      <a class="path" href="building.html"><img src="assets/img/jobs/townhouses-albion-3.jpg" alt="" loading="lazy"><div><span class="tag real" style="margin-bottom:8px">Wollemi job</span><p class="eyebrow">For homeowners</p><h3>Building or renovating?</h3><p>Custom homes, granny flats, renovations and extensions, and NDIS home modifications.</p><span class="go">Building &rarr;</span></div></a>
      <a class="path" href="surveying.html"><div class="pfill">${roof}<b>Plans · Permit · Inspections · Final</b></div><div><p class="eyebrow">For owners, designers and builders</p><h3>Need a building permit?</h3><p>Plan assessment, building permits, stage inspections and final sign-off from our registered building surveyor.</p><span class="go">Building permits &rarr;</span></div></a>
      <a class="path" href="civil-concrete.html"><img src="assets/img/jobs/drainage-pipework.jpg" alt="" loading="lazy"><div><span class="tag real" style="margin-bottom:8px">Wollemi job</span><p class="eyebrow">For builders and project teams</p><h3>Need civil or concrete work?</h3><p>Pits and pipes, drainage, council footpaths, kerb and channel, digging and complex concrete.</p><span class="go">Civil and concrete &rarr;</span></div></a>
    </div>
  </div>
</section>

<section class="band navy">
  <div class="wrap split">
    <div>
      ${roof}
      <h2>The ground and the build, planned together</h2>
      <p>Wollemi does building and civil works, so the drainage and concrete are planned with the build from the start. We also have a registered building surveyor, who issues permits and does inspections on jobs we don't design or build.</p>
      <ul class="ticks">
        <li>Building and civil works from one business</li>
        <li>Building permits and inspections, on jobs we don't design or build</li>
        <li>NDIS modifications: stepless entries, wider doorways, bathrooms, hoists and ramps</li>
        <li>Vehicle turntables and complex concrete</li>
      </ul>
    </div>
    <div class="real-small">${img("civil-drainage-pit.jpg", "Concrete drainage pit with a pipe connection, next to a new footpath", "real", " Drainage pit and pipe connection")}</div>
  </div>
</section>

<section class="band">
  <div class="wrap">
    <div class="head-row"><div>${roof}<h2>What we do</h2></div><p><a href="contact.html">Not sure where your job fits? Ask us.</a></p></div>
    <div class="cards">
      ${card("projects.html#townhouses", "jobs/townhouses-albion-2.jpg", "real", "Custom homes and developments", "New homes, boutique and multi-unit developments, built to your plans and your block.")}
      ${card("granny-flats.html", "jobs/granny-flat-kitchen.jpg", "real", "Granny flats", "Small second dwellings for family, a studio or a rental, on your existing block.")}
      ${card("projects.html#clarendon", "jobs/clarendon-roof-trusses.jpg", "real", "Renovations and extensions", "From minor updates to complete renovations, and commercial fit-outs.")}
      ${card("projects.html#ndis-bathroom", "jobs/ndis-bathroom-finished.jpg", "real", "NDIS home modifications", "Changes to a home for an NDIS participant, small or structural, alongside their OT.")}
      ${card("civil-concrete.html#turntables", "jobs/turntable-kew-driveway.jpg", "real", "Vehicle turntables", "So cars on tight blocks and narrow driveways can drive out forwards.")}
      ${card("civil-concrete.html#council", "civil-footpath-and-driveway.jpg", "real", "Footpaths, kerbs and crossovers", "Built to the council's specification, with the pits and pipes that go with them.")}
    </div>
  </div>
</section>

<section class="band panel">
  <div class="wrap">
    ${roof}<h2>How a build runs</h2>
    ${buildSteps}${independence}
  </div>
</section>

<section class="band">
  <div class="wrap split">
    <div>
      ${roof}
      <h2>Why Wollemi</h2>
      <p>The Wollemi pine is a living fossil that has survived in Australia for millions of years. This ancient and resilient tree represents our commitment to quality, ensuring our work is built to last.</p>
      <p><a href="about.html">About Wollemi Group &rarr;</a></p>
    </div>
    <div style="display:grid;place-items:center;padding:24px;background:var(--panel)"><img src="assets/logo/wollemi-icon.svg" alt="The Wollemi Group logo: a Wollemi pine inside a house" style="width:min(280px,80%)"></div>
  </div>
</section>
${cta()}`);

// ---------------- Building ----------------
pages["building.html"] = page("building.html", "Building | Wollemi Group",
  "Custom homes, granny flats (small second dwellings), renovations and extensions, boutique and multi-unit developments and commercial fit-outs in Melbourne.", `
<section class="page-hero"><div class="wrap">${roof}<p class="eyebrow">Building</p><h1>Homes, granny flats, extensions and fit&#8209;outs</h1><p class="lead">We design and build, or build to your plans. We also do civil works, so the ground under the job is planned with it.</p></div></section>

<section class="band"><div class="wrap split">
  <div><h2>Design and build</h2><p>One team from the first plans to the handover. We manage the design and the build, working with the engineers, designers and suppliers in our partner network.</p><ul class="ticks"><li>Your plans, or ours</li><li>Drainage and stormwater planned with the build</li><li>Accessible features designed in from the start, if you need them</li></ul></div>
  ${img("jobs/townhouses-frames-scaffold.jpg", "Two-storey townhouse frames with scaffold and edge protection around the roof", "real", " Townhouses at frame stage")}
</div></section>

<section class="band panel"><div class="wrap">
  <h2>What we build</h2>
  <div class="cards two">
    <div class="card"><h3>Custom homes</h3><p>A new home built to suit your block and the way you live, modern or classic. Accessibility can be designed in from the start.</p></div>
    <div class="card"><h3>Granny flats</h3><p>Small second dwellings on a block with one existing home. <a href="granny-flats.html">See our Granny flats page</a>.</p></div>
    <div class="card"><h3>Renovations and extensions</h3><p>From minor updates to complete renovations and extensions. We can add accessibility features or fix civil issues under the house at the same time.</p></div>
    <div class="card"><h3>Boutique and multi-unit developments</h3><p>We partner with developers on boutique and multi-unit developments. Our civil works experience helps with the parts that need care, such as stormwater and drainage.</p></div>
    <div class="card"><h3>Commercial fit-outs</h3><p>Restaurants, offices and medical clinics, built to work for the business and to meet the rules, including accessible toilets and entries. <a href="projects.html#medical-clinic">See a medical clinic in St Albans</a>.</p></div>
    <div class="card"><h3>Vehicle turntables</h3><p>For tight blocks and narrow driveways, a turntable lets the car turn on the driveway and drive out forwards. <a href="civil-concrete.html#turntables">More on turntables</a>.</p></div>
  </div>
</div></section>

<section class="band"><div class="wrap"><p><b>Our partners.</b> We work with builders, engineers, designers and suppliers we trust, from mechanical driveway systems and joinery design to civil materials and finishes.</p></div></section>
<section class="band panel"><div class="wrap">${roof}<h2>How a build runs</h2>${buildSteps}${independence}</div></section>
${cta()}`);

// ---------------- Granny flats ----------------
const grannyShots = [
  ["granny-flat-exterior", "Finished, from the yard", "Single-storey brick granny flat with a sliding door and a new concrete yard"],
  ["granny-flat-kitchen", "Kitchen", "White kitchen with an oven, dishwasher and stone-look benchtop"],
  ["granny-flat-bathroom", "Bathroom", "Marble-look tiled bathroom with a frameless shower and a vanity"],
  ["granny-flat-bedroom", "Bedroom", "Bedroom with timber-look floor, a window and a split system"],
  ["granny-flat-steel-frame", "Steel frame", "Blue steel wall frames and roof trusses on the slab"],
  ["granny-flat-slab", "Slab", "Freshly poured concrete slab for the granny flat"],
];
pages["granny-flats.html"] = page("granny-flats.html", "Granny flats | Wollemi Group",
  "Granny flats (small second dwellings) in Melbourne, built by Wollemi Group: steel frame, brick, with their own kitchen, bathroom and laundry. A granny flat we built in St Albans.", `
<section class="page-hero"><div class="wrap">${roof}<p class="eyebrow">Granny flats</p><h1>Granny flats on your block</h1><p class="lead">A small second dwelling in the back yard: room for family, an independent studio, or a rental. We design and build, or build to your plans, and we check your block first.</p><div class="btns"><a class="btn" href="contact.html">Book a site visit</a><a class="btn line" href="tel:${TEL}">Call ${PHONE}</a></div></div></section>

<section class="band"><div class="wrap split">
  <div><h2>A second home on your block</h2><p>A granny flat is a small second dwelling on a block that already has one home. It has its own kitchen, bathroom and laundry, so whoever lives there is independent.</p>
  <ul class="ticks"><li>Family: a parent, or an adult child, close by</li><li>A studio or an office, separate from the main house</li><li>A rental for extra income</li></ul></div>
  ${img("jobs/granny-flat-exterior.jpg", "Single-storey brick granny flat with a sliding door and a new concrete yard", "real", " Granny flat, St Albans")}
</div></section>

<section class="band panel"><div class="wrap">
  <h2>Before you start</h2>
  <div class="cards">
    <div class="card"><h3>Building permit</h3><p>A granny flat needs a building permit. Our registered building surveyor can issue permits on jobs we don't design or build. <a href="surveying.html">More on building permits</a>.</p></div>
    <div class="card"><h3>Planning permit</h3><p>In Victoria it often needs no planning permit, depending on its size, the zone and any overlays.</p></div>
    <div class="card"><h3>We check your block first</h3><p>Before you spend on plans, we look at the block and tell you what the job needs.</p></div>
  </div>
</div></section>

<section class="band"><div class="wrap">
  <h2>A granny flat we built, St Albans</h2>
  <p>A small second dwelling in a back yard: steel frame, brick, its own kitchen, bathroom and laundry.</p>
  <div class="gallery">${grannyShots.map(([f, c, a]) => `<figure><img src="assets/img/jobs/${f}.jpg" alt="${a}" loading="lazy"><figcaption><span class="tag real">Wollemi job</span>${c}</figcaption></figure>`).join("")}</div>
  <p><a href="projects.html#granny-flat">See this job on the Projects page &rarr;</a></p>
</div></section>

<section class="band panel"><div class="wrap">${roof}<h2>How a build runs</h2>${buildSteps}${independence}</div></section>
${cta("Thinking about a granny flat?", `Book a time for us to see the block, or call ${CONTACT} on ${PHONE}. Send your plans or photos with your enquiry and we'll come back to you with the next step.`)}`);

// ---------------- Privacy ----------------
pages["privacy.html"] = page("privacy.html", "Privacy policy | Wollemi Group",
  "How Wollemi Group collects, uses, stores and corrects personal information from enquiries made through this website.", `
<section class="page-hero"><div class="wrap">${roof}<p class="eyebrow">Privacy</p><h1>Privacy policy</h1><p class="lead">How Wollemi Group Pty Ltd (ABN 17 684 114 529) handles the personal information you send us through this website.</p></div></section>
<section class="band"><div class="wrap" style="max-width:760px">
  <h2>What we collect</h2>
  <p>When you send an enquiry we collect the details you type into the form: your name, phone number, email address, the suburb of the job, the type of work, whether you are the owner, builder or designer, and your message. If you call or email us, we keep the details you give us.</p>
  <h2>Why we collect it</h2>
  <p>We use your details to reply to your enquiry, to arrange a site visit and to prepare a quote. We do not sell your details or use them for anything unrelated to your enquiry.</p>
  <h2>Who sees it</h2>
  <p>Your enquiry is emailed to us. The website is hosted on Cloudflare, and the form uses Cloudflare Turnstile to stop spam and Resend to send us the email. These services handle your details only to deliver the enquiry to us, and some of their servers are outside Australia.</p>
  <h2>How long we keep it</h2>
  <p>We keep an enquiry for as long as we need it to deal with it and with any job that follows, and we then delete or de-identify it.</p>
  <h2>Seeing or correcting your details</h2>
  <p>You can ask to see the personal information we hold about you, or to correct it, by emailing <a href="mailto:${EMAIL}">${EMAIL}</a> or calling ${CONTACT} on <a href="tel:${TEL}">${PHONE}</a>.</p>
  <h2>Complaints</h2>
  <p>If you are unhappy with how we have handled your information, contact us first. You can also contact the Office of the Australian Information Commissioner at oaic.gov.au.</p>
</div></section>${cta()}`);

// ---------------- Building permits (surveying) ----------------
pages["surveying.html"] = page("surveying.html", "Building permits and building surveying | Wollemi Group",
  "Plan assessment, building permits, mandatory stage inspections and occupancy permits from a registered building surveyor in Melbourne, for buildings up to 3 storeys.", `
<section class="page-hero"><div class="wrap">${roof}<p class="eyebrow">Building permits</p><h1>Building permits and inspections</h1><p class="lead">Our registered building surveyor assesses your plans, issues the building permit, does the mandatory inspections and signs off the finished work.</p><div class="btns"><a class="btn" href="contact.html">Send us your plans</a><a class="btn line" href="tel:${TEL}">Call ${PHONE}</a></div></div></section>

<section class="band"><div class="wrap split">
  <div>
    <h2>What we issue permits for</h2>
    <ul class="ticks">
      <li>New homes</li>
      <li>Granny flats (small second dwellings)</li>
      <li>Extensions, including structural work</li>
      <li>NDIS home modifications</li>
      <li>Vehicle turntables</li>
      <li>Commercial fit-outs</li>
    </ul>
  </div>
  ${img("jobs/townhouses-frames-scaffold.jpg", "Two-storey townhouse frames with scaffold and edge protection around the roof", "real", " Townhouses at frame stage")}
</div></section>

<section class="band panel"><div class="wrap">${roof}<h2>How it works</h2>${surveySteps}${independence}</div></section>

<section class="band"><div class="wrap">
  <h2>Who it's for</h2>
  <div class="cards">
    <div class="card"><h3>Owners</h3><p>Building a home, a granny flat or an extension with your own builder. You appoint the surveyor, and you can appoint ours.</p></div>
    <div class="card"><h3>Builders</h3><p>A permit for a job you're building. We'll need the owner's appointment and the plans.</p></div>
    <div class="card"><h3>Designers and OTs</h3><p>Plans for an NDIS modification or a fit-out that need checking against the rules. The owner still makes the appointment.</p></div>
  </div>
</div></section>
${cta("Need a building permit?", `Send us your plans, or call ${CONTACT} on ${PHONE}, and we'll tell you what we need and what happens next.`)}`);

// ---------------- NDIS and accessible homes ----------------
pages["accessible-homes.html"] = page("accessible-homes.html", "NDIS home modifications and accessible homes | Wollemi Group",
  "Home modifications for NDIS participants in Melbourne: stepless entries, wider doorways, bathroom conversions, ceiling hoists and ramps, working with occupational therapists.", `
<section class="page-hero"><div class="wrap">${roof}<p class="eyebrow">NDIS modifications</p><h1>Home modifications for NDIS participants</h1><p class="lead">From small changes to major structural work, we modify homes so they're safe and work for the person living there. We work alongside the participant and their occupational therapist.</p></div></section>

<section class="band"><div class="wrap split">
  ${img("jobs/ndis-bathroom-finished.jpg", "Renovated bathroom with grab rails in the shower and a freestanding bath", "real", " NDIS bathroom renovation")}
  <div><h2>What we do</h2>
    <ul class="ticks">
      <li>Stepless entries</li>
      <li>Widening doorways</li>
      <li>Bathroom conversions</li>
      <li>Ceiling hoists</li>
      <li>Ramps</li>
      <li>Accessible homes and extensions, new or retrofitted</li>
    </ul>
    
  </div>
</div></section>

<section class="band panel"><div class="wrap split">
  <div><h2>Working with the OT</h2><p>The occupational therapist works out what the participant needs. We turn that into a design and a build, check it meets the building rules, and keep the participant and the OT up to date while we work.</p><p>Some modifications need a building permit. We'll tell you at the first visit. On a job we build, an independent building surveyor issues it, because our surveyor can't be surveyor and builder on one job.</p></div>
  ${img("jobs/ndis-bathroom-waterproofing.jpg", "Bathroom wall sheeted and waterproofed during an NDIS renovation", "real", " NDIS bathroom, waterproofing stage")}
</div></section>
${cta("Planning an NDIS home modification?")}`);

// ---------------- Civil and concrete ----------------
pages["civil-concrete.html"] = page("civil-concrete.html", "Civil and concrete works | Wollemi Group",
  "Civil pits and pipes, drainage, council footpaths and crossovers, kerb and channel, non-destructive digging, vehicle turntables and complex concrete in Melbourne.", `
<section class="page-hero"><div class="wrap">${roof}<p class="eyebrow">For builders and project teams</p><h1>Civil and concrete works</h1><p class="lead">Practical civil, concrete and underground work for ongoing projects. Based in Maribyrnong, working across Melbourne's north, west and east.</p><div class="btns"><a class="btn" href="contact.html">Send us your scope</a><a class="btn line" href="tel:${TEL}">Call ${CONTACT} on ${PHONE}</a></div></div></section>

<section class="band"><div class="wrap">
  <div class="cards four">
    <div class="card photo"><img src="assets/img/jobs/drainage-pipework.jpg" alt="White drainage pipework laid in an open trench with pit connections" loading="lazy"><div class="t"><h3>Civil pits and pipes</h3><p>Pipe laying, pit construction and utility connections.</p><p class="hint" style="margin-top:8px"><span class="tag real">Wollemi job</span></p></div></div>
    <div class="card photo"><img src="assets/img/civil-trench-and-conduit.jpg" alt="Narrow trench beside a kerb with exposed services" loading="lazy"><div class="t"><h3>Non-destructive digging (NDD)</h3><p>Careful excavation where existing services and site conditions call for it.</p><p class="hint" style="margin-top:8px"><span class="tag real">Wollemi job</span></p></div></div>
    <div class="card photo"><img src="assets/img/civil-footpath-and-driveway.jpg" alt="New concrete footpath meeting a driveway crossover" loading="lazy"><div class="t"><h3>Footpaths and crossovers</h3><p>Concrete footpaths, driveways and crossovers, new, repaired or replaced.</p><p class="hint" style="margin-top:8px"><span class="tag real">Wollemi job</span></p></div></div>
    <div class="card photo"><img src="assets/img/civil-concrete-pit.jpg" alt="Square concrete pit cast in place, with a pipe opening" loading="lazy"><div class="t"><h3>Complex concrete</h3><p>Detailed pours, cast-in-place pits and circular turntable slabs.</p><p class="hint" style="margin-top:8px"><span class="tag real">Wollemi job</span></p></div></div>
  </div>
</div></section>

<section class="band panel" id="council"><div class="wrap split">
  <div><h2>Footpaths, crossovers, kerb and channel</h2><p>Built to the local council's specification, whether the job is for a builder, an owner or the council.</p><ul class="ticks"><li>Footpaths and public walkways</li><li>Vehicle crossovers</li><li>Kerb and channel</li><li>Drainage pits, pipes and connections</li></ul></div>
  <div class="real-small">${img("civil-drainage-pit.jpg", "Drainage pit with a pipe connection beside a new footpath", "real", " Drainage pit beside a new footpath")}</div>
</div></section>

<section class="band" id="turntables"><div class="wrap split">
  <div class="real-small">${img("jobs/turntable-kew-driveway.jpg", "Black asphalt driveway with a circular vehicle turntable outline in front of a brick garage", "real", " Vehicle turntable, Kew")}</div>
  <div><h2>Vehicle turntables</h2><p>A turntable lets a car turn around on the driveway and drive out forwards, instead of reversing onto the street. It suits tight blocks and narrow driveways, and saves space for parking on site.</p><ul class="ticks"><li>Homes and commercial sites, including recent turntables in Brighton and Kew</li><li>The slab, the pit and the install, with our turntable supplier</li><li>We'll tell you at the start if the job needs a building permit</li></ul></div>
</div></section>

${cta("Got upcoming civil or concrete work?", `Send us the scope or drawings, or call ${CONTACT} on ${PHONE}, and we'll come back to you with a price.`)}`);

// ---------------- Projects ----------------
const civilShots = [
  ["civil-turntable-driveway.jpg", "Turntable driveway", "Exposed aggregate driveway with a circular turntable", "Brighton"],
  ["civil-footpath-and-driveway.jpg", "Footpath and crossover", "New concrete footpath meeting a driveway crossover"],
  ["civil-drainage-pit.jpg", "Drainage pit", "Drainage pit with a pipe connection beside a footpath"],
  ["civil-concrete-pit.jpg", "Concrete pit", "Square concrete pit cast in place"],
  ["jobs/drainage-pipework.jpg", "Drainage pipework", "White drainage pipework laid in an open trench with pit connections"],
];
const jobs = [
  ["ndis-bathroom", "NDIS bathroom renovation", "A bathroom rebuilt for an NDIS participant: stripped out, waterproofed, retiled, with grab rails in the shower.", [
    ["ndis-bathroom-finished", "Finished, with grab rails", "Renovated bathroom with grab rails in the shower and a freestanding bath"],
    ["ndis-bathroom-strip-out", "Strip-out", "Old tiles stripped from the bathroom walls, with tools on the floor"],
    ["ndis-bathroom-waterproofing", "Waterproofing", "Bathroom wall sheeted and waterproofed, with a shower niche"],
    ["ndis-bathroom-tiling", "Tiling", "Large white wall tiles going up with levelling clips"],
  ]],
  ["townhouses", "Townhouses: Albion, Maribyrnong and Essendon", "Three townhouse developments of three homes each: double-storey in Albion and Maribyrnong, triple-storey in Essendon. The Albion townhouses were completed in about six months.", [
    ["townhouses-albion-2", "Albion: finished front", "Finished two-storey townhouse in white and charcoal brick with a garage and timber fence"],
    ["townhouses-albion-3", "Albion: from the street", "Two finished townhouses seen from the street"],
    ["townhouses-albion-4", "Albion: kitchen and stairs", "Open-plan kitchen with a timber staircase"],
    ["townhouses-albion-7", "Albion: kitchen island", "Kitchen with a stone-top island"],
    ["townhouses-albion-8", "Albion: living area", "Living area with a sliding door to the yard"],
    ["townhouses-albion-6", "Albion: bathroom", "Bathroom with an oval basin"],
    ["townhouses-albion-10", "Albion: freestanding bath", "Bathroom with a freestanding bath"],
    ["townhouses-essendon-2", "Essendon: finished corner", "Finished triple-storey townhouses in oak and stone on the corner"],
    ["townhouses-essendon-3", "Essendon: kitchen", "Kitchen with a large island"],
    ["townhouses-essendon-6", "Essendon: staircase", "Lit timber and glass staircase"],
    ["townhouses-essendon-8", "Essendon: shower", "Shower with brass fittings"],
    ["townhouses-essendon-9", "Essendon: double vanity", "Double vanity with round lit mirrors"],
    ["townhouses-essendon-11", "Essendon: roof terrace", "Roof terrace on the top level"],
    ["townhouses-essendon-12", "Essendon: rooftop view", "View from the roof terrace towards the city"],
    ["townhouses-frames-scaffold", "Frames with edge protection", "Two-storey townhouse frames with scaffold and edge protection around the roof"],
    ["townhouses-frame-stage", "Frames and wrap", "Double-storey timber frames with scaffold, behind Wollemi site fencing"],
    ["townhouses-driveway-pour", "Driveway and path pour", "Fresh concrete path being finished beside the townhouses"],
  ]],
  ["granny-flat", "Granny flat, St Albans", "A small second dwelling in a back yard: steel frame, brick, its own kitchen, bathroom and laundry.", [
    ["granny-flat-exterior", "Finished, from the yard", "Single-storey brick granny flat with a sliding door and a new concrete yard"],
    ["granny-flat-kitchen", "Kitchen", "White kitchen with an oven, dishwasher and stone-look benchtop"],
    ["granny-flat-bathroom", "Bathroom", "Marble-look tiled bathroom with a frameless shower and a vanity"],
    ["granny-flat-bedroom", "Bedroom", "Bedroom with timber-look floor, a window and a split system"],
    ["granny-flat-steel-frame", "Steel frame", "Blue steel wall frames and roof trusses on the slab"],
    ["granny-flat-slab", "Slab", "Freshly poured concrete slab for the granny flat"],
  ]],
  ["clarendon", "House extension and renovation, West Footscray", "An extension and renovation in progress: new stumps, a new floor frame and new roof trusses over the old house.", [
    ["clarendon-stump-holes", "Stump holes set out", "Back yard with rows of stump holes dug behind an old house"],
    ["clarendon-floor-frame", "New floor frame", "New timber floor frame with yellow bearers going down"],
    ["clarendon-roof-trusses", "Roof trusses up", "New timber roof trusses over the walls"],
  ]],
  ["balcony", "Balcony repair, Maribyrnong", "A first-floor balcony rebuilt: new waterproofing membrane, then large-format tiles.", [
    ["balcony-scaffold", "Scaffold up", "Townhouse front with scaffold on the first-floor balcony"],
    ["balcony-membrane", "Waterproofing membrane", "Balcony floor coated with a black waterproofing membrane"],
    ["balcony-tiled", "Tiled", "Finished balcony with large grey tiles"],
  ]],
  ["balcony-aberfeldie", "Balcony repair, Aberfeldie", "Another balcony repair: large-format tiles laid on pedestals over the waterproofed floor.", [
    ["balcony-aberfeldie-laying", "Tiles going down", "Balcony floor with large tiles being laid on pedestals"],
    ["balcony-aberfeldie-tiled", "Tiled", "Finished balcony with large grey tiles"],
    ["balcony-aberfeldie-corner", "Corner detail", "Corner of the tiled balcony against the wall"],
  ]],
  ["turntables", "Vehicle turntables, Kew and Brighton", "Two driveway turntables: the ring marked out on a finished asphalt drive in Kew, and a concrete drive in Brighton from the steel turntable plate to the finished surface.", [
    ["turntable-kew-driveway", "Kew: the finished drive", "Black asphalt driveway with a circular turntable outline in front of a brick garage", "Kew"],
    ["turntable-kew-ring", "Kew: the turntable ring", "Asphalt driveway with a lit ring marking the circular turntable in front of a garage", "Kew"],
    ["turntable-brighton-plate", "Brighton: the turntable plate", "Round steel turntable plate set into its base beside the street", "Brighton"],
    ["turntable-brighton-mesh", "Brighton: reinforcing and pour", "Reinforcing mesh and fresh concrete being placed around the turntable base", "Brighton"],
    ["turntable-brighton-pour", "Brighton: the slab", "Freshly poured and finished concrete slab around the turntable", "Brighton"],
    ["turntable-brighton-finished", "Brighton: finished", "Finished exposed aggregate driveway with a circular turntable in front of a timber garage door", "Brighton"],
  ]],
  ["medical-clinic", "Medical clinic, St Albans", "A medical clinic we fitted out, with the ramp and landscaping at the front: reception, a corridor and a kitchenette inside, and an accessible ramp with handrails and a landscaped path outside.", [
    ["clinic-entry", "Front entry with ramp", "Brick clinic with a ramp, handrails and a landscaped concrete path"],
    ["clinic-reception", "Reception", "Reception desk with a white bench and carpet tiles"],
    ["clinic-corridor", "Corridor", "Corridor with white walls and black carpet tiles"],
    ["clinic-kitchenette", "Kitchenette", "Kitchenette with white cupboards and a window"],
  ]],
];
pages["projects.html"] = page("projects.html", "Projects | Wollemi Group",
  "Civil, concrete and building work by Wollemi Group in Melbourne.", `
<section class="page-hero"><div class="wrap">${roof}<p class="eyebrow">Projects</p><h1>Our work</h1><p class="lead">Townhouses, a granny flat, an extension, a balcony, and civil and concrete work. All photos are from Wollemi jobs.</p></div></section>
${jobs.map(([id, h, p, shots], i) => `<section class="band${i % 2 ? "" : " panel"}" id="${id}"><div class="wrap">
  <h2>${h}</h2><p>${p}</p>
  <div class="gallery">${shots.map(([f, c, a]) => `<figure><img src="assets/img/jobs/${f}.jpg" alt="${a}" loading="lazy"><figcaption><span class="tag real">Wollemi job</span>${c}</figcaption></figure>`).join("")}</div>
</div></section>`).join("\n")}
<section class="band" id="civil"><div class="wrap">
  <h2>Civil, concrete and turntables</h2>
  <div class="gallery">${civilShots.map(([f, c, a, sub]) => `<figure><img src="assets/img/${f}" alt="${a}" loading="lazy"><figcaption><span class="tag real">Wollemi job</span>${c}${sub ? ", " + sub : ""}</figcaption></figure>`).join("")}</div>
</div></section>
<section class="band panel"><div class="wrap">
  <h2>See it in person</h2>
  <p class="hint" style="margin-top:14px">We can also arrange a visit to a finished project, so you can see the work in person. <a href="contact.html">Ask us</a>.</p>
</div></section>
${cta()}`);

// ---------------- About ----------------
pages["about.html"] = page("about.html", "About | Wollemi Group",
  "Wollemi Group does building, building surveying and civil works in Melbourne, and why it's named after the Wollemi pine.", `
<section class="page-hero"><div class="wrap">${roof}<p class="eyebrow">About</p><h1>About Wollemi Group</h1><p class="lead">Wollemi Group does building, building surveying and civil works, from Maribyrnong in Melbourne's west.</p></div></section>

<section class="band"><div class="wrap split">
  <div>
    <h2>Why Wollemi</h2>
    <p>The Wollemi pine was known only from fossils millions of years old. In 1994 a national parks officer, David Noble, found a stand of living trees in a canyon in Wollemi National Park, west of Sydney. In the 2019–20 bushfires, firefighters protected that last wild stand, and most of the mature trees survived.</p>
    <p>We named the business after it because it lasts. That's what we want from every job we build.</p>
  </div>
  <div style="display:grid;place-items:center;padding:28px;background:var(--panel)"><img src="assets/logo/wollemi-icon.svg" alt="The Wollemi Group logo: a Wollemi pine inside a house" style="width:min(300px,85%)"></div>
</div></section>

<section class="band panel"><div class="wrap">
  <h2>How we work</h2>
  <div class="cards">
    <div class="card"><h3>From the ground up</h3><p>Building and civil works, including stormwater, drainage and concrete, so jobs are planned from the ground up.</p></div>
    <div class="card"><h3>We know the rules</h3><p>A registered building surveyor on the team. On our own builds, the design meets the rules before the plans go to the independent surveyor. On other people's jobs, we issue the permit.</p></div>
    <div class="card"><h3>Built for everyone</h3><p>Accessible design is part of how we build, from an NDIS bathroom conversion to a stepless front entry.</p></div>
  </div>
</div></section>

<section class="band"><div class="wrap">
  <h2>Who we are</h2>
  <div class="cards two">
    <div class="card"><h3>Helen Pham</h3><p class="eyebrow" style="margin:0 0 8px">Co-founder and Director, Compliance and Operations</p>
      <p>Helen co-founded Wollemi Group with her husband and is a director of the company. She is a registered building surveyor and a registered domestic builder. Her work in building regulation started in 2006 at the Building Commission, including as a technical adviser to the Building Appeals Board. Since then she has been an assistant building surveyor at Banyule City Council, a director and building surveyor from 2013 to 2021, a building surveyor at Moonee Valley City Council, and an access consultant.</p>
      <p style="margin-top:10px">At Wollemi she coordinates projects and manages compliance documents and approval submissions. She is a member of Moonee Valley City Council's Disability Advisory Committee.</p></div>
    <div class="card"><h3>Ben</h3><p class="eyebrow" style="margin:0 0 8px">Co-founder</p>
      <p>Ben co-founded Wollemi Group with his wife, Helen. He worked for years in IT, managing teams and systems, and spent his weekends on renovations, extensions and townhouse builds. He now works in the business full-time, running sites and schedules, and uses digital tools to help keep jobs on track.</p>
      <p style="margin-top:10px">Call Ben about a job on <a href="tel:${TEL}">${PHONE}</a>.</p></div>
  </div>
</div></section>

${cta()}`);

// ---------------- Contact ----------------
pages["contact.html"] = page("contact.html", "Contact and bookings | Wollemi Group",
  "Book a site visit, call Ben or send an enquiry to Wollemi Group, Maribyrnong, Melbourne.", `
<section class="page-hero"><div class="wrap">${roof}<p class="eyebrow">Contact</p><h1>Talk to us about your project</h1><p class="lead">Send an enquiry, book a time, or call ${CONTACT}. Plans and photos help us come back to you with the right next step.</p></div></section>
<section class="band"><div class="wrap contact-grid">
  <div>
    <h2>Send an enquiry</h2>
    <form action="/api/enquiry" method="post">
      <div class="row">
        <div class="field"><label for="name">Name</label><input id="name" name="name" autocomplete="name" required></div>
        <div class="field"><label for="phone">Phone</label><input id="phone" name="phone" type="tel" autocomplete="tel" required></div>
      </div>
      <div class="row">
        <div class="field"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" required></div>
        <div class="field"><label for="suburb">Suburb of the job</label><input id="suburb" name="suburb" autocomplete="address-level2"></div>
      </div>
      <div class="field"><label for="type">Type of work</label>
        <select id="type" name="type" required><option value="">Choose one</option><option>New home</option><option>Granny flat</option><option>Renovation or extension</option><option>NDIS home modification</option><option>Development</option><option>Commercial fit-out</option><option>Building permit or inspection</option><option>Vehicle turntable</option><option>Civil, council or concrete works</option><option>Something else</option></select></div>
      <div class="field"><label for="role">Are you the owner, the builder or the designer?</label>
        <select id="role" name="role"><option value="">Choose one</option><option>Owner</option><option>Builder</option><option>Designer or OT</option><option>Other</option></select></div>
      <div class="field"><label for="message">Tell us about the job</label><textarea id="message" name="message" required></textarea>
        <p class="hint">If you have plans or photos, mention it and we'll ask for them when we reply.</p></div>
      <div class="field" style="position:absolute;left:-9999px" aria-hidden="true"><label for="website">Leave this empty</label><input id="website" name="website" tabindex="-1" autocomplete="off"></div>
      ${TURNSTILE_SITEKEY ? `<div class="cf-turnstile" data-sitekey="${TURNSTILE_SITEKEY}"></div>` : ""}
      <button class="btn" type="submit">Send enquiry</button>
      <p class="hint" id="form-status" role="status" aria-live="polite"></p>
      <p class="hint" style="margin-top:10px">We use your details to reply to your enquiry and prepare a quote. Our <a href="privacy.html">privacy policy</a> explains how we collect, use, store and correct personal information.</p>
    </form>
  </div>
  <aside>
    <div class="details">
      <p class="eyebrow">Call ${CONTACT}</p>
      <a class="big-phone" href="tel:${TEL}">${PHONE}</a>
      <dl>
        <dt>Email</dt><dd><a href="mailto:${EMAIL}">${EMAIL}</a></dd>
        <dt>Office</dt><dd>Suite 4/48 Edgewater Blvd<br>Maribyrnong VIC 3032</dd>
        <dt>Hours</dt><dd>Monday to Friday, 9 am to 5 pm</dd>
        <dt>Areas</dt><dd>Melbourne's north, west and east</dd>
      </dl>
    </div>
    <div class="details" style="margin-top:16px">
      <h3>Book a site visit</h3>
      <p>Call ${CONTACT} on <a href="tel:${TEL}">${PHONE}</a> between 9 am and 5 pm, Monday to Friday, or send the form and we will ring you to arrange a time to see the site.</p>
    </div>
  </aside>
</div></section>`);

fs.mkdirSync(OUT, { recursive: true });
const clean = (h) => h.replace(/href="([a-z-]+)\.html(#[^"]*)?"/g, (m, n, hash) => `href="${n === "index" ? "/" : "/" + n}${hash || ""}"`);
for (const [f, html] of Object.entries(pages)) fs.writeFileSync(path.join(OUT, f), clean(html));
console.log("pages:", Object.keys(pages).join(", "));
