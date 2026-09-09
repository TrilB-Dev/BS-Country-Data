/**
 * @typedef {Object} SelectOption
 * @property {string} value
 * @property {string} label
 * @property {string} text
 */

/**
 * @typedef {Object} CountryRecord
 * @property {string} name
 * @property {{ 'alpha-2': string, language?: string|{name?:string,code?:string,value?:string,label?:string}, calling?: string }} codes
 * @property {string} [flag]
 * @property {string} [region]
 */

/**
 * @typedef {Object} TimezoneRecord
 * @property {string} iana
 * @property {string|null} standard_offset
 * @property {string|null} dst_offset
 * @property {boolean} dst_observed
 */

/**
 * @typedef {Object.<string, Array<any>>} GroupedOptions
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.BsCountryData = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  const embeddedData = typeof __BSCountryDataEmbeddedData !== 'undefined' ? __BSCountryDataEmbeddedData : null;
  let countriesData = [];
  let timezonesData = [];
  let ukCountiesData = [];
  let usStatesData = [];

  try {
    if (embeddedData) {
      countriesData = embeddedData.countries || [];
      timezonesData = embeddedData.timezones || [];
      ukCountiesData = embeddedData.ukCounties || [];
      usStatesData = embeddedData.usStates || [];
    }
  } catch (error) {
    countriesData = [];
    timezonesData = [];
    ukCountiesData = [];
    usStatesData = [];
  }

  const defaultFlagBase = 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/7.5.0/flags/4x3';

  function ensureData() {
    if (data.countries.length || data.timezones.length || data.usStates.length || data.ukCounties.length) {
      return data;
    }

    const globalData = typeof root !== 'undefined' && root.BsCountryDataData ? root.BsCountryDataData : null;
    if (globalData) {
      data.countries = globalData.countries || [];
      data.timezones = globalData.timezones || [];
      data.usStates = globalData.usStates || [];
      data.ukCounties = globalData.ukCounties || [];
      return data;
    }

    return data;
  }

  const data = {
    countries: countriesData,
    timezones: timezonesData,
    usStates: usStatesData,
    ukCounties: ukCountiesData,
  };

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

  function matchesFilterSelection(item, filterGroup) {
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

  function applyFilterGroup(items, group) {
    if (!group || typeof group !== 'object') {
      return items;
    }

    return items.filter((item) => matchesFilterSelection(item, group));
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

    const dataset = ensureData();
    let items = dataset.countries.map((country) => {
      const flagCode = normalizeFlagCode(country.flag);
      const alpha2 = country.codes && country.codes['alpha-2'] ? country.codes['alpha-2'] : null;
      const callingCode = country.codes && country.codes.calling ? String(country.codes.calling) : null;
      const option = toSelectOption(
        country.codes && country.codes['alpha-2'] ? country.codes['alpha-2'] : country.name,
        country.name,
        {
          region: country.region || null,
          flag: flagCode || null,
          flagUrl: includeFlags && flagCode ? getFlagUrl(flagCode) : null,
          alpha2,
          language: country.codes && country.codes.language ? country.codes.language : null,
          callingCode,
        }
      );

      if (includeCallingCode) {
        option.value = callingCode || option.value;
        option.label = callingCode || option.label;
        option.text = callingCode || option.text;
        option.callingCode = callingCode;
      }

      if (includeAlpha2) option.alpha2 = option.alpha2;
      if (includeLanguage) option.language = option.language;
      if (includeCallingCode) option.callingCode = option.callingCode;
      if (!includeFlags) option.flagUrl = null;

      return option;
    });

    items = applySelectionFilters(items, options);

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

  function resolveLanguageEntries(languageValue, fallbackCountryName, fallbackCountryCode) {
    if (!languageValue && languageValue !== '') {
      return [{ name: fallbackCountryName, code: fallbackCountryCode || fallbackCountryName }];
    }

    if (typeof languageValue === 'string') {
      return [{ name: languageValue, code: languageValue }];
    }

    if (Array.isArray(languageValue)) {
      return languageValue
        .map((entry) => ({ name: entry && entry.name ? entry.name : String(entry || ''), code: entry && (entry.code || entry.value) ? (entry.code || entry.value) : null }))
        .filter((entry) => entry.name && entry.name.trim());
    }

    if (languageValue && typeof languageValue === 'object') {
      if (languageValue.name || languageValue.code || languageValue.value) {
        return [{
          name: languageValue.name || languageValue.label || fallbackCountryName,
          code: languageValue.code || languageValue.value || fallbackCountryCode || languageValue.name || fallbackCountryName,
        }].filter((entry) => entry.name && entry.name.trim());
      }

      return Object.values(languageValue)
        .flatMap((entry) => resolveLanguageEntries(entry, fallbackCountryName, fallbackCountryCode))
        .filter((entry) => entry.name && entry.name.trim());
    }

    return [{ name: fallbackCountryName, code: fallbackCountryCode || fallbackCountryName }];
  }

  function buildCountryLanguageData(options = {}) {
    const { groupByRegion = false, includeFlags = false } = options;
    const dataset = ensureData();

    let items = dataset.countries.flatMap((country) => {
      const alpha2 = country.codes && country.codes['alpha-2'] ? country.codes['alpha-2'] : null;
      const language = country.codes && country.codes.language ? country.codes.language : { name: country.name, code: alpha2 };
      const languageEntries = resolveLanguageEntries(language, country.name, alpha2);
      const flagCode = normalizeFlagCode(country.flag);

      return languageEntries.map((entry) => {
        const languageName = String(entry.name || country.name);
        const languageCode = String(entry.code || alpha2 || languageName);

        return toSelectOption(languageCode, languageName, {
          region: country.region || null,
          flag: flagCode || null,
          flagUrl: includeFlags && flagCode ? getFlagUrl(flagCode) : null,
          country: country.name,
          countryCode: alpha2,
          language: languageName,
          languageCode,
          languageName,
        });
      });
    });

    items = applySelectionFilters(items, options);

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

  function parseTimezoneOffsetMinutes(value) {
    if (value === null || value === undefined || value === '') {
      return Number.MAX_SAFE_INTEGER;
    }

    const offsetText = String(value).trim();
    const match = offsetText.match(/^UTC([+-])(\d{1,2})(?::?(\d{2}))?$/i);

    if (!match) {
      return Number.MAX_SAFE_INTEGER;
    }

    const sign = match[1] === '-' ? -1 : 1;
    const hours = Number(match[2]) || 0;
    const minutes = Number(match[3]) || 0;
    return sign * (hours * 60 + minutes);
  }

  function sortTimezoneItems(items) {
    return [...items].sort((left, right) => {
      const leftOffset = parseTimezoneOffsetMinutes(left.standardOffset || left.offset || left.text || left.value);
      const rightOffset = parseTimezoneOffsetMinutes(right.standardOffset || right.offset || right.text || right.value);

      if (leftOffset !== rightOffset) {
        return leftOffset - rightOffset;
      }

      return String(left.label || left.text || left.value).localeCompare(String(right.label || right.text || right.value));
    });
  }

  function buildTimezoneData(options = {}) {
    const { groupByContinent = false } = options;
    const dataset = ensureData();

    let items = Object.entries(dataset.timezones).flatMap(([continent, zones]) =>
      (zones || []).map((zone) =>
        toSelectOption(zone.iana, `${zone.iana} (${zone.standard_offset || 'UTC'})`, {
          continent,
          iana: zone.iana,
          standardOffset: zone.standard_offset,
          dstOffset: zone.dst_offset,
          dstObserved: Boolean(zone.dst_observed),
        })
      )
    );

    items = applySelectionFilters(items, options);

    if (!groupByContinent) {
      return sortTimezoneItems(items);
    }

    const grouped = items.reduce((groups, item) => {
      const continent = item.continent || 'Other';
      if (!groups[continent]) groups[continent] = [];
      groups[continent].push(item);
      return groups;
    }, {});

    Object.keys(grouped).forEach((continent) => {
      grouped[continent] = sortTimezoneItems(grouped[continent]);
    });

    return grouped;
  }

  function buildUsStatesData(options = {}) {
    const { groupByRegion = false } = options;
    const dataset = ensureData();

    let items = dataset.usStates.map((state) =>
      toSelectOption(state, state, { label: state })
    );

    items = applySelectionFilters(items, options);

    if (!groupByRegion) {
      return items;
    }

    return { 'US States': items };
  }

  function buildUkCountyData(options = {}) {
    const { groupByRegion = false } = options;
    const dataset = ensureData();
    const flatItems = [];
    const groupedItems = {};

    Object.entries(dataset.ukCounties).forEach(([countryName, counties]) => {
      if (Array.isArray(counties)) {
        const countryItems = counties.map((county) => toSelectOption(county, county, { region: countryName }));

        if (groupByRegion) {
          groupedItems[countryName] = countryItems;
        }

        flatItems.push(...countryItems);
        return;
      }

      if (countryName === 'England' && counties && typeof counties === 'object') {
        const englandRegions = counties.Region && typeof counties.Region === 'object' ? counties.Region : counties;
        const englandGroups = {};

        Object.entries(englandRegions).forEach(([regionName, regionCounties]) => {
          const items = Array.isArray(regionCounties) ? regionCounties : flattenGroupedOptions(regionCounties);
          const regionItems = items.map((county) =>
            toSelectOption(county, county, { region: countryName, subRegion: regionName })
          );

          englandGroups[regionName] = regionItems;
          flatItems.push(...regionItems);
        });

        if (groupByRegion) {
          groupedItems[countryName] = englandGroups;
        }
        return;
      }

      const countryItems = (counties || []).map((county) => toSelectOption(county, county, { region: countryName }));

      if (groupByRegion) {
        groupedItems[countryName] = countryItems;
      }

      flatItems.push(...countryItems);
    });

    const filteredItems = applySelectionFilters(flatItems, options);

    if (!groupByRegion) {
      return filteredItems;
    }

    if (!Object.keys(groupedItems).length) {
      return filteredItems.reduce((groups, item) => {
        const region = item.region || 'Other';
        if (!groups[region]) groups[region] = [];
        groups[region].push(item);
        return groups;
      }, {});
    }

    return groupedItems;
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

    const appendGroup = (parentNode, groupName, items) => {
      const optGroup = document.createElement('optgroup');
      optGroup.label = groupName;

      if (Array.isArray(items)) {
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
        parentNode.appendChild(optGroup);
        return;
      }

      if (items && typeof items === 'object') {
        Object.entries(items).forEach(([childGroupName, childItems]) => {
          appendGroup(optGroup, childGroupName, childItems);
        });
        parentNode.appendChild(optGroup);
      }
    };

    if (dataset && typeof dataset === 'object' && !Array.isArray(dataset)) {
      Object.entries(dataset).forEach(([groupName, items]) => {
        if (groupName === 'England' && items && typeof items === 'object' && !Array.isArray(items)) {
          Object.entries(items).forEach(([regionName, regionItems]) => {
            appendGroup(selectElement, regionName, regionItems);
          });
          return;
        }

        appendGroup(selectElement, groupName, items);
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

    if (typeof window !== 'undefined' && window.Selectpicker && typeof window.Selectpicker.getOrCreateInstance === 'function') {
      const instance = window.Selectpicker.getOrCreateInstance(selectElement, {
        liveSearch: selectElement.getAttribute('data-live-search') === 'true',
        actionsBox: selectElement.hasAttribute('multiple') && selectElement.getAttribute('data-actions-box') === 'true',
        selectedTextFormat: selectElement.getAttribute('data-selected-text-format') || 'values',
        showTick: selectElement.classList.contains('show-tick'),
      });

      if (instance && typeof instance.refresh === 'function') {
        instance.refresh();
      }
    }

    return selectElement;
  }

  function autoPopulateSelects(root = document) {
    if (!root || !root.querySelectorAll) return [];

    const selects = Array.from(root.querySelectorAll('select[data-bscd-type]'));
    selects.forEach((element) => {
      if (element.closest('.bootstrap-select')) {
        return;
      }

      applySelectData(element);
    });
    return selects;
  }

  const api = {
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
    data,
  };

  if (typeof window !== 'undefined') {
    window.BsCountryData = api;

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => autoPopulateSelects(document), { once: true });
    } else {
      autoPopulateSelects(document);
    }
  }

  return api;
});
