// Build script: run `node build.js` after editing products, photos or content.
// - Pre-renders the kit into index.html so search engines see the full content
// - Generates the guide pages, sitemap.xml and robots.txt
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const SITE = "https://richardpriest19.github.io/cabready/";

const load = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const lib = new Function(
  load("photos.js") + load("products.js") + load("render.js") +
    "; return { PHOTOS, photo, PRODUCTS, CATEGORIES, SITUATIONS, ESSENTIALS, amazonUrl, tileHTML, summaryHTML, filtersHTML, cardHTML, essentialHTML, buyLinks, creditsHTML, visibleFor };"
)();
const { PHOTOS, photo, PRODUCTS, SITUATIONS, ESSENTIALS } = lib;

const now = new Date();
const UPDATED = now.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
const ISO_DATE = now.toISOString().slice(0, 10);
const YEAR = now.getFullYear();

const byId = (id) => PRODUCTS.find((p) => p.id === id);
const abs = (u) => (/^https?:/.test(u) ? u : SITE + u);
const jsonld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`;
const strip = (html) => html.replace(/<[^>]+>/g, "");

function fill(html, name, content) {
  const re = new RegExp(`<!--pre:${name}-->[\\s\\S]*?<!--/pre:${name}-->`);
  if (!re.test(html)) throw new Error(`marker missing: ${name}`);
  return html.replace(re, () => `<!--pre:${name}-->${content}<!--/pre:${name}-->`);
}

function faqHTML(faq) {
  return faq
    .map((f) => `\n          <details><summary>${f.q}</summary><div class="faq-a">${f.a.map((p) => `<p>${p}</p>`).join("")}</div></details>`)
    .join("") + "\n        ";
}

function faqLD(faq) {
  return {
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a.map(strip).join(" ") },
    })),
  };
}

// ---------------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------------
const HOME_FAQ = [
  {
    q: "What should a truck driver keep in the cab?",
    a: [
      "At a minimum: hi-vis, safety boots, work gloves, a head torch, a first aid kit, a truck sat nav, a dash cam, a way to keep food cool and drinks hot, and a 24V charger for your phone.",
      "If you do nights out, add bedding, a wash kit and a carbon monoxide alarm if you use a night heater. Our <a href=\"#essentials\">10 essentials</a> list is the place to start.",
    ],
  },
  {
    q: "What equipment do I need to drive a truck in Europe?",
    a: [
      "Most European countries require a hi-vis vest within reach of the driver and a warning triangle. Some, such as Germany and Austria, require a first aid kit. France requires blind spot stickers on vehicles over 3.5 tonnes and a Crit'Air sticker in low-emission zones. You'll also need a UK sticker unless your number plate shows the UK identifier, and adjusted headlights.",
      "In winter, Austria and mountain areas of France and Italy require snow chains. See our <a href=\"driving-a-truck-in-europe/\">Europe kit guide</a> for the full list.",
    ],
  },
  {
    q: "Will 12V car accessories work in a truck?",
    a: [
      "Usually not. Most trucks run on 24V. A 12V-only kettle, cool box or charger can fail, overheat or blow a fuse. Look for accessories rated 24V, or 12–24V, or use a 24V to 12V converter.",
    ],
  },
  {
    q: "How much food and water should I take for a week of nights out?",
    a: [
      "Plan on around 3 litres of water a day, more in hot weather, and two meals a day from home if you have a cool box. For five nights out that's about 18 litres of water and 12 meals. Use our <a href=\"#household\">trip planner</a> to work it out for your trip.",
    ],
  },
  {
    q: "Can I take my weekly rest in the cab?",
    a: [
      "Under the EU and GB rules, you can't take a regular weekly rest (45 hours or more) in the cab. Reduced weekly rests and daily rests can be taken in the cab if it has suitable sleeping facilities and the vehicle is stationary. Check the government's <a href=\"https://www.gov.uk/guidance/drivers-hours-goods-vehicles\" target=\"_blank\" rel=\"noopener\">drivers' hours guidance</a> for the full rules.",
    ],
  },
  {
    q: "Is CabReady connected to an operator or the government?",
    a: [
      "No. CabReady is an independent site. We earn a small commission if you buy through our Amazon links, at no extra cost to you.",
    ],
  },
];

const GUIDES = [
  {
    slug: "driving-a-truck-in-europe",
    title: "Driving a Truck in Europe: Kit Checklist for UK HGV Drivers (2026)",
    description: "The equipment UK HGV drivers need to drive in Europe: hi-vis, warning triangle, first aid kit, UK sticker, French blind spot stickers, Crit'Air and snow chains.",
    h1: "Driving a truck in Europe: the kit you need",
    tile: "Driving in Europe",
    tileText: "The legal kit, country by country",
    photo: "europe",
    intro: [
      "Every country in Europe has its own rules on what you must carry in a truck, and the fines for getting it wrong are often paid on the spot. The good news is that one well-stocked cab covers almost every country on a typical route.",
      "Before you go, check the latest advice on <a href=\"https://www.gov.uk/guidance/driving-in-the-eu\" target=\"_blank\" rel=\"noopener\">GOV.UK</a> and with your operator, and make sure your paperwork is in order: driving licence, Driver CPC card, tachograph card, passport and the vehicle and load documents.",
      "<h2>The rules that catch UK drivers out</h2>",
      "<strong>Hi-vis within reach.</strong> In France, Spain, Italy, Belgium and many other countries the vest must be in the cab, not in a side locker, so you can put it on before you get out.",
      "<strong>France.</strong> Vehicles over 3.5 tonnes must show 'angles morts' blind spot stickers and speed limit discs on the back, and you need a Crit'Air sticker to enter low-emission zones in cities such as Paris and Lyon. Order the Crit'Air sticker only from the official government site.",
      "<strong>Winter.</strong> Austria requires trucks over 3.5 tonnes to carry snow chains from 1 November to 15 April, and mountain areas of France and Italy have their own winter equipment rules.",
      "<h2>What to carry</h2>",
    ],
    items: ["docwallet", "hivis", "triangle", "firstaid", "ukSticker", "deflectors", "blindspot", "speeddiscs", "critair", "breathalyser", "bulbkit", "extinguisher", "snowchains"],
    faq: [
      { q: "Do I need a UK sticker on my truck?", a: ["You need a UK sticker unless your number plate shows the UK identifier (the letters UK, with or without the Union flag). In Spain, Cyprus and Malta you need the sticker whatever your plate shows. GB stickers are no longer valid and should be covered or removed."] },
      { q: "Do UK trucks need French blind spot stickers?", a: ["Yes. Since 2021, all vehicles over 3.5 tonnes driving in France, including foreign ones, must show the official 'angles morts' stickers on both sides and the rear."] },
      { q: "Do I still need a breathalyser in France?", a: ["French law still says drivers should carry one, but the fine for not having one was dropped, so it isn't enforced. Many drivers carry a twin pack anyway."] },
      { q: "Where can I buy a Crit'Air sticker?", a: ["Only from the official French government site, certificat-air.gouv.fr. Other websites resell the same sticker for much more."] },
    ],
  },
  {
    slug: "truck-nights-out-kit",
    title: "Truck Nights Out Checklist: What to Pack for Sleeping in the Cab",
    description: "What HGV drivers should pack for nights out in the cab: bedding, food and drink, a wash kit, security and how much water and food to take.",
    h1: "Nights out in the cab: what to pack",
    tile: "Nights out kit",
    tileText: "Sleep, eat and wash on the road",
    photo: "nightsout",
    intro: [
      "A week of nights out is much easier with the right kit. The aim is simple: sleep well, eat properly without spending a fortune at the services, and stay clean and safe.",
      "Fatigue is a factor in many serious truck crashes, so good sleep is a safety issue, not a luxury. Block out noise and light, keep the bunk warm (or cool), and lock yourself in at night.",
      "<h2>How much food and water to take</h2>",
    ],
    table: true,
    after: [
      "These amounts assume around 3 litres of water a day and two meals a day from home, kept in a 24V cool box. Take more water in hot weather or if you're handballing loads.",
      "<h2>Stay safe at night</h2>",
      "Park in a secure, well-lit truck park where you can, especially with high-value loads. Lock the doors, use a cab door strap, and if you run a diesel night heater, fit a carbon monoxide alarm near the bunk.",
      "<h2>What to pack</h2>",
    ],
    items: ["sleepingbag", "pillow", "sleepmask", "coolbox", "kettle", "lunchheater", "flask", "water", "snacks", "toiletries", "towel", "flipflops", "fan", "doorstrap", "coalarm"],
    faq: [
      { q: "What do truck drivers need for nights out?", a: ["Bedding (a sleeping bag or duvet and a pillow), an eye mask and ear plugs, a 24V cool box and kettle, a flask, a wash bag and towel, shower flip-flops and something to secure the cab doors at night."] },
      { q: "Can I run a microwave in my truck?", a: ["Most cabs can't run a microwave without a large inverter and extra batteries. A 24V lunch box heater or kettle is a simpler, safer way to have hot food."] },
      { q: "Is it safe to use a night heater while sleeping?", a: ["Diesel night heaters are designed for it and are safe when properly installed and maintained. Have it serviced, never block the exhaust, and fit a carbon monoxide alarm by the bunk."] },
    ],
  },
  {
    slug: "winter-truck-kit",
    title: "Winter Truck Kit: What HGV Drivers Need for Snow and Ice",
    description: "Winter kit for UK and European truck drivers: snow chains, ice scraper, de-icer, a 24V jump starter, warm clothing and what to keep in the cab in case you're stuck.",
    h1: "Winter kit for truck drivers",
    tile: "Winter truck kit",
    tileText: "Snow chains, ice and cold nights",
    photo: "snowroad",
    intro: [
      "Winter is when trucks get stuck: closed passes, motorways blocked by jack-knifed trailers, and frozen mornings in a lay-by. A few extra items in the cab make a long, cold wait much easier and can stop you being turned back at a border.",
      "<h2>Winter rules in Europe</h2>",
      "Austria requires trucks over 3.5 tonnes to carry snow chains from 1 November to 15 April. Mountain areas of France and Italy have their own winter rules, shown by road signs, and Germany requires winter tyres in wintry conditions. Practise fitting chains in daylight at the yard before you need them.",
      "<h2>If you get stuck</h2>",
      "Keep the fuel tank well filled, carry extra food, water and warm clothes, and don't run the engine to stay warm if the exhaust could be blocked by snow. A charged phone and power bank let you call for help and follow updates.",
      "<h2>What to keep in the cab</h2>",
    ],
    items: ["snowchains", "scraper", "jumpstarter", "handwarmers", "jacket", "socks", "gloves", "headtorch", "flask", "sleepingbag", "powerbank", "snacks"],
    faq: [
      { q: "When do trucks need snow chains in Austria?", a: ["Trucks over 3.5 tonnes must carry snow chains from 1 November to 15 April, and fit them when signs or conditions require it."] },
      { q: "Do trucks need winter tyres in Germany?", a: ["Germany requires winter tyres (marked with the mountain snowflake symbol) on the drive axle and steering axle of trucks in wintry conditions such as snow, ice or frost."] },
      { q: "What should I do if I'm stuck in snow in my truck?", a: ["Stay with the vehicle unless it's unsafe, put on your hi-vis, call for help, and listen to traffic radio for updates. Keep warm with layers and a sleeping bag, and check the exhaust isn't blocked if you run the engine or heater."] },
    ],
  },
  {
    slug: "truck-security",
    title: "Truck Security Checklist: Protect Your Load, Cab and Yourself",
    description: "How HGV drivers can protect their cab, trailer and load from theft and avoid clandestine entrant fines on routes to the UK, with the kit to carry.",
    h1: "Truck security: protect your load, cab and yourself",
    tile: "Truck security",
    tileText: "Load theft and clandestine entrants",
    photo: "security",
    intro: [
      "Cargo theft and break-ins at parking areas are a real risk for drivers in the UK and across Europe. On routes into the UK there's another one: you can be fined up to £10,000 for each person found hidden in your vehicle if you can't show you secured and checked it properly.",
      "<h2>Check every time you stop</h2>",
      "Lock and seal the trailer after loading, record the seal numbers, and check the seals, locks, roof, curtains and underneath every time you stop and before you board a ferry or train. Keep a written vehicle checklist; it's your evidence that you followed the rules.",
      "<h2>Protect yourself</h2>",
      "Where you can, park in secure, well-lit truck parks, especially on the approach to Channel ports. Lock the cab doors and use a door strap at night, and keep valuables out of sight. A dash cam records anything that happens around the truck.",
      "<h2>What to carry</h2>",
    ],
    items: ["padlock", "seals", "doorstrap", "dashcam", "headtorch", "ratchet", "docwallet"],
    faq: [
      { q: "What is the fine for clandestine entrants in the UK?", a: ["Up to £10,000 for each person found hidden in a vehicle, and the penalty can apply to the driver, the owner and the operator. You can reduce the risk by securing the vehicle properly and keeping an up-to-date vehicle checklist."] },
      { q: "How can I stop people getting into my trailer?", a: ["Use strong padlocks and numbered seals, check the TIR cord and curtains, park in secure areas, and check the whole vehicle every time you stop."] },
      { q: "How do I secure my cab at night?", a: ["Lock the doors and use a strap or bar that links the door handles from the inside, so they can't be opened from outside. Keep the keys and your phone within reach."] },
    ],
  },
];

// ---------------------------------------------------------------------------------
// Shared page pieces
// ---------------------------------------------------------------------------------
const FONTS =
  '<link rel="preconnect" href="https://fonts.googleapis.com">\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n  <link rel="preconnect" href="https://images.unsplash.com">\n  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">';

function headMeta({ url, title, description, image, prefix = "" }) {
  return `
  <link rel="canonical" href="${url}">
  <link rel="icon" href="${prefix}favicon.svg" type="image/svg+xml">
  <meta name="theme-color" content="#383c41">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="CabReady">
  <meta property="og:locale" content="en_GB">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">
  `;
}

function footerGuides(prefix) {
  return GUIDES.map((g) => `<a href="${prefix}${g.slug}/">${g.tile}</a>`).join("");
}

// ---------------------------------------------------------------------------------
// Home page
// ---------------------------------------------------------------------------------
function buildHome() {
  const file = path.join(ROOT, "index.html");
  let html = fs.readFileSync(file, "utf8");
  const h = { nights: 4, drivers: 1, europe: 1, winter: 1 };
  const title = "HGV Driver Kit List 2026: UK & Europe | CabReady";
  const description =
    "The kit every UK truck driver needs: PPE, cab living, food, tech and the legal kit for driving an HGV in Europe, sized for your trip.";
  const ogImage = abs(photo("hero", 1200, 630));

  html = fill(html, "head", headMeta({ url: SITE, title, description, image: ogImage }) +
    `<link rel="preload" as="image" href="${photo("hero", 1600, 1120)}">\n  `);
  html = fill(html, "jsonld", jsonld({
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", "@id": SITE + "#website", url: SITE, name: "CabReady", inLanguage: "en-GB", description },
      { "@type": "WebPage", "@id": SITE + "#page", url: SITE, name: title, isPartOf: { "@id": SITE + "#website" }, dateModified: ISO_DATE, inLanguage: "en-GB" },
      {
        "@type": "ItemList",
        name: "The 10 essentials every truck driver needs",
        itemListElement: ESSENTIALS.map((id, i) => ({ "@type": "ListItem", position: i + 1, name: byId(id).name })),
      },
      faqLD(HOME_FAQ),
    ],
  }));

  // Hero and banner photos, so the largest image starts loading before any JavaScript runs
  html = html.replace(/(<(?:div|section) [^>]*?data-photo="(\w+)")(?: style="[^"]*")?>/g,
    (m, start, key) => `${start} style="background-image:url('${photo(key, 1600, 1120)}')">`);

  html = fill(html, "tiles", SITUATIONS.map(lib.tileHTML).join("") + "\n      ");
  html = fill(html, "summary", lib.summaryHTML(h));
  html = fill(html, "essentials", ESSENTIALS.map((id, i) => lib.essentialHTML(byId(id), i, h, {})).join("") + "\n      ");
  html = fill(html, "filters", lib.filtersHTML("all"));
  html = fill(html, "grid", lib.visibleFor(h).map((p) => lib.cardHTML(p, h, {})).join("") + "\n      ");
  html = fill(html, "credits", lib.creditsHTML());
  html = fill(html, "year", String(YEAR));
  html = fill(html, "footerguides", footerGuides(""));
  html = fill(html, "updated", `Last updated ${UPDATED}.`);
  html = fill(html, "faq", faqHTML(HOME_FAQ));
  html = fill(html, "guides", GUIDES.map((g) => `
        <a class="guide-tile" href="${g.slug}/">
          <img src="${photo(g.photo, 640, 400)}" alt="" loading="lazy" width="640" height="400">
          <span>${g.tile}</span>
          <small>${g.tileText}</small>
        </a>`).join("") + "\n      ");
  fs.writeFileSync(file, html);
}

// ---------------------------------------------------------------------------------
// Guide pages
// ---------------------------------------------------------------------------------
const ONE = { nights: 0, drivers: 1, europe: 1, winter: 1 };
const FAMILY = { nights: 5, drivers: 1, europe: 1, winter: 1 };

function waterTable() {
  const rows = [1, 2, 3, 4, 5, 6].map((n) =>
    `<tr><td>${n} ${n === 1 ? "night" : "nights"}</td><td>${(n + 1) * 3} litres</td><td>${(n + 1) * 2} meals</td><td>${(n + 1) * 2} snacks</td></tr>`
  ).join("");
  return `<table class="guide-table"><thead><tr><th>Nights out</th><th>Water (3L a day)</th><th>Meals from home</th><th>Snacks</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function guideItem(p, prefix) {
  const img = photo(p.id, 600, 600);
  const src = /^https?:/.test(img) ? img : prefix + img;
  const buys = lib.buyLinks(p);
  const buyHTML = buys.length
    ? `<div class="gi-buys">${buys.map((b) => `<a class="btn btn-amazon" href="${b.url}" target="_blank" rel="sponsored noopener nofollow">${b.label}</a>`).join("")}</div>
          <p class="gi-note">Affiliate link. Prices and availability are shown on Amazon. Photo is illustrative.</p>`
    : `<p class="gi-note">${p.noBuy || ""}</p>`;
  return `
        <li class="guide-item" id="${p.id}">
          <img src="${src}" alt="${p.name}" loading="lazy" width="600" height="600">
          <div>
            <h3>${p.name}</h3>
            <p class="gi-summary">${p.summary}${p.official ? " <em>Required by law in some countries.</em>" : ""}</p>
            <p class="gi-amounts"><strong>For day runs:</strong> ${p.qty(ONE)}<br><strong>For a week of nights out:</strong> ${p.qty(FAMILY)}</p>
            <p>${p.why}</p>
            <ul>${p.lookFor.map((t) => `<li>${t}</li>`).join("")}</ul>
            ${buyHTML}
          </div>
        </li>`;
}

function buildGuide(g) {
  const prefix = "../";
  const url = `${SITE}${g.slug}/`;
  const items = g.items.map(byId).filter(Boolean);
  const heroImg = photo(g.photo, 1600, 900);
  const heroSrc = /^https?:/.test(heroImg) ? heroImg : prefix + heroImg;
  const photoKeys = [g.photo, ...items.map((p) => p.id)];
  const related = GUIDES.filter((o) => o.slug !== g.slug);
  const body = [
    ...g.intro,
    ...(g.table ? [waterTable()] : []),
    ...(g.after || []),
  ].map((x) => (x.startsWith("<h2>") || x.startsWith("<table") ? x : `<p>${x}</p>`)).join("\n        ");

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: g.h1,
        description: g.description,
        image: abs(heroImg),
        dateModified: ISO_DATE,
        inLanguage: "en-GB",
        mainEntityOfPage: url,
        author: { "@type": "Organization", name: "CabReady", url: SITE },
        publisher: { "@type": "Organization", name: "CabReady", url: SITE },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE },
          { "@type": "ListItem", position: 2, name: g.tile, item: url },
        ],
      },
      faqLD(g.faq),
    ],
  };

  const html = `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${g.title}</title>
  <meta name="description" content="${g.description}">${headMeta({ url, title: g.title, description: g.description, image: abs(heroImg), prefix })}
  ${FONTS}
  <link rel="stylesheet" href="${prefix}styles.css">
  ${jsonld(ld)}
</head>
<body>
  <div class="promo-bar">
    <span>For UK &amp; European truck drivers</span>
    <span class="promo-sep" aria-hidden="true">•</span>
    <span>As an Amazon Associate we earn from qualifying purchases</span>
  </div>

  <header class="site-header">
    <div class="header-inner">
      <a class="brand" href="${prefix}">
        <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3 9.5h15v13H3zM18 13.5h6l4.5 5v4H18" /><circle cx="9" cy="24" r="2.6" /><circle cx="23" cy="24" r="2.6" /></svg>
        <span><b>Cab</b>Ready</span>
      </a>
      <nav>
        <a href="${prefix}#essentials">Essentials</a>
        <a href="${prefix}#kit">Full kit</a>
        ${related.map((o) => `<a href="${prefix}${o.slug}/">${o.tile}</a>`).join("\n        ")}
      </nav>
    </div>
  </header>

  <main>
    <section class="guide-hero" style="background:#5c6166 url('${heroSrc}') center / cover">
      <div class="guide-hero-inner">
        <p class="breadcrumb"><a href="${prefix}">Home</a> › ${g.tile}</p>
        <h1>${g.h1}</h1>
        <p class="updated">Last updated ${UPDATED}</p>
      </div>
    </section>

    <div class="guide-main">
      <div class="prose">
        ${body}
      </div>

      <ol class="guide-items">${items.map((p) => guideItem(p, prefix)).join("")}
      </ol>

      <div class="guide-cta">
        <div>
          <h2>Plan the kit for your trip</h2>
          <p>Our free planner sizes food, water and kit for your nights out, Europe and winter driving.</p>
        </div>
        <a class="btn btn-light" href="${prefix}#household">Open the planner</a>
      </div>

      <section class="faq" aria-labelledby="faq-title">
        <h2 id="faq-title" style="font-size:clamp(24px,3vw,32px);margin:0 0 16px">Frequently asked questions</h2>${faqHTML(g.faq)}
      </section>

      <h2 style="font-size:24px;margin:40px 0 16px">More guides</h2>
      <div class="related">${related.map((o) => `
        <a class="guide-tile" href="${prefix}${o.slug}/">
          <span>${o.tile}</span>
          <small>${o.tileText}</small>
        </a>`).join("")}
      </div>
    </div>
  </main>

  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <span><b>Cab</b>Ready</span>
        <p>Kit lists for UK and European truck drivers, one item at a time.</p>
      </div>
      <div class="footer-text">
        <p>
          <strong>Affiliate disclosure:</strong> CabReady is a participant in the Amazon EU Associates Programme, an affiliate
          advertising programme designed to provide a means for sites to earn advertising fees by advertising and linking to
          Amazon.co.uk. If you buy through our links we may earn a small commission, at no extra cost to you.
        </p>
        <p>Guidance on this site is general information, not legal or professional advice. Always follow your operator's rules and the law in each country you drive in. In an emergency, call 999 in the UK or 112 anywhere in Europe.</p>
        <p class="credits">${lib.creditsHTML(photoKeys)}</p>
        <p class="footer-guides"><a href="${prefix}">HGV driver kit list</a>${footerGuides(prefix)}</p>
        <p>© ${YEAR} CabReady</p>
      </div>
    </div>
  </footer>
</body>
</html>
`;
  fs.mkdirSync(path.join(ROOT, g.slug), { recursive: true });
  fs.writeFileSync(path.join(ROOT, g.slug, "index.html"), html);
}

// ---------------------------------------------------------------------------------
// Sitemap and robots
// ---------------------------------------------------------------------------------
function buildSitemap() {
  const urls = [SITE, ...GUIDES.map((g) => `${SITE}${g.slug}/`)];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc><lastmod>${ISO_DATE}</lastmod></url>`).join("\n")}
</urlset>
`;
  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), xml);
  fs.writeFileSync(path.join(ROOT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`);
}

buildHome();
GUIDES.forEach(buildGuide);
buildSitemap();
console.log(`Built home + ${GUIDES.length} guides, sitemap and robots (${UPDATED}).`);
