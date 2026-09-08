# Bootstrap Select Country Data

A Bootstrap-powered data extension for `bootstrap-select` that provides ready-to-use option sets for:

- Countries
- Country phone codes
- Languages
- Timezones
- UK counties
- US states

It piggybacks directly on the Bootstrap 5 and bootstrap-select UI stack and supports optional region grouping and flag rendering.

## Installation

```bash
npm install boostrap-select-country-data
```

This package installs the required dependencies automatically:

- `bootstrap`
- `bootstrap-select`
- `flag-icons`

## Basic usage

```html
<select
  class="selectpicker"
  data-live-search="true"
  data-bscd-type="country"
  data-bscd-group="true"
  data-bscd-flags="true"
>
  <option value="">Select a country</option>
</select>
```

This will populate the select with country items, grouped by region and rendered with flag icons.

## Supported data types

The `data-bscd-type` attribute accepts:

- `country`
- `country-phone`
- `language`
- `timezones`
- `uk-counties`
- `us-states`

## Supported flags and grouping

### `data-bscd-flags`

- Accepts: `true` or `false`
- Default: `false`
- Supported with: `country`, `country-phone`, `language`

### `data-bscd-group`

- Accepts: `true` or `false`
- Default: `false`
- Supported with: `country`, `country-phone`, `timezones`, `uk-counties`

## Bootstrap Select integration

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.18/dist/css/bootstrap-select.min.css">

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.18/dist/js/bootstrap-select.min.js"></script>
<script src="./dist/js/bs-country-data.js"></script>
```

```html
<select class="selectpicker" data-live-search="true" data-bscd-type="country" data-bscd-group="true" data-bscd-flags="true">
  <option value="">Select a country</option>
</select>
```

The script will automatically populate matching selects when they have `data-bscd-type` present.

## JavaScript API

```js
const bsData = require('boostrap-select-country-data');

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

## Filtering with include and exclude

The library supports optional filtering via `include` and `exclude` groups. This is useful when you want to limit a dataset to a specific region, language, country, or county set.

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

## Notes

- This package is designed to work with Bootstrap 5 and the Bootstrap Select plugin.
- Flag rendering uses the `flag-icons` package and the `fi` CSS classes.
- If you need the grouped data flattened for custom rendering, use `flattenGroupedOptions()`.
