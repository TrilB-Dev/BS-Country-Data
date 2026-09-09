# Changelog

## 1.0.2

### Changed
- Consolidated the project to the `src/` + `build/` + `dist/` structure and updated the packaging metadata to match.
- Removed the legacy runtime JSON fallback so the generated browser bundle is fully self-contained.
- Embedded the JSON dataset directly into the distributed bundle for simpler browser usage.
- Updated the demo build flow and refreshed generated assets in `dist/` and `docs/demo/assets`.
- Reworked the README and Copilot instructions to reflect the current architecture and build behavior.
- Added credit to the upstream `lipis/flag-icons` project for the flag assets.

### Validation
- Verified with `npm run build`.
- Confirmed the built bundle remains self-contained without copying source JSON files into `dist`.
