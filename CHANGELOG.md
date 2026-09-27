# Changelog

## 1.0.5

### Added
- Support for setting selected values via the `data-bscd-selected` attribute for both single and multi-select inputs.
- Improved selectpicker initialization so preset values are applied after the plugin is initialized.
- Updated the demo page to showcase the default selected-value behavior.

### Fixed
- Corrected package metadata and publish script consistency for the npm release workflow.
- Included the MIT license file in the published npm package contents.
- Added missing project licensing files for a complete package release.

## 1.0.4

### Changed
- Refined the country selection UI and improved bootstrap-select integration.
- Updated the demo behavior and selection logic for more consistent picker interactions.

## 1.0.3

### Changed
- Cleaned up the npm publishing configuration and aligned the package metadata for release consistency.
- Simplified workflow and publish script configuration for easier package release management.

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
