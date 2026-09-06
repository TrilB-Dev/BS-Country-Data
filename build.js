const fs = require('fs');
const path = require('path');
const sass = require('sass');
const { minify } = require('terser');

const root = __dirname;
const jsonDir = path.join(root, 'json');
const jsSrcDir = path.join(root, 'js');
const scssDir = path.join(root, 'scss');
const distDir = path.join(root, 'dist');
const distJsDir = path.join(distDir, 'js');
const distCssDir = path.join(distDir, 'css');

fs.mkdirSync(distJsDir, { recursive: true });
fs.mkdirSync(distCssDir, { recursive: true });

function readJson(name) {
  const filePath = path.join(jsonDir, name);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

const countriesData = readJson('bscd-countries.json');
const timezonesData = readJson('bscd-timezones.json');
const ukCountiesData = readJson('bscd-uk-counties.json');
const usStatesData = readJson('bscd-usa-states.json');

const dataLiteral = JSON.stringify({
  countries: countriesData,
  timezones: timezonesData,
  usStates: usStatesData,
  ukCounties: ukCountiesData,
}, null, 2);

const bundle = `(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.BsCountryData = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  const data = ${dataLiteral};

  function normalizeFlagCode(flag) {
    return String(flag || '').trim().toLowerCase();
  }

  function getFlagUrl(flag) {
    const code = normalizeFlagCode(flag);
    if (!code) return null;
    return 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/7.5.0/flags/4x3/' + code + '.svg';
  }

  function toSelectOption(value, label, extra) {
    return Object.assign({ value: value, label: label, text: label }, extra || {});
  }

  function flattenGroupedOptions(value) {
    if (Array.isArray(value)) return value;
    if (!value || typeof value !== 'object') return [];

    return Object.values(value).reduce(function (all, group) {
      if (Array.isArray(group)) {
        all.push.apply(all, group);
        return all;
      }

      if (group && typeof group === 'object') {
        all.push.apply(all, Object.values(group));
      }

      return all;
    }, []);
  }

  function buildCountryData(options) {
    options = options || {};
    const groupByRegion = !!options.groupByRegion;
    const includeFlags = !!options.includeFlags;
    const includeCallingCode = !!options.includeCallingCode;
    const includeLanguage = !!options.includeLanguage;
    const includeAlpha2 = !!options.includeAlpha2;

    const items = data.countries.map(function (country) {
      const flagCode = normalizeFlagCode(country.flag);
      const option = toSelectOption(
        country.codes && country.codes['alpha-2'] ? country.codes['alpha-2'] : country.name,
        country.name,
        {
          region: country.region || null,
          flag: flagCode || null,
          flagUrl: includeFlags && flagCode ? getFlagUrl(flagCode) : null,
          alpha2: country.codes && country.codes['alpha-2'] ? country.codes['alpha-2'] : null,
          language: country.codes && country.codes.language ? country.codes.language : null,
          callingCode: country.codes && country.codes.calling ? country.codes.calling : null
        }
      );

      if (includeAlpha2) option.alpha2 = option.alpha2;
      if (includeLanguage) option.language = option.language;
      if (includeCallingCode) option.callingCode = option.callingCode;
      if (!includeFlags) option.flagUrl = null;

      return option;
    });

    if (!groupByRegion) return items;

    return items.reduce(function (groups, item) {
      const region = item.region || 'Other';
      if (!groups[region]) groups[region] = [];
      groups[region].push(item);
      return groups;
    }, {});
  }

  function buildCountryLanguageData(options) {
    options = options || {};
    const groupByRegion = !!options.groupByRegion;
    const includeFlags = !!options.includeFlags;

    const items = data.countries.map(function (country) {
      const alpha2 = country.codes && country.codes['alpha-2'] ? country.codes['alpha-2'] : null;
      const locale = country.codes && country.codes.language ? country.codes.language : alpha2;
      const flagCode = normalizeFlagCode(country.flag);

      return toSelectOption(
        locale || country.name,
        country.name + ' (' + (locale || alpha2 || 'N/A') + ')',
        {
          region: country.region || null,
          flag: flagCode || null,
          flagUrl: includeFlags && flagCode ? getFlagUrl(flagCode) : null,
          country: country.name,
          countryCode: alpha2,
          languageCode: locale
        }
      );
    });

    if (!groupByRegion) return items;

    return items.reduce(function (groups, item) {
      const region = item.region || 'Other';
      if (!groups[region]) groups[region] = [];
      groups[region].push(item);
      return groups;
    }, {});
  }

  function buildTimezoneData(options) {
    options = options || {};
    const groupByContinent = !!options.groupByContinent;

    const items = Object.entries(data.timezones).reduce(function (all, entry) {
      const continent = entry[0];
      const zones = entry[1] || [];
      zones.forEach(function (zone) {
        all.push(toSelectOption(zone.iana, zone.iana + ' (' + (zone.standard_offset || 'UTC') + ')', {
          continent: continent,
          iana: zone.iana,
          standardOffset: zone.standard_offset,
          dstOffset: zone.dst_offset,
          dstObserved: Boolean(zone.dst_observed)
        }));
      });
      return all;
    }, []);

    if (!groupByContinent) return items;

    return items.reduce(function (groups, item) {
      const continent = item.continent || 'Other';
      if (!groups[continent]) groups[continent] = [];
      groups[continent].push(item);
      return groups;
    }, {});
  }

  function buildUsStatesData(options) {
    options = options || {};
    const groupByRegion = !!options.groupByRegion;
    const items = data.usStates.map(function (state) {
      return toSelectOption(state, state, { label: state });
    });

    if (!groupByRegion) return items;
    return { 'US States': items };
  }

  function buildUkCountyData(options) {
    options = options || {};
    const groupByRegion = !!options.groupByRegion;
    const items = [];

    Object.entries(data.ukCounties).forEach(function (entry) {
      const region = entry[0];
      const counties = entry[1];

      if (Array.isArray(counties)) {
        counties.forEach(function (county) {
          items.push(toSelectOption(county, county, { region: region }));
        });
        return;
      }

      Object.entries(counties || {}).forEach(function (subEntry) {
        const subRegion = subEntry[0];
        const names = subEntry[1] || [];

        names.forEach(function (county) {
          items.push(toSelectOption(county, county, { region: region, subRegion: subRegion }));
        });
      });
    });

    if (!groupByRegion) return items;

    return items.reduce(function (groups, item) {
      const region = item.region || 'Other';
      if (!groups[region]) groups[region] = [];
      groups[region].push(item);
      return groups;
    }, {});
  }

  return {
    countries: buildCountryData,
    countryLanguages: buildCountryLanguageData,
    timezones: buildTimezoneData,
    usStates: buildUsStatesData,
    ukCounties: buildUkCountyData,
    flattenGroupedOptions: flattenGroupedOptions,
    getFlagUrl: getFlagUrl,
    data: data
  };
}));
`;

const jsOutputPath = path.join(distJsDir, 'bs-country-data.js');
const jsMinOutputPath = path.join(distJsDir, 'bs-country-data.min.js');

fs.writeFileSync(jsOutputPath, bundle, 'utf8');

(async () => {
  const minified = await minify(bundle, {
    compress: true,
    mangle: true,
    format: {
      comments: false,
    },
  });

  fs.writeFileSync(jsMinOutputPath, minified.code, 'utf8');

  const cssResult = sass.compile(path.join(scssDir, 'bs-country-data.scss'), {
    loadPaths: [path.join(root, 'node_modules')],
    style: 'expanded',
    sourceMap: false,
  });

  fs.writeFileSync(path.join(distCssDir, 'bs-country-data.css'), cssResult.css, 'utf8');
  const minCss = cssResult.css
    .replace(/\/\*[^]*?\*\//g, '')
    .replace(/\n+/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s*([{}:;,])\s*/g, '$1')
    .replace(/;}/g, '}')
    .replace(/\s+([>+~])\s+/g, '$1');

  fs.writeFileSync(path.join(distCssDir, 'bs-country-data.min.css'), minCss, 'utf8');

  console.log('Build complete:');
  console.log(' - ' + jsOutputPath);
  console.log(' - ' + jsMinOutputPath);
  console.log(' - ' + path.join(distCssDir, 'bs-country-data.css'));
  console.log(' - ' + path.join(distCssDir, 'bs-country-data.min.css'));
})();
