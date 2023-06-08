import { AWAY, HOME, MatchColumns, NA } from '../constants';
import { EGoalType, EMatchColumns, EMatchColumnsLong, ESymbol } from '../enums';
import {
  IDict,
  IDictParticipants,
  IDictParticipantSets,
} from '../interfaces.ts';
import { TGoal, TGoalType, TMatch, TMatchLong, TSide } from '../types.ts';
import {
  funcAddToIf,
  funcFilterByGroupStages,
  funcGetScoreTypes,
  funcSortTGoalAsc,
} from '../functions.ts';

export class Match {
  // ################################################################################
  // Static properties ##############################################################
  // ################################################################################
  public static REG_GOALS = /([^|·()]+)(?:\s\((OG|P)\))?\s·\s([\d+]+)/g;
  public static REG_RE1 = /45(\+\d+)?/g;
  public static REG_RE2 = /90(\+\d+)?/g;
  public static REG_ET1 = /105(\+\d+)?/g;
  public static REG_ET2 = /120(\+\d+)?/g;

  // ################################################################################
  // Static methods #################################################################
  // ################################################################################
  /**
   * Returns a human-readable type of goal
   *
   * Status: Done
   *
   * @param type - The type of goal ("OG", "P" or "NA")
   * @returns The type of goal ("Own goal", "Penalty goal" or undefined)
   */
  public static getGoalTypeOf(
    type: TGoalType
  ): undefined | EGoalType.OG | EGoalType.P {
    return EGoalType[type as keyof typeof EGoalType];
  }

  public static getRoundsOf(data: TMatch[], toSort = false): string[] {
    const setRounds = new Set<string>();

    for (const match of data) {
      const round = match[EMatchColumns.ROUND];
      setRounds.add(round);
    }

    return toSort ? Array.from(setRounds).sort() : Array.from(setRounds);
  }

  // ################################################################################
  /**
   * Extracts the minute, the player and the type of goal from a string and
   * returns an array of TGoal objects
   *
   * Status: Done
   *
   * @param data - The data with all matches
   * @param row - A single index number of the match
   * @param column - The column of the goal (HOME_GOALS, AWAY_GOALS, etc.)
   */
  public static getGoalsOf(
    data: TMatch[],
    row: number,
    column: string
  ): TGoal[] | undefined {
    const expr = data[row][column];
    if (!expr) return undefined; // throw new Error(`goalsOf: No data for row ${row} at column "${column}"`);

    const iterator = expr.matchAll(this.REG_GOALS);
    const arrGoals = [] as TGoal[];

    for (const match of iterator) {
      const minute = match[3] ?? NA;
      const scoredBy = match[1] ?? NA;
      const type = (match[2] ?? NA) as TGoalType;
      arrGoals.push({ minute, scoredBy, type: Match.getGoalTypeOf(type) });
    }

    return arrGoals;
  }

  // ################################################################################
  /**
   * Extracts both regular goals, own goals and penalty goals from a match using `Match.goalsOf`
   * and returns an array of `TGoal` objects sorted by minute.
   *
   * Status: Done
   *
   * @param data - The data with all matches
   * @param row - A single index number of the match
   * @param side - The team (HOME or AWAY)
   * @returns An array of TGoal objects sorted by minute
   *
   * @see Match.getGoalsOf
   */
  public static getGoalsBy(data: TMatch[], row: number, side: TSide): TGoal[] {
    const arrGoals = [] as TGoal[];

    const arrGoalsRegular = Match.getGoalsOf(
        data,
        row,
        EMatchColumns[`${side}_GOALS`]
      ),
      arrGoalsOwn = Match.getGoalsOf(
        data,
        row,
        EMatchColumns[`${side}_GOALS_OWN`]
      ),
      arrGoalsPenalty = Match.getGoalsOf(
        data,
        row,
        EMatchColumns[`${side}_GOALS_PENALTY`]
      );

    if (arrGoalsRegular) arrGoals.push(...arrGoalsRegular);
    if (arrGoalsOwn) arrGoals.push(...arrGoalsOwn);
    if (arrGoalsPenalty) arrGoals.push(...arrGoalsPenalty);

    return arrGoals.sort(funcSortTGoalAsc);
  }

  // ################################################################################
  /**
   * Returns an array of `TMatchLong` objects with extra information about the half-time scores.
   * The function is going to return mutated data by appending the half-time scores to the data set.
   *
   * Status: Done
   *
   * @param data - The data with all matches
   * @param row - A single index number of the match
   */
  public static mutGetHalftimeScoresOf(
    data: TMatch[],
    row: number
  ): TMatchLong {
    let match = data[row];
    if (!match) throw new Error(`halftimeScoresOf: No data for row ${row}`);
    const arrGoalsByHome = Match.getGoalsBy(data, row, HOME);
    const arrGoalsByAway = Match.getGoalsBy(data, row, AWAY);

    const {
      scoreHomeRE1,
      scoreAwayRE1,
      scoreHomeRE2,
      scoreAwayRE2,
      scoreHomeET1,
      scoreAwayET1,
      scoreHomeET2,
      scoreAwayET2,
    } = funcGetScoreTypes(arrGoalsByHome, arrGoalsByAway);

    // RE1
    funcAddToIf(
      match,
      EMatchColumnsLong.SCORE_RE1,
      `${scoreHomeRE1}${ESymbol.HYPHEN_LONG}${scoreAwayRE1}`
    );
    // RE2
    funcAddToIf(
      match,
      EMatchColumnsLong.SCORE_RE2,
      `${scoreHomeRE2}${ESymbol.HYPHEN_LONG}${scoreAwayRE2}`
    );

    // Guard clause #1
    if (!match[EMatchColumnsLong.NOTES]) return match as TMatchLong;

    // ET1
    funcAddToIf(
      match,
      EMatchColumnsLong.SCORE_ET1,
      `${scoreHomeET1}${ESymbol.HYPHEN_LONG}${scoreAwayET1}`,
      scoreHomeET1 >= scoreHomeRE2 && scoreAwayET1 >= scoreAwayRE2
    );
    // ET2
    funcAddToIf(
      match,
      EMatchColumnsLong.SCORE_ET2,
      `${scoreHomeET2}${ESymbol.HYPHEN_LONG}${scoreAwayET2}`,
      scoreHomeET2 >= scoreHomeET1 && scoreAwayET2 >= scoreAwayET1
    );

    return match as TMatchLong;
  }

  // ################################################################################
  /**
   * Returns an array of all countries that participated in the tournament. The returned
   * array is sorted by default.
   *
   * Status: Done
   *
   * @param data - The data with all matches
   * @param toSort - Whether the array should be sorted
   * @returns A string array of all countries that participated in the tournament
   */
  public static getParticipantsOf(
    data: TMatch[] | TMatchLong[],
    toSort = true
  ): string[] {
    const setCountries = new Set<string>();

    for (let i = 0; i < data.length; i++) {
      const homeCountry = data[i][MatchColumns.HOME]!;
      const awayCountry = data[i][MatchColumns.AWAY]!;
      setCountries.add(homeCountry).add(awayCountry);
    }

    return toSort ? Array.from(setCountries).sort() : Array.from(setCountries);
  }

  // ################################################################################
  /**
   * Returns an object considered to be a dictionary of type `IDictCountrySets` with all
   * participating countries as keys and a set of all countries that the key country
   * has played against as values.
   *
   * Status: Done
   *
   * @param data - The data with all matches
   */
  public static getEncountersOf(
    data: TMatch[] | TMatchLong[]
  ): IDictParticipantSets {
    const arrCountries: string[] = this.getParticipantsOf(data);
    const objOccurrences = {} as IDictParticipantSets;

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

  // ################################################################################
  /**
   * Returns a reduced object of type `IDictCountry` which holds a lookup table and an array of arrays of countries as strings.
   * The lookup table specifies the index of the group for each country. `groups` holds each group as an array of countries.
   *
   * Regarding the input, the function expects an object of type `IDictCountrySets` which holds all encounters of each individual
   * participant of the tournament.
   *
   * Status: Done
   *
   * @param data - The data with the mapping of ine country to its opponents
   * @param toSort - Whether the array should be sorted
   */
  public static getGroupsFor(
    data: TMatch[] | TMatchLong[],
    toSort = false
  ): IDictParticipants | undefined {
    const arrGroupStages = data.filter(funcFilterByGroupStages);
    if (!arrGroupStages.length) return;

    const dict = {
      data: arrGroupStages,
      lookup: {},
      groups: [],
    } as IDictParticipants;
    const _data = Match.getEncountersOf(arrGroupStages);
    let counter = 0;

    for (let value in _data) {
      const setCountries = _data[value];
      if (!setCountries)
        throw new Error(`participantEncountersOf: No data for ${value}`);

      for (let country of setCountries) {
        delete _data[country];
      }

      const arrCountries = toSort
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

  // ################################################################################
  /**
   * Returns an object considered to be a simple dictionary of type `IDict` which holds
   * the accumulated number of occurrences of each property of the given data.
   *
   * Status: Done
   *
   * @param data
   * @param prop
   * @returns An object of type `IDict` with the accumulated number of occurrences of each property of the given data
   */
  public static getOccurrencesOf(
    data: TMatch[] | TMatchLong[],
    prop: string | number
  ): IDict {
    const objDict = {} as IDict;

    for (let match of data!) {
      if (!objDict[match[prop]]) {
        objDict[match[prop]] = 1;
      } else {
        objDict[match[prop]]++;
      }
    }

    return objDict;
  }
}
