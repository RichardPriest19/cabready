(() => {
  const STORE_KEY = "cabready";

  const state = {
    household: { nights: 4, drivers: 1, europe: 1, winter: 1 },
    have: {},
    filter: "all",
  };

  // Saved state is a convenience only: the page works without it.
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
    if (saved.household) Object.assign(state.household, saved.household);
    if (saved.have) state.have = saved.have;
  } catch (_) {}

  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ household: state.household, have: state.have }));
    } catch (_) {}
  }

  const $ = (sel) => document.querySelector(sel);
  const visibleProducts = () => visibleFor(state.household);

  // ---- Background photos (hero, banner) --------------------------------------
  // The build script pre-sets these; only fill in any that are missing.
  const wide = window.innerWidth > 900 ? 1600 : 900;
  document.querySelectorAll("[data-photo]").forEach((el) => {
    if (!el.style.backgroundImage) {
      el.style.backgroundImage = `url("${photo(el.dataset.photo, wide, Math.round(wide * 0.7))}")`;
    }
  });

  // ---- Situation tiles -------------------------------------------------------
  $("#tiles").innerHTML = SITUATIONS.map(tileHTML).join("");
  $("#tiles").addEventListener("click", (e) => {
    const tile = e.target.closest("[data-filter]");
    if (!tile) return;
    setFilter(tile.dataset.filter);
    $("#kit").scrollIntoView({ behavior: "smooth" });
  });

  // ---- Trip counters and switches --------------------------------------------
  const MIN = { nights: 0, drivers: 1 };
  const MAX = { nights: 14, drivers: 2 };
  document.querySelectorAll(".counter[data-key]").forEach((el) => {
    const key = el.dataset.key;
    const out = el.querySelector("output");
    out.textContent = state.household[key];
    el.querySelectorAll("button").forEach((btn) =>
      btn.addEventListener("click", () => {
        const next = Math.min(MAX[key], Math.max(MIN[key], state.household[key] + Number(btn.dataset.step)));
        if (next === state.household[key]) return;
        state.household[key] = next;
        out.textContent = next;
        save();
        renderAll();
      })
    );
  });

  document.querySelectorAll("[data-switch]").forEach((input) => {
    const key = input.dataset.switch;
    input.checked = !!state.household[key];
    input.addEventListener("change", () => {
      state.household[key] = input.checked ? 1 : 0;
      save();
      renderAll();
    });
  });

  function renderSummary() {
    $("#household-summary").innerHTML = summaryHTML(state.household);
  }

  // ---- Filters ---------------------------------------------------------------
  function renderFilters() {
    $("#filters").innerHTML = filtersHTML(state.filter);
  }
  function setFilter(id) {
    state.filter = id;
    renderFilters();
    renderGrid();
  }
  $("#filters").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-filter]");
    if (btn) setFilter(btn.dataset.filter);
  });

  // ---- Product grid ----------------------------------------------------------
  function renderGrid() {
    const items = visibleProducts().filter((p) => state.filter === "all" || p.category === state.filter);
    $("#grid").innerHTML = items.length
      ? items.map((p) => cardHTML(p, state.household, state.have)).join("")
      : `<p class="empty">Nothing in this group for your trip. Try “Everything”.</p>`;
  }

  $("#grid").addEventListener("click", (e) => {
    const open = e.target.closest("[data-open]");
    if (open) openModal(open.dataset.open);
  });
  $("#grid").addEventListener("change", (e) => {
    if (e.target.matches("[data-have]")) setHave(e.target.dataset.have, e.target.checked);
  });

  // ---- Essentials ------------------------------------------------------------
  function renderEssentials() {
    const items = ESSENTIALS.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean);
    $("#essentials-list").innerHTML = items.map((p, i) => essentialHTML(p, i, state.household, state.have)).join("");
    const done = items.filter((p) => state.have[p.id]).length;
    $("#ess-progress-bar").style.width = `${(done / items.length) * 100}%`;
    $("#ess-progress-label").textContent = done === items.length ? "All 10 essentials ready" : `${done} of ${items.length} essentials ready`;
  }

  $("#essentials-list").addEventListener("click", (e) => {
    const open = e.target.closest("[data-open]");
    if (open) openModal(open.dataset.open);
  });
  $("#essentials-list").addEventListener("change", (e) => {
    if (e.target.matches("[data-have]")) setHave(e.target.dataset.have, e.target.checked);
  });

  function setHave(id, value) {
    if (value) state.have[id] = true;
    else delete state.have[id];
    save();
    const card = document.querySelector(`.card[data-id="${id}"]`);
    if (card) {
      const media = card.querySelector(".card-media");
      const got = media.querySelector(".got");
      if (value && !got) media.insertAdjacentHTML("beforeend", '<span class="got">✓ Got it</span>');
      if (!value && got) got.remove();
      card.querySelector("[data-have]").checked = value;
    }
    renderProgress();
    renderEssentials();
  }

  function renderProgress() {
    const items = visibleProducts();
    const done = items.filter((p) => state.have[p.id]).length;
    $("#kit-progress-bar").style.width = `${items.length ? (done / items.length) * 100 : 0}%`;
    $("#kit-progress-label").textContent = `${done} of ${items.length} items ready`;
    $("#header-count").textContent = done;
  }

  // ---- Modal -----------------------------------------------------------------
  const modal = $("#modal");
  const AFFILIATE_NOTE = $("#modal-note").textContent;
  let current = null;

  function openModal(id) {
    const p = PRODUCTS.find((x) => x.id === id);
    if (!p) return;
    current = p;
    $("#modal-img").src = photo(p.id, 900, 900);
    $("#modal-img").alt = p.name;
    $("#modal-cat").textContent = categoryLabel(p.category) + (p.official ? " · Required by law in some countries" : "");
    $("#modal-title").textContent = p.name;
    $("#modal-lede").textContent = p.summary;
    $("#modal-qty").innerHTML = `<span>For your trip</span><strong>${p.qty(state.household)}</strong>`;
    $("#modal-why").textContent = p.why;
    $("#modal-look").innerHTML = p.lookFor.map((t) => `<li>${t}</li>`).join("");
    const [main, ...extras] = buyLinks(p);
    const buy = $("#modal-buy");
    buy.hidden = !main;
    if (main) {
      buy.href = main.url;
      buy.textContent = main.label;
    }
    $("#modal-extra-buys").innerHTML = extras
      .map((b) => `<a class="btn btn-amazon" href="${b.url}" target="_blank" rel="sponsored noopener nofollow">${b.label}</a>`)
      .join("");
    $("#modal-note").textContent = main ? AFFILIATE_NOTE : p.noBuy;
    $("#modal-have").checked = !!state.have[p.id];
    if (typeof modal.showModal === "function") modal.showModal();
    else modal.setAttribute("open", "");
  }

  function closeModal() {
    if (typeof modal.close === "function") modal.close();
    else modal.removeAttribute("open");
  }

  $("#modal-close").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  $("#modal-have").addEventListener("change", (e) => current && setHave(current.id, e.target.checked));

  // ---- Photo credits ---------------------------------------------------------
  $("#credits").innerHTML = creditsHTML();

  // ---- Back to top -----------------------------------------------------------
  const toTop = $("#to-top");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const updateToTop = () => toTop.classList.toggle("show", window.scrollY > 600);
  window.addEventListener("scroll", updateToTop, { passive: true });
  toTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduceMotion.matches ? "auto" : "smooth" });
    $(".brand").focus({ preventScroll: true });
  });
  updateToTop();

  // ---- Init ------------------------------------------------------------------
  function renderAll() {
    renderSummary();
    renderEssentials();
    renderGrid();
    renderProgress();
  }

  $("#year").textContent = new Date().getFullYear();
  renderFilters();
  renderAll();
})();
