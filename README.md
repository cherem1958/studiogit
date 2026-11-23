# Scriptorium

A personal daily observatory for financial operations, deliberate study and philosophical reflection. The visual language combines illuminated-manuscript geometry, an original celestial engraving, aged gold, parchment and a modern midnight-blue interface. All product copy is in English. No external fonts, images, analytics or AI-generated economic claims are loaded.

## Open the site

The reading scale uses the browser's default font size as its base. At the usual 16 px default, auxiliary text is at least 13 px, main task text and descriptions are 16 px, and form inputs are 16 px. On phones, the header, task controls and progress area wrap into readable rows instead of shrinking text. The original palette, serif headings and artwork are preserved.

**Published site:** https://cherem1958.github.io/studiogit/ ? the repository already has GitHub Pages configured. Its existing deployment updates the generated index after commits to main.

**Standalone:** open `index.html` directly in a modern browser. The file contains the entire interface and application code. Tasks, editing, search, backups, philosophy and responsive layouts work without a server. An internet connection is required for weather and economic observations; official APIs support direct browser requests.

**Recommended local server:** with Node.js 22 or newer, double-click `start.cmd`, or run:

```sh
node server.mjs
```

Open **http://localhost:3000**. No installation, paid service, API key or runtime dependency is required. Keep the terminal open while using the server. On Windows, `node` must be available on PATH. If port 3000 is occupied, set `PORT` to another port.

The parent workspace also contains the identical standalone `index.html` and `start-scriptorium.cmd`. The repository is now in the `studiogit` folder, replacing the long original export folder name.

### Phone access

The design adapts to desktop and mobile widths. To access the server from a phone on the same trusted Wi-Fi, explicitly set `HOST=0.0.0.0` before starting, then open `http://<computer-LAN-IP>:3000`. Your computer must stay on; normal firewall rules apply. The default listener is `127.0.0.1`. A static host can also serve the standalone file. This repository update does not itself activate public hosting.

Tasks are independent in each browser and origin. Opening the file and using localhost creates separate storage locations. Use task export/import to transfer data. There is no account, cloud database or automatic cross-device task synchronization.

## Live sources and update policy

| Indicator | BCB SGS series | Unit | Source publication |
| --- | --- | --- | --- |
| USD / BRL | 1 | BRL per USD, selling reference | Business days |
| EUR / BRL | 21619 | BRL per EUR, selling reference | Business days |
| Selic target | 432 | Percent per year | Daily record; changes after policy decisions |
| CDI | 4389 | Percent per year, annualized on 252 business days | Business days |
| IPCA, trailing 12 months | 13522 | Percent accumulated over 12 months | Monthly |
| IPCA, monthly | 433 | Percent month over month | Monthly |

Economic data comes from the [BCB SGS API](https://api.bcb.gov.br/). Source links on each card point to the exact official series. IPCA originates from IBGE; the CDI reference originates from B3. Weather comes from [Open-Meteo](https://open-meteo.com/en/docs) for Belo Horizonte (-19.9208, -43.9378); it is model output, not a specific station reading.

- Economic sources are checked on page load, hourly while visible, on return when due and after a detected date change. Failed requests have a five-minute automatic retry cooldown. A manual refresh retries immediately in standalone mode; the backend retains its provider cache/cooldown to avoid upstream request storms.
- With the server running, economic sources are checked hourly and weather every fifteen minutes even when the page is closed. The scheduler checks due work once per minute. When the server and page are both closed, nothing runs; opening the page refreshes data again. No browser can guarantee a background timer when suspended.
- Weather is checked every fifteen minutes while visible. Returning to the page checks whether a refresh is due.
- `As of` is the source observation date/month. `Checked` is the last successful fetch. These are deliberately separate. Monthly inflation does not become a daily observation simply because it was fetched today.
- Provider rows are validated, sorted, deduplicated and bounded to the current Belo Horizonte date. Conflicting duplicates and invalid values fail the affected series. Future rows are excluded.
- A failed series does not hide successful indicators. Last successfully fetched economic data can be retained for seven days and is labeled cached after a failed refresh. Older observations are also flagged: over seven days for daily series or seventy-five days for monthly series. Weather older than six hours is discarded.
- All six charts use up to twelve actual observations, with separate vertical scales. FX changes are relative percentages; rate and inflation changes are percentage points versus the previous published observation. Neither direction is labeled good or bad.

## Tasks and the daily routine

Create, edit, complete, reopen, search, filter and delete tasks. Deletions offer an Undo action. Fields include area, due date and priority. Overdue tasks carry forward; the application never clears them at midnight. The completion progress covers tasks due by today; the separate daily counter uses the actual completion date.

Study planning covers Ancord & CPA, Introduction to Aristotle, St. Augustine's Confessions, Calculus II and C++. Each course creates an editable study task. Daily philosophical reflections rotate between Aristotle, St. Thomas Aquinas, St. Anselm, Søren Kierkegaard, Olavo de Carvalho and Wolfgang Smith. They are clearly labeled original reflections, not attributed quotations or generated scholarship.

Tasks are saved under `scriptorium.tasks.v2` in localStorage. The earlier Essencial export/key and the old AI Studio task key are supported. Known default Portuguese titles are migrated to English; custom user content is preserved. Old storage keys are left intact. Existing data cannot be transferred automatically between different origins.

JSON backups contain tasks and completion dates, never credentials. Imports validate schema, dates, IDs, uniqueness, file size (2 MB) and total count (5,000). Existing local IDs win during merge. Invalid storage is not silently overwritten. An explicit recovery action preserves the old value in a separate recovery key before saving the displayed list. Clearing browser data can remove tasks; keep exported backups.

## Architecture and development

```text
index.html                  Generated, self-contained site
src/template.html           Accessible page structure and original SVG artwork
src/styles.css              Responsive visual system
src/core.js                 Pure task, date, migration and chart functions
src/providers.js            Shared provider configuration and validation
src/app.js                  Browser interactions, persistence and data refresh
server.mjs                  Restricted HTTP server, compression and security headers
lib/data-service.mjs        Coalesced fetches, TTL cache and retry policy
scripts/build.mjs           Deterministic assembly; no bundler required
scripts/check-live.mjs      Optional real-provider verification
tests/                     Core, provider, service, HTTP and DOM integration tests
.github/workflows/checks.yml Automated build-consistency and test checks
```

The runtime uses only native browser APIs and Node built-ins. The sole direct development dependency is linkedom, used for DOM integration tests. The npm lockfile pins its dependency tree. React, Vite, Tailwind, Gemini, Three.js, AI Studio media and unused legacy modules were removed. Their history remains in Git.

```sh
npm ci --ignore-scripts
npm run build
npm run check
npm test
npm run check:live
```

On Windows with PowerShell execution-policy restrictions, use `npm.cmd` in place of `npm`. The normal unit/DOM tests are deterministic and do not use external services. `check:live` intentionally contacts official providers and may fail during outages; it is not a CI gate. After source edits, build the HTML. To also update the copy in the parent workspace:

```sh
node scripts/build.mjs --copy=../index.html
```

Static hosts use the official APIs directly, without probing nonexistent backend routes. The Node server opts the generated page into its same-origin API with a server-controlled metadata flag. `.nojekyll` keeps the published site free of template processing.

The HTTP server only exposes `/`, `/index.html`, `/api/health`, `/api/economy` and `/api/weather`. It does not serve arbitrary repository files or accept task uploads. It uses gzip, ETags, an inline-script hash in the Content Security Policy, a deny-by-default resource policy, anti-framing headers and request timeouts. The API does not accept arbitrary upstream URLs. Each provider request has a deadline; simultaneous requests share in-flight work. A validated provider snapshot is saved atomically under ignored `.cache/` for restart recovery. Tasks never enter the server.

## Engineering review

| Earlier finding | Resolution |
| --- | --- |
| Conflicting framework dependencies prevented installation | Removed unused runtime dependency graph; server and standalone site run without install |
| Single HTML mixed concerns and was hard to verify | Modular source with a deterministic generated single-file artifact |
| Legacy server could present sample weather as real data | Real-data-only providers, explicit unavailable/cached states, source and observation timestamps |
| No economic data pipeline | Six official series, validation, histories, refresh scheduling and partial-failure handling |
| Tasks lacked editing and deletion recovery | Full task lifecycle, search, undo, dated completion and validated backup merge |
| Daily completion would be lost on reload | Completion dates are part of the portable validated schema |
| Storage and imports could lose prior work | Migration, corrupt-data preservation, empty-list handling, limits and same-browser cross-tab updates |
| Visual identity and language did not match the brief | Original medieval/modern system, English interface, responsive breakpoints and reduced-motion support |
| Repository carried unused AI Studio code and media | Removed obsolete files; preserved their Git history; renamed the local checkout |

Validation includes 21 automated tests covering real failure modes: source ordering and future observations, malformed values, request timeouts, cache coalescing/expiry/recovery, route isolation and headers, task CRUD/undo, text-injection resistance, storage migration, corruption, backups, cross-tab changes and Belo Horizonte midnight. All six economic series and the weather endpoint were also checked against real responses during implementation.

DOM integration tests do not render CSS. Desktop/mobile visual inspection and native browser file-storage behavior could not be verified through a live browser in this session because the browser/computer-use host was unavailable. Responsive rules are implemented, but an actual-device visual pass remains outstanding. External-source uptime, future API changes and device connectivity are dependencies; the site reports failures rather than inventing fresh data.
