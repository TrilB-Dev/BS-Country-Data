const countriesData = require('../json/bscd-countries.json');
const timezonesData = require('../json/bscd-timezones.json');
const ukCountiesData = require('../json/bscd-uk-counties.json');
const usStatesData = require('../json/bscd-usa-states.json');

const defaultFlagBase = 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/7.5.0/flags/4x3';

function normalizeFlagCode(flag) {
  return String(flag || '').trim().toLowerCase();
}

function getFlagUrl(flag) {
  const code = normalizeFlagCode(flag);
  if (!code) return null;
  return `${defaultFlagBase}/${code}.svg`;
}

function toSelectOption(value, label, extra = {}) {
  return {
    value,
    label,
    text: label,
    ...extra,
  };
}

function flattenGroupedOptions(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== 'object') {
    return [];
  }

  return Object.values(value).reduce((all, group) => {
    if (Array.isArray(group)) {
      all.push(...group);
      return all;
    }

    if (group && typeof group === 'object') {
      all.push(...Object.values(group));
    }

    return all;
  }, []);
}

function normalizeFilterList(value) {
  if (value === null || value === undefined) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeFilterList(item));
  }

  if (typeof value === 'object') {
    return Object.values(value).flatMap((item) => normalizeFilterList(item));
  }

  return [String(value).trim()].filter(Boolean);
}

function normalizeFilterText(value) {
  return String(value ?? '').trim().toLowerCase();
}

function collectStringValues(value) {
  if (value === null || value === undefined) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry) => collectStringValues(entry));
  }

  if (typeof value === 'object') {
    return Object.values(value).flatMap((entry) => collectStringValues(entry));
  }

  return [String(value)];
}

function matchesFilterSelection(item, filterGroup, filterKey) {
  const entries = Object.entries(filterGroup || {}).filter(([key]) => key !== 'action');
  if (!entries.length) {
    return false;
  }

  return entries.some(([key, values]) => {
    const selectedValues = normalizeFilterList(values).map(normalizeFilterText).filter(Boolean);
    if (!selectedValues.length) {
      return false;
    }

    const candidates = [];
    const selectorKey = String(key || '').trim().toLowerCase();

    switch (selectorKey) {
      case 'countries':
      case 'country':
      case 'names':
      case 'name':
        candidates.push(...collectStringValues(item.label), ...collectStringValues(item.text), ...collectStringValues(item.value), ...collectStringValues(item.name), ...collectStringValues(item.country));
        break;
      case 'alpha2':
      case 'alpha-2':
      case 'countrycode':
      case 'countrycodes':
        candidates.push(...collectStringValues(item.alpha2), ...collectStringValues(item.countryCode), ...collectStringValues(item.value));
        break;
      case 'regions':
      case 'region':
      case 'continents':
      case 'continent':
        candidates.push(...collectStringValues(item.region), ...collectStringValues(item.continent), ...collectStringValues(item.subRegion));
        break;
      case 'language':
      case 'languages':
      case 'languagecodes':
      case 'languagecode':
        candidates.push(...collectStringValues(item.language), ...collectStringValues(item.languageCode), ...collectStringValues(item.languageName), ...collectStringValues(item.country));
        break;
      case 'phonecodes':
      case 'phonecode':
      case 'callingcodes':
      case 'callingcode':
        candidates.push(...collectStringValues(item.callingCode), ...collectStringValues(item.phoneCode), ...collectStringValues(item.code));
        break;
      case 'timezones':
      case 'timezone':
      case 'iana':
        candidates.push(...collectStringValues(item.iana), ...collectStringValues(item.timezone), ...collectStringValues(item.value));
        break;
      case 'counties':
      case 'county':
        candidates.push(...collectStringValues(item.label), ...collectStringValues(item.text), ...collectStringValues(item.value), ...collectStringValues(item.region), ...collectStringValues(item.subRegion));
        break;
      case 'states':
      case 'state':
        candidates.push(...collectStringValues(item.label), ...collectStringValues(item.text), ...collectStringValues(item.value));
        break;
      default:
        candidates.push(...collectStringValues(item.label), ...collectStringValues(item.text), ...collectStringValues(item.value), ...collectStringValues(item.region), ...collectStringValues(item.continent), ...collectStringValues(item.alpha2), ...collectStringValues(item.languageCode), ...collectStringValues(item.callingCode), ...collectStringValues(item.iana));
    }

    const normalizedCandidates = [...new Set(candidates.map(normalizeFilterText).filter(Boolean))];
    return selectedValues.some((selected) =>
      normalizedCandidates.some((candidate) => candidate === selected || candidate.includes(selected) || selected.includes(candidate))
    );
  });
}

function applyFilterGroup(items, group, keyName) {
  if (!group || typeof group !== 'object') {
    return items;
  }

  return items.filter((item) => matchesFilterSelection(item, group, keyName));
}

function buildFilterGroup(action) {
  return {
    countries: (values) => ({ action, countries: values }),
    country: (values) => ({ action, countries: values }),
    names: (values) => ({ action, names: values }),
    alpha2: (values) => ({ action, alpha2: values }),
    alpha2Codes: (values) => ({ action, alpha2: values }),
    regions: (values) => ({ action, regions: values }),
    region: (values) => ({ action, regions: values }),
    language: (values) => ({ action, languages: values }),
    languages: (values) => ({ action, languages: values }),
    languageCodes: (values) => ({ action, languageCodes: values }),
    phoneCodes: (values) => ({ action, phoneCodes: values }),
    phoneCode: (values) => ({ action, phoneCodes: values }),
    timezones: (values) => ({ action, timezones: values }),
    timezone: (values) => ({ action, timezones: values }),
    counties: (values) => ({ action, counties: values }),
    county: (values) => ({ action, counties: values }),
    states: (values) => ({ action, states: values }),
    state: (values) => ({ action, states: values }),
  };
}

const include = buildFilterGroup('include');
const exclude = buildFilterGroup('exclude');

function normalizeFilterConfig(config = {}) {
  const includeGroup = config.include || config.includes || {};
  const excludeGroup = config.exclude || config.excludes || {};

  return {
    include: includeGroup && typeof includeGroup === 'object' ? includeGroup : {},
    exclude: excludeGroup && typeof excludeGroup === 'object' ? excludeGroup : {},
  };
}

function applySelectionFilters(items, config = {}) {
  const { include: includeGroup, exclude: excludeGroup } = normalizeFilterConfig(config);

  let filtered = items;

  if (Object.keys(includeGroup).length) {
    filtered = applyFilterGroup(filtered, includeGroup);
  }

  if (Object.keys(excludeGroup).length) {
    filtered = filtered.filter((item) => !matchesFilterSelection(item, excludeGroup));
  }

  return filtered;
}

function buildCountryData(options = {}) {
  const {
    groupByRegion = false,
    includeFlags = false,
    includeCallingCode = false,
    includeLanguage = false,
    includeAlpha2 = false,
  } = options;

  let items = countriesData.map((country) => {
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
        callingCode: country.codes && country.codes.calling ? country.codes.calling : null,
      }
    );

    if (includeAlpha2) option.alpha2 = option.alpha2;
    if (includeLanguage) option.language = option.language;
    if (includeCallingCode) option.callingCode = option.callingCode;
    if (!includeFlags) option.flagUrl = null;

    return option;
  });

  items = applySelectionFilters(items, options, 'country');

  if (!groupByRegion) {
    return items;
  }

  return items.reduce((groups, item) => {
    const region = item.region || 'Other';
    if (!groups[region]) groups[region] = [];
    groups[region].push(item);
    return groups;
  }, {});
}

function buildCountryLanguageData(options = {}) {
  const {
    groupByRegion = false,
    includeFlags = false,
  } = options;

  let items = countriesData.map((country) => {
    const alpha2 = country.codes && country.codes['alpha-2'] ? country.codes['alpha-2'] : null;
    const language = country.codes && country.codes.language ? country.codes.language : { name: country.name, code: alpha2 };
    const languageName = typeof language === 'object' && language !== null ? (language.name || language.label || country.name) : String(language || country.name);
    const languageCode = typeof language === 'object' && language !== null ? (language.code || language.value || alpha2) : (language || alpha2);
    const flagCode = normalizeFlagCode(country.flag);

    return toSelectOption(
      languageCode || country.name,
      `${country.name} (${languageCode || languageName || alpha2 || 'N/A'})`,
      {
        region: country.region || null,
        flag: flagCode || null,
        flagUrl: includeFlags && flagCode ? getFlagUrl(flagCode) : null,
        country: country.name,
        countryCode: alpha2,
        language: languageName,
        languageCode,
        languageName,
      }
    );
  });

  items = applySelectionFilters(items, options, 'language');

  if (!groupByRegion) {
    return items;
  }

  return items.reduce((groups, item) => {
    const region = item.region || 'Other';
    if (!groups[region]) groups[region] = [];
    groups[region].push(item);
    return groups;
  }, {});
}

function buildTimezoneData(options = {}) {
  const { groupByContinent = false } = options;

  let items = Object.entries(timezonesData).flatMap(([continent, zones]) =>
    zones.map((zone) =>
      toSelectOption(
        zone.iana,
        `${zone.iana} (${zone.standard_offset || 'UTC'})`,
        {
          continent,
          iana: zone.iana,
          standardOffset: zone.standard_offset,
          dstOffset: zone.dst_offset,
          dstObserved: Boolean(zone.dst_observed),
        }
      )
    )
  );

  items = applySelectionFilters(items, options, 'timezone');

  if (!groupByContinent) {
    return items;
  }

  return items.reduce((groups, item) => {
    const continent = item.continent || 'Other';
    if (!groups[continent]) groups[continent] = [];
    groups[continent].push(item);
    return groups;
  }, {});
}

function buildUsStatesData(options = {}) {
  const { groupByRegion = false } = options;

  let items = usStatesData.map((state) =>
    toSelectOption(state, state, {
      label: state,
    })
  );

  items = applySelectionFilters(items, options, 'state');

  if (!groupByRegion) {
    return items;
  }

  return {
    'US States': items,
  };
}

function buildUkCountyData(options = {}) {
  const { groupByRegion = false } = options;

  const items = [];
  Object.entries(ukCountiesData).forEach(([region, counties]) => {
    if (Array.isArray(counties)) {
      counties.forEach((county) => {
        items.push(
          toSelectOption(county, county, {
            region,
          })
        );
      });
      return;
    }

    Object.entries(counties || {}).forEach(([subRegion, names]) => {
      (names || []).forEach((county) => {
        items.push(
          toSelectOption(county, county, {
            region,
            subRegion,
          })
        );
      });
    });
  });

  const filteredItems = applySelectionFilters(items, options, 'county');

  if (!groupByRegion) {
    return filteredItems;
  }

  return filteredItems.reduce((groups, item) => {
    const region = item.region || 'Other';
    if (!groups[region]) groups[region] = [];
    groups[region].push(item);
    return groups;
  }, {});
}

function normalizeType(type) {
  return String(type || '').trim().toLowerCase();
}

function parseBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
    if (['0', 'false', 'no', 'off', ''].includes(normalized)) return false;
  }
  return fallback;
}

function resolveDataSet(type, options = {}) {
  const normalizedType = normalizeType(type);

  switch (normalizedType) {
    case 'country':
      return buildCountryData({
        groupByRegion: Boolean(options.groupByRegion),
        includeFlags: Boolean(options.includeFlags),
      });
    case 'country-phone':
      return buildCountryData({
        groupByRegion: Boolean(options.groupByRegion),
        includeFlags: Boolean(options.includeFlags),
        includeCallingCode: true,
      });
    case 'language':
      return buildCountryLanguageData({
        groupByRegion: Boolean(options.groupByRegion),
        includeFlags: Boolean(options.includeFlags),
      });
    case 'timezones':
      return buildTimezoneData({
        groupByContinent: Boolean(options.groupByContinent),
      });
    case 'uk-counties':
      return buildUkCountyData({
        groupByRegion: Boolean(options.groupByRegion),
      });
    case 'us-states':
      return buildUsStatesData({
        groupByRegion: Boolean(options.groupByRegion),
      });
    default:
      return [];
  }
}

function applySelectData(selectElement, options = {}) {
  if (!selectElement || !selectElement.tagName || selectElement.tagName.toLowerCase() !== 'select') {
    return selectElement;
  }

  const type = selectElement.getAttribute('data-bscd-type') || options.type || 'country';
  const shouldGroup = parseBoolean(
    selectElement.getAttribute('data-bscd-group') ?? selectElement.getAttribute('data-bscd-grouping') ?? options.group,
    false
  );
  const shouldShowFlags = parseBoolean(
    selectElement.getAttribute('data-bscd-flags') ?? selectElement.getAttribute('data-bscd-flag') ?? options.flags,
    false
  );

  const dataset = resolveDataSet(type, {
    groupByRegion: shouldGroup,
    groupByContinent: shouldGroup,
    includeFlags: shouldShowFlags,
  });

  const preservePlaceholder = selectElement.querySelector('option[value=""]');
  selectElement.innerHTML = '';

  if (preservePlaceholder) {
    selectElement.appendChild(preservePlaceholder.cloneNode(true));
  }

  if (dataset && typeof dataset === 'object' && !Array.isArray(dataset)) {
    Object.entries(dataset).forEach(([groupName, items]) => {
      const optGroup = document.createElement('optgroup');
      optGroup.label = groupName;
      items.forEach((item) => {
        const option = document.createElement('option');
        option.value = item.value;
        option.textContent = item.text || item.label || item.value;
        option.setAttribute('data-bscd-region', item.region || '');
        if (shouldShowFlags && item.flag) {
          option.setAttribute('data-content', `<span class="fi fi-${item.flag}"></span> ${option.textContent}`);
        }
        optGroup.appendChild(option);
      });
      selectElement.appendChild(optGroup);
    });
  } else {
    (dataset || []).forEach((item) => {
      const option = document.createElement('option');
      option.value = item.value;
      option.textContent = item.text || item.label || item.value;
      if (shouldShowFlags && item.flag) {
        option.setAttribute('data-content', `<span class="fi fi-${item.flag}"></span> ${option.textContent}`);
      }
      selectElement.appendChild(option);
    });
  }

  if (typeof window !== 'undefined' && window.jQuery && window.jQuery.fn && window.jQuery.fn.selectpicker) {
    window.jQuery(selectElement).selectpicker('refresh');
  }

  return selectElement;
}

function autoPopulateSelects(root = document) {
  if (!root || !root.querySelectorAll) return [];

  const selects = Array.from(root.querySelectorAll('select[data-bscd-type]'));
  selects.forEach((element) => applySelectData(element));
  return selects;
}

if (typeof window !== 'undefined') {
  window.BsCountryData = {
    countries: buildCountryData,
    countryLanguages: buildCountryLanguageData,
    timezones: buildTimezoneData,
    usStates: buildUsStatesData,
    ukCounties: buildUkCountyData,
    getFlagUrl,
    flattenGroupedOptions,
    applySelectData,
    autoPopulateSelects,
    data: {
      countries: countriesData,
      timezones: timezonesData,
      usStates: usStatesData,
      ukCounties: ukCountiesData,
    },
  };

  if (window.jQuery && typeof window.jQuery.fn !== 'undefined') {
    window.jQuery.fn.bsCountryData = function bsCountryData(config) {
      return this.each(function () {
        applySelectData(this, config || {});
      });
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => autoPopulateSelects(document));
    } else {
      autoPopulateSelects(document);
    }
  }
}

module.exports = {
  countries: buildCountryData,
  countryLanguages: buildCountryLanguageData,
  timezones: buildTimezoneData,
  usStates: buildUsStatesData,
  ukCounties: buildUkCountyData,
  getFlagUrl,
  flattenGroupedOptions,
  applySelectData,
  autoPopulateSelects,
  include,
  exclude,
  data: {
    countries: countriesData,
    timezones: timezonesData,
    usStates: usStatesData,
    ukCounties: ukCountiesData,
  },
};
