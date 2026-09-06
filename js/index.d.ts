export type SelectOption = {
  value: string;
  label: string;
  text: string;
  [key: string]: unknown;
};

export type Country = {
  name: string;
  codes: {
    'alpha-2': string;
    language?: string;
    calling?: string;
  };
  flag?: string;
  region?: string;
};

export type TimezoneEntry = {
  iana: string;
  standard_offset: string | null;
  dst_offset: string | null;
  dst_observed: boolean;
};

export type GroupedOptions<T> = Record<string, T[]>;

export function countries(options?: {
  groupByRegion?: boolean;
  includeFlags?: boolean;
  includeCallingCode?: boolean;
  includeLanguage?: boolean;
  includeAlpha2?: boolean;
}): SelectOption[] | GroupedOptions<SelectOption>;

export function countryLanguages(options?: {
  groupByRegion?: boolean;
  includeFlags?: boolean;
}): SelectOption[] | GroupedOptions<SelectOption>;

export function timezones(options?: {
  groupByContinent?: boolean;
}): SelectOption[] | GroupedOptions<SelectOption>;

export function usStates(options?: {
  groupByRegion?: boolean;
}): SelectOption[] | GroupedOptions<SelectOption>;

export function ukCounties(options?: {
  groupByRegion?: boolean;
}): SelectOption[] | GroupedOptions<SelectOption>;

export function getFlagUrl(flag: string): string | null;

export const data: {
  countries: Country[];
  timezones: Record<string, TimezoneEntry[]>;
  usStates: string[];
  ukCounties: Record<string, string[] | Record<string, string[]>>;
};
