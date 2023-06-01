import {
  AWAY,
  ET1_LIMIT,
  ET2_LIMIT,
  HOME,
  MatchColumns,
  NA,
  RE1_LIMIT,
  RE2_LIMIT,
} from '../constants';
import { EGoalType, EMatchColumns, EMatchColumnsLong, ESymbol } from '../enums';
import { IDictCountry, IDictCountrySets } from '../interfaces.ts';
import { TGoal, TMatch, TMatchLong, TSide } from '../types.ts';
import { funcSortAscTGoal } from '../functions.ts';

export class Match {
  // Static properties ########################################
  /**
   * `Match.REG_EXP_HOME_AND_AWAY_GOALS` is a regular expression to match both home and away goals (not the long version
   */
  public static REG_EXP_HOME_AND_AWAY_GOALS =
    /([^|·()]+)(?:\s\((OG|P)\))?\s·\s([\d+]+)/g;
  /**
   * `Match.REG_RE1_PLUS` is a regular expression for home goals scored in overtime of the regular first half
   */
  public static REG_RE1_PLUS = /45\+\d+/g;
  public static REG_RE1 = /45(\+\d+)?/g;
  /**
   * `Match.REG_RE2_PLUS` is a regular expression for home goals scored in overtime of the regular second half.
   */
  public static REG_RE2_PLUS = /90\+\d+/g;
  public static REG_RE2 = /90(\+\d+)?/g;
  /**
   * `Match.REG_ET1_PLUS` is a regular expression for home goals scored in overtime of the extra first half
   */
  public static REG_ET1_PLUS = /105\+\d+/g;
  public static REG_ET1 = /105(\+\d+)?/g;
  /**
   * `Match.REG_ET2_PLUS` is a regular expression for home goals scored in overtime of the extra second half
   */
  public static REG_ET2_PLUS = /120\+\d+/g;
  public static REG_ET2 = /120(\+\d+)?/g;

  // Static methods ########################################
  // Row ----------------------------------------
  /**
   * `Match.typeOf` returns the type of goal (undefined, OG, P)
   * @param type - The type of goal
   */
  public static typeOf(type: string): undefined | EGoalType.OG | EGoalType.P {
    return EGoalType[type as keyof typeof EGoalType];
  }
  /**
   * `Match.goalsOf` returns an array of goals
   * @param data - The data with all matches
   * @param row - A single index number of the match
   * @param column - The column of the goal (HOME_GOALS, AWAY_GOALS, etc.)
   */
  public static goalsOf(
    data: TMatch[],
    row: number,
    column: string
  ): TGoal[] | undefined {
    const expr = data[row][column];
    if (!expr) return undefined; // throw new Error(`goalsOf: No data for row ${row} at column "${column}"`);

    const iterator = expr.matchAll(this.REG_EXP_HOME_AND_AWAY_GOALS);
    const arrGoals = [] as TGoal[];

    for (const match of iterator) {
      const minute = match[3] ?? NA;
      const scoredBy = match[1] ?? NA;
      const type = match[2] ?? NA;
      arrGoals.push({ minute, scoredBy, type: Match.typeOf(type) });
    }

    return arrGoals;
  }
  public static goalsBy(data: TMatch[], row: number, side: TSide): TGoal[] {
    const arrGoals = [] as TGoal[];

    const goals = Match.goalsOf(data, row, EMatchColumns[`${side}_GOALS`]);
    const ownGoals = Match.goalsOf(
      data,
      row,
      EMatchColumns[`${side}_GOALS_OWN`]
    );
    const penaltyGoals = Match.goalsOf(
      data,
      row,
      EMatchColumns[`${side}_GOALS_PENALTY`]
    );

    if (goals) arrGoals.push(...goals);
    if (ownGoals) arrGoals.push(...ownGoals);
    if (penaltyGoals) arrGoals.push(...penaltyGoals);

    return arrGoals.sort(funcSortAscTGoal);
  }

  /**
   * `Match.goalsOfHome` returns an array of goals with extra information about the half-time scores.
   * The function is going to mutate the data by appending the half-time scores to the data set.
   * @param data - The data with all matches
   * @param row - A single index number of the match
   */
  public static halfTimeScoresOf(data: TMatchLong[], row: number): any {
    const homeGoalsTotal = Match.goalsBy(data, row, HOME);
    // console.log('homeGoalsTotal', homeGoalsTotal);
    const awayGoalsTotal = Match.goalsBy(data, row, AWAY);
    // console.log('awayGoalsTotal', awayGoalsTotal);

    // RE1 ----------------------------------------
    const SCORE_RE1_HOME = homeGoalsTotal.filter(({ minute }: TGoal) => {
      return +minute <= +RE1_LIMIT || this.REG_RE1.test(minute);
    }).length;
    const SCORE_RE1_AWAY = awayGoalsTotal.filter(({ minute }: TGoal) => {
      return +minute <= +RE1_LIMIT || this.REG_RE1.test(minute);
    }).length;

    data[row][
      EMatchColumnsLong.SCORE_RE1
    ] = `${SCORE_RE1_HOME}${ESymbol.HYPHEN_LONG}${SCORE_RE1_AWAY}`;

    // RE2 ----------------------------------------
    const SCORE_RE2_HOME = homeGoalsTotal.filter(({ minute }: TGoal) => {
      return +minute <= +RE2_LIMIT || this.REG_RE2.test(minute);
    }).length;
    const SCORE_RE2_AWAY = awayGoalsTotal.filter(({ minute }: TGoal) => {
      return +minute <= +RE2_LIMIT || this.REG_RE2.test(minute);
    }).length;

    data[row][
      EMatchColumnsLong.SCORE_RE2
    ] = `${SCORE_RE2_HOME}${ESymbol.HYPHEN_LONG}${SCORE_RE2_AWAY}`;

    // EXIT ----------------------------------------
    if (!data[row][EMatchColumnsLong.NOTES]) return;
    // EXIT ----------------------------------------

    // ET1 ----------------------------------------
    const SCORE_ET1_HOME = homeGoalsTotal.filter(({ minute }: TGoal) => {
      return +minute <= +ET1_LIMIT || this.REG_ET1.test(minute);
    }).length;
    const SCORE_ET1_AWAY = awayGoalsTotal.filter(({ minute }: TGoal) => {
      return +minute <= +ET1_LIMIT || this.REG_ET1.test(minute);
    }).length;

    if (SCORE_ET1_HOME >= SCORE_RE2_HOME && SCORE_ET1_AWAY >= SCORE_RE2_AWAY) {
      data[row][
        EMatchColumnsLong.SCORE_ET1
      ] = `${SCORE_ET1_HOME}${ESymbol.HYPHEN_LONG}${SCORE_ET1_AWAY}`;
    }

    // ET2 ----------------------------------------
    const SCORE_ET2_HOME = homeGoalsTotal.filter(({ minute }: TGoal) => {
      return +minute <= +ET2_LIMIT || this.REG_ET2.test(minute);
    }).length;
    const SCORE_ET2_AWAY = awayGoalsTotal.filter(({ minute }: TGoal) => {
      return +minute <= +ET2_LIMIT || this.REG_ET2.test(minute);
    }).length;

    if (SCORE_ET2_HOME >= SCORE_ET1_HOME && SCORE_ET2_AWAY >= SCORE_ET1_AWAY) {
      data[row][
        EMatchColumnsLong.SCORE_ET2
      ] = `${SCORE_ET2_HOME}${ESymbol.HYPHEN_LONG}${SCORE_ET2_AWAY}`;
    }

    return data;
  }

  // Rows ----------------------------------------
  /**
   * `Match.countriesOf` returns an array of countries as strings
   * @param data - The data with all matches
   * @param isSorted - Whether the array should be sorted
   */
  public static countriesOf(data: TMatch[], isSorted = true): any {
    const setCountries = new Set<string>();

    for (let i = 0; i < data.length; i++) {
      const homeCountry = data[i][MatchColumns.HOME]!;
      const awayCountry = data[i][MatchColumns.AWAY]!;

      setCountries.add(homeCountry).add(awayCountry);
    }

    return isSorted
      ? Array.from(setCountries).sort()
      : Array.from(setCountries);
  }
  /**
   * `Match.encountersOf` returns an object with countries as keys and their sets of countries as values
   * @param data - The data with all matches
   */
  public static encountersOf(data: TMatch[] | TMatchLong[]): IDictCountrySets {
    const arrCountries: string[] = this.countriesOf(data);
    const objOccurrences = {} as IDictCountrySets;

    if (!arrCountries)
      throw new Error('countriesOf: arrCountries is undefined');

    for (let i = 0; i < data.length; i++) {
      const homeCountry = data[i][MatchColumns.HOME]!;
      const awayCountry = data[i][MatchColumns.AWAY]!;

      if (!objOccurrences[homeCountry]) {
        objOccurrences[homeCountry] = new Set<string>();
      }
      if (!objOccurrences[awayCountry]) {
        objOccurrences[awayCountry] = new Set<string>();
      }

      objOccurrences[homeCountry].add(awayCountry);
      objOccurrences[awayCountry].add(homeCountry);
    }

    return objOccurrences;
  }
  /**
   * `Match.groupsOf` returns a copied object with a lookup table and an array of arrays of countries as strings.
   * The lookup table specifies the index of the group for each country. `groups` holds each group as an array of countries.
   * @param data - The data with the mapping of ine country to its opponents
   * @param isSorted - Whether the array should be sorted
   */
  public static groupsOf(
    data: IDictCountrySets,
    isSorted = true
  ): IDictCountry {
    const dict = { lookup: {}, groups: [] } as IDictCountry;
    const _data = structuredClone(data);
    let counter = 0;

    for (let value in _data) {
      const setCountries = _data[value];

      for (let country of setCountries) {
        delete _data[country];
      }

      const arrCountries = isSorted
        ? [value, ...Array.from(setCountries)].sort()
        : [value, ...Array.from(setCountries)];
      for (let country of arrCountries) {
        dict.lookup[country] = counter;
      }

      dict.groups.push(arrCountries);
      counter++;
    }

    return dict;
  }
  /**
   * `Match.groupTablesOf` creates the tables with stats ranging from the total number of matches
   * to the number of goals.
   * @param data - The data with all matches
   * @param dict - The dictionary with the lookup table and the groups
   */
  // TODO: Create the group tables
  public static groupTablesOf(data: TMatch[], dict: IDictCountry) {
    const _dict = structuredClone(dict);
    console.log(data, _dict);
  }
}
