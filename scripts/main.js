/* =========================================================
   Aditya Raj Pandey — Portfolio interactions
   ========================================================= */
(function () {
  "use strict";

  const root = document.documentElement;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

  /* ----- Footer year ----- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* =======================================================
     Featured post — config-driven clickable card above
     Experience. Renders from FEATURED immediately, then
     enriches with live metadata (LinkedIn via the microlink
     unfurl proxy, GitHub via the REST API). Any fetch failure
     silently keeps the config fallbacks.
     ======================================================= */
  // Each entry renders one card (in order), stacked above the Experience section.
  // Add a card by dropping another object in this list; remove one by deleting it or
  // setting enabled:false. `title`/`excerpt`/`image` are fallbacks shown instantly, then
  // enriched by the live fetch when available.
  const FEATURED = [
    {
      enabled: true,
      source: "linkedin", // "linkedin" | "github"
      url: "https://www.linkedin.com/posts/pandey23770_cheq-problemsolving-aihackathon-activity-7438533295669211136-Ss5s",
      title: "Team Orbit — 1st Place, CheQ Point AI Hackathon",
      excerpt: "Grateful to share that Team Orbit secured 🥇 First Place at the CheQ Point AI Hackathon!",
      image: "assets/cover.png",
    },

    // A GitHub repo card. Omit `image` and it defaults to the standard GitHub mark,
    // then swaps to the repo's live social-preview image (name, ★ stars, language).
    {
      enabled: true,
      source: "github",
      url: "https://github.com/Aditya23770/mass-emailer-cron",
      title: "Mass Emailer Cron",
      excerpt: "An Inteligent way to send bulk emails using cron jobs and Gmail API, with features like scheduling, personalization, and tracking.",
    },
  ];

  const SOURCE_ICON = {
    linkedin: '<path d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1-.02-5ZM3 9h4v12H3zM10 9h3.8v1.7h.05A4.2 4.2 0 0 1 17.6 9c4 0 4.7 2.6 4.7 6V21h-4v-5.3c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21h-4z"/>',
    github: '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3-.3 6.2-1.5 6.2-6.7A5.2 5.2 0 0 0 20 4.8 4.9 4.9 0 0 0 19.9 1S18.7.6 16 2.5a13.4 13.4 0 0 0-7 0C6.3.6 5.1 1 5.1 1A4.9 4.9 0 0 0 5 4.8a5.2 5.2 0 0 0-1.5 3.7c0 5.2 3.2 6.4 6.2 6.7a3.4 3.4 0 0 0-.9 2.6V22"/>',
  };

  // GitHub cards fall back to a standard GitHub mark until the live preview loads.
  const GITHUB_FALLBACK_IMAGE = "assets/github-card.svg";

  function buildFeatured() {
    const experience = $("#experience");
    if (!experience) return;
    const items = FEATURED.filter((it) => it && it.enabled);
    if (!items.length) return;

    const band = document.createElement("div");
    band.className = "featured reveal";
    const container = document.createElement("div");
    container.className = "container";
    const list = document.createElement("div");
    list.className = "featured__list";
    container.appendChild(list);
    band.appendChild(container);

    items.forEach((item) => list.appendChild(buildFeaturedCard(item)));
    experience.parentNode.insertBefore(band, experience);
  }

  function buildFeaturedCard(item) {
    const sourceLabel = item.source === "github" ? "GitHub" : "LinkedIn";
    const ctaLabel = item.source === "github" ? "View repo" : "View post";
    const icon = SOURCE_ICON[item.source] || SOURCE_ICON.linkedin;

    const card = document.createElement("a");
    card.className = "featured-card";
    card.target = "_blank";
    card.rel = "noopener";
    card.innerHTML =
      '<span class="featured-card__media">' +
        '<img class="featured-card__thumb" alt="" loading="lazy" decoding="async" />' +
      '</span>' +
      '<span class="featured-card__body">' +
        '<span class="featured-card__badge">' +
          '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">' + icon + '</svg>' +
          '<span class="featured-card__src"></span>' +
        '</span>' +
        '<span class="featured-card__title"></span>' +
        '<span class="featured-card__excerpt"></span>' +
      '</span>' +
      '<span class="featured-card__cta" aria-hidden="true">' + ctaLabel +
        '<svg class="ic" viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8"/></svg>' +
      '</span>';

    const thumbEl = $(".featured-card__thumb", card);
    const srcEl = $(".featured-card__src", card);
    const titleEl = $(".featured-card__title", card);
    const excerptEl = $(".featured-card__excerpt", card);

    // Config fallbacks first — the card always looks complete.
    card.href = item.url;
    card.setAttribute(
      "aria-label",
      "Featured: " + item.title + " — opens " + sourceLabel + " in a new tab"
    );
    thumbEl.src = item.image || (item.source === "github" ? GITHUB_FALLBACK_IMAGE : "assets/cover.png");
    srcEl.textContent = "Featured · " + sourceLabel;
    titleEl.textContent = item.title;
    excerptEl.textContent = item.excerpt;

    enrichFeatured(item, { titleEl, excerptEl, thumbEl });
    return card;
  }

  async function enrichFeatured(item, els) {
    try {
      const meta =
        item.source === "github"
          ? await fetchGitHubMeta(item.url)
          : await fetchLinkUnfurl(item.url);
      if (!meta) return;
      if (meta.title) els.titleEl.textContent = meta.title;
      if (meta.excerpt) els.excerptEl.textContent = meta.excerpt;
      if (meta.image) {
        // Swap the thumbnail only if the remote image actually loads.
        const probe = new Image();
        probe.onload = () => { els.thumbEl.src = meta.image; };
        probe.src = meta.image;
      }
    } catch (_) {
      /* keep config fallbacks */
    }
  }

  async function fetchJson(url, ms) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms || 6000);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      return res.ok ? await res.json() : null;
    } finally {
      clearTimeout(timer);
    }
  }

  async function fetchLinkUnfurl(url) {
    const json = await fetchJson("https://api.microlink.io/?url=" + encodeURIComponent(url), 6000);
    if (!json || json.status !== "success" || !json.data) return null;
    const d = json.data;
    // Note: LinkedIn's OG title is hashtag soup ("#tag #tag | Name"), so we keep the
    // curated config title and only enrich the image + excerpt from the live post.
    return {
      title: "",
      excerpt: d.description || "",
      image: d.image && d.image.url ? d.image.url : "",
    };
  }

  async function fetchGitHubMeta(url) {
    const m = url.match(/github\.com\/([^/]+)\/([^/?#]+)/i);
    if (!m) return null;
    const repo = m[2].replace(/\.git$/, "");
    const d = await fetchJson("https://api.github.com/repos/" + m[1] + "/" + repo, 6000);
    if (!d) return null;
    // Keep the curated config title; enrich the excerpt + GitHub's generated
    // social-preview image (which itself shows name, ★ stars and language).
    return {
      title: "",
      excerpt: d.description || "",
      image: "https://opengraph.githubassets.com/1/" + m[1] + "/" + repo,
    };
  }

  buildFeatured();

  /* =======================================================
     Section-wise color system + active nav link
     ======================================================= */
  const colorSections = $$("[data-bg]");
  const navLinks = $$(".nav__links a");
  const navLinkById = {};
  navLinks.forEach((a) => {
    const id = a.getAttribute("href").replace("#", "");
    navLinkById[id] = a;
  });

  function applyColors(el) {
    const bg = el.getAttribute("data-bg");
    const fg = el.getAttribute("data-fg");
    const accent = el.getAttribute("data-accent");
    if (bg) root.style.setProperty("--bg", bg);
    if (fg) root.style.setProperty("--fg", fg);
    if (accent) root.style.setProperty("--accent", accent);
    root.style.setProperty("--theme-color", bg || "#001233");

    // sync the browser theme-color meta
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta && bg) meta.setAttribute("content", bg);

    // active nav link
    const id = el.id;
    if (id) {
      navLinks.forEach((a) => a.classList.remove("is-active"));
      if (navLinkById[id]) navLinkById[id].classList.add("is-active");
    }
  }

  // The section whose middle slice crosses the viewport center becomes active.
  const colorObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) applyColors(entry.target);
      });
    },
    { rootMargin: "-48% 0px -48% 0px", threshold: 0 }
  );
  colorSections.forEach((s) => colorObserver.observe(s));

  /* =======================================================
     Scroll progress bar + nav state + back-to-top
     ======================================================= */
  const progressBar = $("#progressBar");
  const nav = $("#nav");
  const toTop = $("#toTop");
  let ticking = false;

  function onScroll() {
    const st = window.scrollY || document.documentElement.scrollTop;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docH > 0 ? (st / docH) * 100 : 0;

    if (progressBar) progressBar.style.width = pct + "%";
    if (nav) nav.classList.toggle("is-scrolled", st > 8);

    if (toTop) {
      const show = st > window.innerHeight * 0.7;
      toTop.hidden = false;
      toTop.classList.toggle("is-visible", show);
    }
    ticking = false;
  }
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    });
  }

  /* =======================================================
     Mobile menu
     ======================================================= */
  const navToggle = $("#navToggle");
  const mobileMenu = $("#mobileMenu");
  if (navToggle && mobileMenu) {
    const closeMenu = () => {
      mobileMenu.hidden = true;
      navToggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
    };
    navToggle.addEventListener("click", () => {
      const open = mobileMenu.hidden;
      mobileMenu.hidden = !open;
      navToggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    });
    $$("a", mobileMenu).forEach((a) => a.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !mobileMenu.hidden) closeMenu();
    });
  }

  /* =======================================================
     Reveal on scroll
     ======================================================= */
  const reveals = $$(".reveal");
  if (prefersReduced) {
    reveals.forEach((el) => el.classList.add("is-in"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    );
    reveals.forEach((el) => revealObserver.observe(el));
  }

  /* =======================================================
     Animated value helper
     ======================================================= */
  function animateValue(target, to, duration, formatter) {
    if (prefersReduced) {
      target.textContent = formatter(to);
      return;
    }
    const start = performance.now();
    function frame(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      target.textContent = formatter(to * eased);
      if (p < 1) requestAnimationFrame(frame);
      else target.textContent = formatter(to);
    }
    requestAnimationFrame(frame);
  }

  /* ----- Stat counters (about) ----- */
  const statNums = $$(".stat__num[data-count]");
  if (statNums.length) {
    const statObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const to = parseFloat(el.dataset.count);
          const suffix = el.dataset.suffix || "";
          animateValue(el, to, 1500, (v) => {
            const n = Math.round(v);
            const str = suffix.includes("k") ? String(n) : n.toLocaleString("en-US");
            return str + suffix;
          });
          obs.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );
    statNums.forEach((el) => statObserver.observe(el));
  }

  /* =======================================================
     Running experience counters
     ======================================================= */
  function monthsBetween(from, to) {
    let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
    if (to.getDate() < from.getDate()) months -= 1; // not a full month yet
    return Math.max(0, months);
  }
  function fmtDuration(totalMonths) {
    const m = Math.round(totalMonths);
    const yrs = Math.floor(m / 12);
    const mos = m % 12;
    if (yrs <= 0) return mos + " mo";
    return yrs + (yrs > 1 ? " yrs " : " yr ") + mos + " mo";
  }

  const countersWrap = $(".counters");
  if (countersWrap) {
    const now = new Date();
    const ftStart = new Date(countersWrap.dataset.fulltimeStart);
    const internMonths = parseInt(countersWrap.dataset.internMonths || "0", 10);
    const ftMonths = monthsBetween(ftStart, now);
    const totalMonths = internMonths + ftMonths;

    const ftEl = $("#ftCounter");
    const totalEl = $("#totalCounter");

    const counterObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (ftEl) animateValue(ftEl, ftMonths, 1400, fmtDuration);
          if (totalEl) animateValue(totalEl, totalMonths, 1600, fmtDuration);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );
    counterObserver.observe(countersWrap);
  }

  /* =======================================================
     Copy email
     ======================================================= */
  const copyBtn = $("#copyEmail");
  const copyState = $("#copyState");
  const EMAIL = "adityarajpandey770@gmail.com";
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(EMAIL);
        if (copyState) {
          copyState.textContent = "Copied!";
          setTimeout(() => (copyState.textContent = "Copy"), 1800);
        }
      } catch (err) {
        // Fallback: open mail client
        window.location.href = "mailto:" + EMAIL;
      }
    });
  }

  /* =======================================================
     Contact form — Netlify Forms via AJAX, mailto fallback
     ======================================================= */
  const form = $(".contact__form");
  const formStatus = $("#formStatus");
  if (form) {
    const setStatus = (msg, type) => {
      if (!formStatus) return;
      formStatus.textContent = msg;
      if (type) formStatus.setAttribute("data-type", type);
      else formStatus.removeAttribute("data-type");
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Honeypot — silently ignore bots
      const honey = form.querySelector('[name="bot-field"]');
      if (honey && honey.value) return;

      const data = new FormData(form);
      const params = new URLSearchParams();
      for (const [k, v] of data.entries()) params.append(k, v);

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      setStatus("Sending…", "");

      try {
        const res = await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params.toString(),
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        form.reset();
        setStatus("Thanks — your message has been sent. I'll get back to you soon.", "ok");
      } catch (err) {
        // Local preview (python http.server returns 501) or a non-Netlify host:
        // gracefully fall back to the visitor's email client.
        const subject = encodeURIComponent("Portfolio enquiry — " + (data.get("name") || ""));
        const body = encodeURIComponent(
          (data.get("message") || "") +
            "\n\n— " + (data.get("name") || "") + " (" + (data.get("email") || "") + ")"
        );
        setStatus("Opening your email app…");
        window.location.href = "mailto:" + EMAIL + "?subject=" + subject + "&body=" + body;
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
})();
