# Scriptorium — project instructions

These instructions apply to this repository and its subdirectories. Follow the user's current request and preserve existing work. Read `README.md` and the relevant source files before changing behavior.

## Product and language

- Scriptorium is a personal daily observatory for financial BPO, study, philosophy, Belo Horizonte weather and Brazilian economic indicators.
- Keep all product copy, labels, messages, dates and number formatting in English. The user may give instructions in Portuguese; respond in the user's language.
- Preserve custom user content during migrations and imports. Translate only known application defaults when appropriate.
- The primary action is **Review pending tasks**. Keep daily work easy to reach on desktop and mobile.
- Preserve the study subjects and thinkers defined in `src/core.js` unless the user requests a change.
- Clearly distinguish original philosophical reflections from verbatim quotations. Use verifiable references for any actual quotations; do not invent attributions.

## Visual identity and accessibility

- Preserve the fusion of medieval manuscript art and modern interface design: midnight blue, aged gold, parchment, restrained ornament, serif headings and readable modern controls.
- Use the existing CSS variables and original celestial SVG as the starting point. Avoid arbitrary replacement palettes, unrelated visual styles or unnecessary external assets.
- Keep layouts responsive, text readable, controls usable by touch and all interactions accessible by keyboard.
- Preserve visible focus indicators, semantic structure, accessible names, reduced-motion support and meaningful loading, empty and error states.
- Evaluate changes at narrow phone and desktop widths. Prevent horizontal overflow and clipped dialogs.

## Source files and generated artifacts

- `src/template.html`: page structure, dialogs, metadata and original SVG artwork.
- `src/styles.css`: visual system and responsive layouts.
- `src/core.js`: pure task, date, migration and chart functions.
- `src/providers.js`: shared official-source configuration and provider validation.
- `src/app.js`: browser interactions, persistence and refresh scheduling.
- `lib/data-service.mjs`: backend cache, coalesced requests and retry policy.
- `server.mjs`: restricted HTTP server and response headers.
- `scripts/build.mjs`: deterministic assembly of the standalone site.
- Change the source files, then rebuild `index.html`. Do not make independent edits to the generated HTML.
- Keep the built site self-contained and usable as a local HTML file and on GitHub Pages. The Node server is an optional enhancement.
- In the existing `landing` workspace, update both HTML copies with `node scripts/build.mjs --copy=../index.html`, run from this repository. In a separate checkout, use the normal build; do not write into an unrelated parent directory.
- Keep runtime dependencies minimal. Add libraries only for a concrete benefit, explain the tradeoff and update the lockfile when dependencies change.
- Keep imports compatible with the current assembler, which removes single-line imports and top-level export keywords. Update the assembler and its checks if the module format changes.

## Economic data and weather

- Use official, documented sources. The configured economic series are BCB SGS 1, 21619, 432, 4389, 13522 and 433; verify definitions before adding or changing a series.
- Distinguish observation date, reference month, last successful fetch and failed refresh. Checking a monthly series today does not make it a daily release.
- Preserve accurate units: BRL per foreign-currency unit, annual interest rates, monthly inflation and twelve-month inflation. FX changes are relative percentages; rate/inflation changes are percentage points.
- Validate upstream payloads before rendering or caching. Sort by date, handle duplicates, exclude future observations and isolate failures by series.
- Never invent financial or weather values, fill missing observations with estimates, fabricate freshness or label directional changes as inherently good or bad.
- Keep source links and inspectable histories. Sparklines represent actual observations and use independent scales.
- Preserve the refresh policy unless deliberately changing it: economics hourly, weather every fifteen minutes, and a five-minute automatic retry cooldown after failures.
- Mark fallback data as cached. Retain economic fetches for at most seven days; discard weather observations older than six hours. Flag old economic reference dates separately from fetch failures.
- Use `America/Sao_Paulo` for the local clock and day boundaries, independent of the execution host's timezone.
- GitHub Pages serves static files and does not run `server.mjs`. Preserve direct official-API access there. Only the Node server enables the same-origin API metadata flag.
- Background refresh requires a running page, server or explicitly configured scheduler. Do not promise updates while all execution environments are stopped.

## Tasks, persistence and privacy

- Preserve task IDs, custom titles, due dates, priorities, completion state and completion dates.
- Carry overdue tasks forward. Do not reset or clear pending tasks at midnight.
- Preserve schema validation, migration from earlier storage keys, empty-list handling, cross-tab updates and corrupt-data recovery.
- Do not overwrite unreadable stored data silently. Preserve recoverable originals before an explicit replacement action.
- Keep imports atomic and validated. Existing local IDs win during merge. Respect the current 2 MB import limit and 5,000-task limit unless intentionally redesigning them.
- Keep editing, deletion undo, export and import functional.
- Tasks currently stay in the browser. Do not claim automatic cross-device synchronization. A synchronization feature needs an explicit persistence/authentication design and migration plan.
- Use safe DOM APIs such as `textContent` for user and provider data. Do not insert untrusted content as HTML.
- Keep credentials, private task exports and provider caches out of Git. Never put secret API keys in the standalone HTML.

## Verification and delivery

Run commands from the repository root. Node.js 22 or newer is required.

```sh
npm ci --ignore-scripts   # Install development dependencies when missing or changed.
npm run build            # Regenerate the standalone HTML after source changes.
npm run check            # Verify generated HTML matches its sources.
npm test                 # Run deterministic core, provider, service, HTTP and DOM tests.
npm run check:live       # Optional: contact the actual official data providers.
```

- On Windows, use `npm.cmd` if PowerShell blocks `npm.ps1`.
- Run build consistency and relevant tests after code changes. Add meaningful regression tests for bugs or new behavior; avoid tests that merely repeat implementation details.
- Documentation-only changes do not require application tests unless they alter executable configuration or reveal a relevant concern.
- There is currently no configured ESLint, Prettier or Playwright test suite. Do not claim those checks ran or invoke nonexistent scripts. Configure them explicitly if requested or needed.
- DOM tests do not render CSS. Use browser tooling available and permitted in the current environment for visual and end-to-end verification. If unavailable, state the limitation accurately.
- External API outages must not make deterministic tests flaky. Keep live-source checks separate and report genuine source failures without substituting sample data.
- Maintain GitHub Actions verification and Pages compatibility. Do not equate a successful commit or build with successful deployment; verify the relevant result when deployment is in scope.
- Keep changes focused, preserve unrelated user edits and use reviewable commits. Avoid destructive resets, force-pushes and history rewrites.
- Update `README.md` when behavior, setup, architecture, persistence or data semantics change.
- Report the outcome, relevant verification and remaining material limitations. Clearly distinguish implemented functionality, tested behavior and proposed future work.
