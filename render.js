// HTML templates shared by the browser (app.js) and the build script (build.js),
// so the pre-rendered page and the live page always match.

function categoryLabel(id) {
  return (CATEGORIES.find((c) => c.id === id) || {}).label || "";
}


function visibleFor(h) {
  return PRODUCTS.filter((p) => !p.showWhen || p.showWhen(h));
}

function tileHTML(s) {
  return `
      <button type="button" class="tile" data-filter="${s.filter}">
        <span class="tile-img" data-photo="${s.photo}" style="background-image:url('${photo(s.photo, 800, 600)}')"></span>
        <span class="tile-body">
          <span class="tile-title">${s.title}</span>
          <span class="tile-text">${s.text}</span>
          <span class="tile-btn">Shop the kit</span>
        </span>
      </button>`;
}

function summaryHTML(h) {
  const d = (h.nights + 1) * h.drivers;
  return `
      <div class="stat"><strong>${d * 3}L</strong><span>water for the trip</span></div>
      <div class="stat"><strong>${d * 2}</strong><span>meals from home</span></div>
      <div class="stat"><strong>${visibleFor(h).length}</strong><span>items to get</span></div>
    `;
}

function filtersHTML(active) {
  return CATEGORIES.map(
    (c) => `<button type="button" role="tab" class="chip" data-filter="${c.id}" aria-selected="${active === c.id}">${c.label}</button>`
  ).join("");
}

function cardHTML(p, h, have) {
  return `
        <article class="card ${have[p.id] ? "is-have" : ""}" data-id="${p.id}">
          <button type="button" class="card-open" data-open="${p.id}" aria-label="More about ${p.name}">
            <div class="card-media">
              <img src="${photo(p.id, 600, 600)}" alt="${p.name}" loading="lazy" width="600" height="600">
              ${p.official ? '<span class="badge">Legal kit</span>' : ""}
              ${have[p.id] ? '<span class="got">✓ Got it</span>' : ""}
            </div>
            <div class="card-body">
              <p class="card-cat">${categoryLabel(p.category)}</p>
              <h3>${p.name}</h3>
              <p class="card-summary">${p.summary}</p>
              <p class="card-qty">${p.qty(h)}</p>
            </div>
          </button>
          <div class="card-foot">
            <label class="have-toggle"><input type="checkbox" data-have="${p.id}" ${have[p.id] ? "checked" : ""}> I have this</label>
            <button type="button" class="btn btn-primary" data-open="${p.id}">View</button>
          </div>
        </article>`;
}

function essentialHTML(p, i, h, have) {
  return `
        <li class="ess-item ${have[p.id] ? "is-have" : ""}">
          <span class="ess-num">${have[p.id] ? "✓" : i + 1}</span>
          <button type="button" class="ess-open" data-open="${p.id}" aria-label="More about ${p.name}">
            <img src="${photo(p.id, 160, 160)}" alt="" loading="lazy" width="64" height="64">
            <span class="ess-text"><span class="ess-name">${p.name}</span><span class="ess-qty">${p.qty(h)}</span></span>
          </button>
          <span class="ess-actions">
            <label class="have-toggle"><input type="checkbox" data-have="${p.id}" ${have[p.id] ? "checked" : ""}> Got it</label>
            <button type="button" class="btn btn-primary" data-open="${p.id}">View</button>
          </span>
        </li>`;
}

function buyLinks(p) {
  const url = amazonUrl(p);
  if (!url) return [];
  return [{ label: p.buyLabel || "View on Amazon UK", url }].concat(
    (p.extraBuys || []).map((b) => ({ label: b.label, url: amazonUrl({ asin: b.asin }) }))
  );
}

function creditsHTML(keys) {
  const people = new Map();
  (keys || Object.keys(PHOTOS)).forEach((k) => PHOTOS[k] && people.set(PHOTOS[k].by, PHOTOS[k].link));
  return (
    "Photos on <a href='https://unsplash.com' target='_blank' rel='noopener'>Unsplash</a> by " +
    [...people].map(([by, link]) => `<a href="${link}" target="_blank" rel="noopener">${by}</a>`).join(", ") +
    ". Product photos are illustrative."
  );
}
