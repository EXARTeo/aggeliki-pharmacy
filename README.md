# Φαρμακείο Πλαταριάς — website

Static, vanilla HTML/CSS/JS site for the Plataria pharmacy. Deploys directly to GitHub Pages — no build step, no dependencies.

## Quick start

```bash
# serve locally (any static server works)
python3 -m http.server 8000
# then visit http://localhost:8000
```

Edit `index.html`, `style.css`, or `script.js` — refresh the browser.

## Project layout

```
index.html          single-page site, 6 sections
style.css           design tokens + all layout
script.js           entry, imports js/* modules
js/
  i18n.js           translation loader + language switcher
  live-status.js    open/closed pill (Europe/Athens schedule)
  gallery.js        native <dialog> lightbox
  nav.js            mobile menu, scroll-spy, floating call button
i18n/
  el.json  en.json  it.json  de.json
assets/
  images/   icons/  fonts/  favicon/
```

## Content to fill in

The markup uses `{{TOKEN}}` placeholders wherever real data belongs. Search+replace all of the following:

### Identity
- `{{PHARMACY_NAME}}` — e.g. `Φαρμακείο Πλαταριάς — Επώνυμο`
- `{{PHARMACIST_NAME}}` — e.g. `Φαρμακοποιός Όνομα Επώνυμο`
- `{{UNIVERSITY}}` — e.g. `ΕΚΠΑ`
- `{{GRAD_YEAR}}`, `{{SINCE_YEAR}}` — 4-digit years
- `{{LICENSE_NUMBER}}` — άδεια ασκήσεως επαγγέλματος

### Contact
- `{{PHONE_E164}}` — international format for `tel:` links, e.g. `+302665012345`
- `{{PHONE_DISPLAY}}` — human-readable, e.g. `26650 12345`
- `{{STREET}}`, `{{ZIP}}` — street/number and postal code
- `{{DOMAIN}}` — the live domain, e.g. `farmakeio-plataria.gr` or `username.github.io/pharmacy-plataria`

### Map
- Open the short link in a browser: `https://maps.app.goo.gl/CzqNmCfwqszmAR9L8`
- From the expanded URL, extract the `@LAT,LNG,ZOOM` segment
- Replace `{{LAT}}` and `{{LNG}}` everywhere

### Optional
- `{{INSTAGRAM_URL}}`, `{{FACEBOOK_URL}}` — full profile URLs (or remove those rows in `index.html`)

## Images

Expected paths (add real WebP files to replace placeholders):

```
assets/images/hero/hero-640.webp      (640×480,   hero mobile)
assets/images/hero/hero-1280.webp     (1280×960,  hero tablet/desktop)
assets/images/hero/hero-1920.webp     (1920×1440, hero large)
assets/images/pharmacist/portrait.webp (600×750 square-ish)
assets/images/gallery/01-exterior.webp
assets/images/gallery/02-counter.webp
assets/images/gallery/03-shelves.webp
assets/images/gallery/04-consultation.webp
assets/images/gallery/05-cosmetics.webp
assets/images/gallery/06-measurement.webp
assets/images/map-preview.webp         (800×600, screenshot from Google Maps)
assets/images/og-cover.jpg             (1200×630, social share)
assets/favicon/apple-touch-icon.png    (180×180)
```

Missing images fall back to `assets/images/placeholder.svg` automatically.

### Converting phone photos to WebP

```bash
# macOS/Linux (install first: brew install webp, or apt install webp)
cwebp -q 82 input.jpg -o output.webp

# resize + convert:
cwebp -q 82 -resize 1280 0 input.jpg -o hero-1280.webp
```

## Languages

- **EL** (primary, fully written)
- **EN** (fully translated)
- **IT** (basic translation — refine for tone)
- **DE** (basic translation — refine for tone)

Adding a language:

1. Copy `i18n/en.json` → `i18n/xx.json`, translate.
2. Add the code to `SUPPORTED` in `js/i18n.js`.
3. Add an `<li>` to `#lang-menu` in `index.html`.
4. Add an `<link rel="alternate" hreflang="xx">` in `<head>`.

## Live status

Pharmacy hours are hard-coded in `js/live-status.js` under `SCHEDULE`. The pill refreshes every 60 s and displays in the visitor's local rendering but computed against `Europe/Athens`.

**To change hours:** edit `SCHEDULE` in `js/live-status.js` AND the dl table in `#hours` section AND the `openingHoursSpecification` in the JSON-LD block in `<head>`.

## Deploy to GitHub Pages

1. Push the repo to GitHub.
2. Repo Settings → **Pages** → Source: *Deploy from a branch* → Branch: `main` → Folder: `/ (root)`.
3. Wait ~60 s, visit `https://<username>.github.io/<repo>/`.
4. (Optional) custom domain: add `CNAME` file with the domain, point DNS to GitHub Pages IPs.

Every push to `main` redeploys. No Actions needed.

## Performance

Design targets:
- Total page weight ≤ 300 KB (with real images)
- JS bundle ≤ 15 KB unminified
- Lighthouse mobile: Perf ≥ 95, A11y ≥ 95, SEO = 100

To verify: run Chrome DevTools Lighthouse on the deployed URL, mobile preset.

## License

Content © {{PHARMACIST_NAME}}. Code: do what you like, just don't resell as a template.
