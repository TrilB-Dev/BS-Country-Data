# Bootstrap Select Country Data

A lightweight Bootstrap Select data helper for countries, phone codes, languages, time zones, US states, and UK counties.

This package ships with a compiled runtime bundle that embeds the data directly, so a single script can be dropped into a page without relying on a separate JSON fetch step.

## Features

- Country option data with optional flag rendering
- Country phone code options
- Language option data
- Timezone options
- US state data
- UK county data
- Optional region grouping for supported datasets
- Include/exclude filtering helpers
- Bootstrap Select friendly option objects

## Installation

```bash
npm install @trilbdev/boostrap-select-country-data
```

## Package layout

The repository now follows a cleaner structure:

- `src/` contains the source code and data files
- `build/` contains the build scripts
- `dist/` contains the generated browser bundles and CSS assets

## Quick start

### Browser usage

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.18/dist/css/bootstrap-select.min.css">
<link rel="stylesheet" href="./dist/css/bs-country-data.min.css">

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.18/dist/js/bootstrap-select.min.js"></script>
<script src="./dist/js/bs-country-data.min.js"></script>

<select class="selectpicker" data-live-search="true" data-bscd-type="country" data-bscd-group="true" data-bscd-flags="true">
  <option value="">Select a country</option>
</select>
```

The script will populate matching selects automatically when they contain a `data-bscd-type` attribute.

### Node/CommonJS usage

```js
const bsData = require('@trilbdev/boostrap-select-country-data');

const countries = bsData.countries({
  groupByRegion: true,
  includeFlags: true,
});

console.log(countries[0]);
```

## Supported data types

The `data-bscd-type` attribute accepts:

- `country`
- `country-phone`
- `language`
- `timezones`
- `uk-counties`
- `us-states`

## Flags and grouping

### `data-bscd-flags`

- Accepts: `true` or `false`
- Default: `false`
- Supported with: `country`, `country-phone`, `language`

### `data-bscd-group`

- Accepts: `true` or `false`
- Default: `false`
- Supported with: `country`, `country-phone`, `timezones`, `uk-counties`

## JavaScript API

```js
const bsData = require('@trilbdev/boostrap-select-country-data');

const countries = bsData.countries({
  groupByRegion: true,
  includeFlags: true,
});

const languages = bsData.countryLanguages({
  groupByRegion: true,
  includeFlags: true,
});

const timezones = bsData.timezones({
  groupByContinent: true,
});

const states = bsData.usStates({ groupByRegion: true });
const counties = bsData.ukCounties({ groupByRegion: true });
```

## Filtering

```js
const europeOnly = bsData.countries({
  include: {
    region: ['Europe'],
  },
  groupByRegion: true,
});

const englishAndFrench = bsData.countryLanguages({
  include: {
    language: ['English', 'French'],
  },
  groupByRegion: true,
});

const ukCountiesWithoutLondon = bsData.ukCounties({
  groupByRegion: true,
  exclude: {
    counties: ['Greater London'],
  },
});
```

You can also combine filters by field:

```js
const usAndCanada = bsData.countries({
  include: {
    countries: ['United States', 'Canada'],
  },
});

const nonEuropeanCountries = bsData.countries({
  exclude: {
    region: ['Europe'],
  },
});
```

### Supported filter keys

- `countries` / `country`
- `regions` / `region`
- `languages` / `language`
- `timezones` / `timezone`
- `counties` / `county`
- `states` / `state`
- `alpha2`
- `phoneCodes` / `phoneCode`

## SCSS usage

If you are compiling styles in your own project, you can import the package SCSS directly instead of loading the generated CSS bundle:

```scss
@use "@trilbdev/boostrap-select-country-data/src/scss/bs-country-data";
```

If your bundler resolves node_modules paths differently, you can also do this:

```scss
@use "node_modules/@trilbdev/boostrap-select-country-data/src/scss/bs-country-data";
```

You can override the default Sass variables when needed:

```scss
@use "@trilbdev/boostrap-select-country-data/src/scss/bs-country-data" with (
  // Override path to flags directory
  $flag-icons-path: "./src/dist/images/flags",

  // Include only specific country flags
  $flag-icons-included-countries: ("gr", "de", "gb")
);
```

Full variable list:

```scss
$flag-icons-path: "../images/flags" !default;
$flag-icons-rect-path: "/4x3" !default;
$flag-icons-square-path: "/1x1" !default;
$flag-icons-use-square: false !default;
$flag-icons-included-countries: ("gr", "de", "gb") !default;
```

## Build output

The package builds a self-contained browser bundle and CSS output into the `dist/` directory:

- `dist/js/bs-country-data.js`
- `dist/js/bs-country-data.min.js`
- `dist/css/bs-country-data.css`
- `dist/css/bs-country-data.min.css`
- `dist/images/flags/`

The generated JS bundle embeds the country data payload so it does not require a separate JSON fetch at runtime.

## Credits

This project uses flag assets from [lipis/flag-icons](https://github.com/lipis/flag-icons), which provides the SVG flag set and CSS helpers used by this package.

## Notes

- This package is designed to work with Bootstrap 5 and the Bootstrap Select plugin.
- Flag rendering uses the `flag-icons` package and the `fi` CSS classes.
- If you need the grouped data flattened for custom rendering, use `flattenGroupedOptions()`.
