# Aditya Raj Pandey — Portfolio

A fast, accessible, single-page portfolio with a signature **scroll-driven, section-by-section
colour shift** through a *Deep Sea Blue* palette. Built as a **zero-build static site** — plain HTML,
CSS, and vanilla JavaScript. No frameworks, no bundler, no `npm install`.

---

## 1. Before you do anything: add your résumé

The "Download CV" buttons point to `assets/Aditya-Raj-Pandey-Resume.pdf`.

> **Copy your AI/ML résumé PDF into the `assets/` folder and name it exactly:**
> ```
> assets/Aditya-Raj-Pandey-Resume.pdf
> ```

Until you do, the download button will 404 — everything else works without it.

Your photos are already wired in: `assets/profile.png` (the circular hero portrait) and
`assets/cover.png` (the hero card banner, also used as the social-share preview image). Swap those
files (keep the names) to change them.

---

## 2. Preview locally

Because the contact form and some browser features prefer a real server, the best way to preview is a
tiny local server (any one of these):

```bash
# Python (already on most machines)
python -m http.server 5500
#  → open http://localhost:5500

# OR Node, if you have it
npx serve .

# OR VS Code: install the "Live Server" extension, right-click index.html → "Open with Live Server"
```

You can also just double-click `index.html` to open it in a browser — it will render fine; only the
Netlify contact form needs the deployed site to actually deliver messages.

---

## 3. Deploy to Netlify (recommended)

### Option A — Drag & drop (fastest, ~60 seconds)

1. Make sure your résumé PDF is in `assets/` (step 1).
2. Go to **app.netlify.com** and sign in (free).
3. Click **Add new site → Deploy manually**.
4. Drag the **entire `portfolio` folder** onto the upload area.
5. Netlify gives you a live URL like `https://random-name.netlify.app`.
6. Rename it under **Site settings → Change site name** (e.g. `adityarajpandey` →
   `https://adityarajpandey.netlify.app`).

> If you change the site name, update the URLs in `index.html` (the `og:url`, `canonical`,
> JSON-LD `url`), `robots.txt`, and `sitemap.xml` to match — used for SEO/social previews.

### Option B — Connect a Git repo (auto-deploys on every push)

1. Create a GitHub repo and push this folder:
   ```bash
   git init
   git add .
   git commit -m "Portfolio site"
   git branch -M main
   git remote add origin https://github.com/Aditya23770/portfolio.git
   git push -u origin main
   ```
2. In Netlify: **Add new site → Import from Git → GitHub →** pick the repo.
3. Leave **build command empty** and **publish directory = `.`** (already set in `netlify.toml`).
4. Deploy. Every future `git push` redeploys automatically.

### Contact form (works automatically on Netlify)

The contact form uses **Netlify Forms** (`data-netlify="true"`). Once deployed, submissions appear in
your Netlify dashboard under **Forms → contact**. Turn on email notifications there
(**Site settings → Forms → Form notifications**) to get messages in your inbox. No backend needed.
*(The form only collects submissions on the deployed Netlify site, not on `localhost`.)*

### Custom domain (optional)

**Site settings → Domain management → Add a domain** → follow the DNS steps. HTTPS is automatic.

---

## 4. Alternative hosting

<details>
<summary><strong>GitHub Pages</strong></summary>

1. Push to a repo (see Option B).
2. **Repo → Settings → Pages →** Source: `Deploy from a branch`, Branch: `main`, Folder: `/ (root)`.
3. Your site goes live at `https://aditya23770.github.io/portfolio/`.

> Note: GitHub Pages does **not** process the Netlify contact form. Replace the form with a `mailto:`
> link or a service like Formspree if you host here.
</details>

<details>
<summary><strong>Vercel / Cloudflare Pages</strong></summary>

Import the repo, set **framework preset = Other / None**, **build command = empty**, **output dir = `.`**.
</details>

---

## 5. Project structure

```
portfolio/
├─ index.html            # all content + SEO meta + JSON-LD
├─ 404.html              # styled not-found page
├─ styles/main.css       # Deep Sea Blue theme + scroll colour system + responsive
├─ scripts/main.js       # scroll colours, progress bar, counters, reveal, nav, copy-email
├─ assets/
│  ├─ Aditya-Raj-Pandey-Resume.pdf   ← confirm this is the AI/ML version
│  ├─ profile.png         (circular hero portrait)
│  ├─ cover.png           (hero banner + social preview)
│  └─ favicon.svg
├─ robots.txt
├─ sitemap.xml
├─ site.webmanifest
└─ netlify.toml
```

---

## 6. Editing content

All text lives in `index.html` — find the section (each is clearly commented, e.g. `<!-- EXPERIENCE -->`)
and edit in place. A few specifics:

- **Section colours**: each `<section>` carries `data-bg`, `data-fg`, and `data-accent`. Change those
  hex values to retune the scroll palette; `scripts/main.js` applies them automatically.
- **Experience counters**: the `<div class="counters">` element holds `data-fulltime-start="2025-11-01"`
  and `data-intern-months="14"`. They compute live in the browser and tick up over time — no manual
  updates needed.
- **Stat counters** (About): edit `data-count` / `data-suffix` on each `.stat__num`.

---

## 7. Accessibility & performance

- Semantic landmarks, skip-link, ARIA labels, visible focus rings, and AA-contrast colour pairs.
- Honours `prefers-reduced-motion` (animations calm down automatically).
- No framework payload; only Google Fonts is loaded externally. Run **Lighthouse** in Chrome DevTools
  to confirm scores.

---

Built with HTML, CSS & vanilla JavaScript.
