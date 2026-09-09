# Copilot Instructions for this workspace

## Project overview
This repository is a small JavaScript/NPM package that exposes Bootstrap Select option data for countries, country phone codes, languages, time zones, US states, and UK counties.

Key package facts:
- Package name: `@trilbdev/boostrap-select-country-data`
- Primary entrypoint: `index.js`
- Source implementation: `src/js/index.js`
- Data source files: `src/json/*.json`
- Styles: `src/scss/*.scss`
- Build scripts: `build/*.js`
- Generated browser bundle: `dist/js/bs-country-data.js`
- Generated CSS bundle: `dist/css/bs-country-data.css`
- Build script: `npm run build`
- Test script: `npm test`

## Architecture and conventions
- Keep the package as a lightweight CommonJS/UMD-compatible JavaScript library.
- Preserve browser compatibility with `window`/`global` checks and the existing export pattern.
- Prefer small, focused helpers over large refactors.
- Keep public API names stable unless the change is intentionally breaking and the README/tests are updated together.
- Prefer vanilla JavaScript and existing package patterns over introducing frameworks, TypeScript, or heavier build tooling.
- Source files live under `src/`; build automation lives under `build/`.
- The build output in `dist/` is generated and should not be edited by hand unless intentionally regenerating assets.

## File responsibilities
- `index.js`: package entry that exports the built bundle.
- `src/js/index.js`: source library logic, option generation, filtering, and data handling.
- `src/json/*.json`: canonical dataset sources.
- `src/scss/*.scss`: source styling assets.
- `build/*.js`: build scripts, bundling, and demo asset generation.
- `docs/demo/`: browser demo and example HTML.
- `dist/`: generated bundle output for browser use.

## Important build behavior
- The generated browser bundle embeds the JSON dataset payload directly, so it should not rely on relative `../json/` fetches at runtime.
- The source library can still accept `window.BsCountryDataData` when explicitly supplied, but the dist bundle is intended to be self-contained.
- If a build change affects asset paths, keep them relative to the repo root and the `src/` + `build/` layout.

## Change guidance
- When changing data structure or option contracts, update the matching logic, README examples, and tests together.
- When modifying the public API, keep backward compatibility unless explicitly requested.
- When changing package metadata or exports, verify the package still works in both Node/CommonJS and browser contexts.
- Preserve optional behaviors such as flag rendering, grouping, include/exclude filtering, and region grouping.
- Keep generated dist files in sync with source changes by running the normal build pipeline.

## Build and validation
Before considering a change complete, run at least:
- `npm test`
- `npm run build` for package or build-related changes

Use the existing scripts rather than introducing new build tools or custom generators.

## Data and API safety
- Treat the JSON files as authoritative dataset sources.
- Keep record shapes consistent with the library’s current contracts (for example, countries and timezones options should remain compatible with existing filters).
- Avoid silent API drift; if you add new fields, they should be additive and non-breaking.
- Do not reintroduce legacy JSON fallback paths into the runtime once the bundle is self-contained.

## Documentation expectations
- Update `README.md` when behavior, installation, usage, or supported option sets change.
- Keep examples aligned with the actual runtime API and `bootstrap-select` usage.
- Prefer simple, copy-paste-ready examples consistent with the package’s existing pattern.
- Ensure examples and references reflect the current repository layout under `src/`, `build/`, and `dist/`.
- Credit the upstream flag data source when touching flag-related docs or functionality.

## Flag asset attribution
- The package uses flag assets from `lipis/flag-icons`.
- If documentation or code comments mention flags, acknowledge the upstream source rather than implying the project created the SVG assets itself.

## Preferred assistant behavior
- Keep edits minimal and targeted.
- Match the existing code style and naming patterns used in the repository.
- Do not add unnecessary dependencies or rewrite the project around a new framework.
- Preserve the library’s browser-first and Node-compatible design.
- Prefer editing the source and build pipeline over hand-patching generated dist files unless regeneration is the explicit goal.
