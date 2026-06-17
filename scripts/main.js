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
