interface IDictCountry {
  lookup: { [key: string]: number };
  groups: string[][];
}

interface IDictCountrySets {
  [key: string]: Set<string>;
}

export type { IDictCountry, IDictCountrySets };
