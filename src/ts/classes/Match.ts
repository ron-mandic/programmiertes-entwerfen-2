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
import {
  EGoalType,
  EMatchColumns,
  EMatchColumnsLong,
  ERegExpFlags,
  ERound,
  EStageMode,
  ESymbol,
} from '../enums';
import {
  IDict,
  IDictParticipants,
  IDictParticipantSets,
} from '../interfaces.ts';
import { TGoal, TGoalType, TMatch, TMatchLong, TSide } from '../types.ts';
import {
  funcAddTo,
  funcAddToIf,
  funcFilterByGroupStages,
  funcGenGridStageGroup,
  funcGenGridStageKnockout,
  funcGetScoreTypes,
  funcSortTGoalAsc,
} from '../functions.ts';
import { Type } from './Type.ts';

export class Match {
  // ################################################################################
  // Static properties ##############################################################
  // ################################################################################
  public static REG_GOALS = /([^|·()]+)(?:\s\((OG|P)\))?\s·\s([\d+]+)/g;
  public static REG_RE1_EXTRA_TIME = new RegExp(
    `${RE1_LIMIT}(\\+\\d+)`,
    ERegExpFlags.GLOBAL
  ); // /45(\+\d+)/g

  public static REG_RE2_EXTRA_TIME = new RegExp(
    `${RE2_LIMIT}(\\+\\d+)`,
    ERegExpFlags.GLOBAL
  ); // /90(\+\d+)/g

  public static REG_ET1_EXTRA_TIME = new RegExp(
    `${ET1_LIMIT}(\\+\\d+)`,
    ERegExpFlags.GLOBAL
  ); // /105(\+\d+)/g

  public static REG_ET2_EXTRA_TIME = new RegExp(
    `${ET2_LIMIT}(\\+\\d+)`,
    ERegExpFlags.GLOBAL
  ); // /120(\+\d+)/g

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

    // @ts-ignore
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

    let {
      scoreHomeRE1,
      scoreAwayRE1,
      scoreHomeRE2,
      scoreAwayRE2,
      scoreHomeET1,
      scoreAwayET1,
      scoreHomeET2,
      scoreAwayET2,
    } = funcGetScoreTypes(arrGoalsByHome, arrGoalsByAway);

    // --------------------------------------------------------------------------------

    // TODO: Investigate further complications by picking sample data
    // Correction clause #1a
    if (scoreHomeRE2 < scoreHomeRE1) {
      console.log(HOME, scoreHomeRE2, '<-', scoreHomeRE1);
      // scoreHomeRE2 = scoreHomeRE1;
      console.log(match);
      console.error(
        `mutGetHalftimeScoresOf: Home score for RE2 < RE1 for row ${row}`
      );
    }
    // Correction clause #1b
    if (scoreAwayRE2 < scoreAwayRE1) {
      console.log(AWAY, scoreAwayRE2, '<-', scoreAwayRE1);
      // scoreAwayRE2 = scoreAwayRE1;
      console.log(match);
      console.error(
        `mutGetHalftimeScoresOf: Away score for RE2 < RE1 for row ${row}`
      );
    }

    let scoreRE1 = `${scoreHomeRE1}${ESymbol.HYPHEN_LONG}${scoreAwayRE1}`,
      scoreRE2 = `${scoreHomeRE2}${ESymbol.HYPHEN_LONG}${scoreAwayRE2}`;

    // RE1
    funcAddTo(match, EMatchColumnsLong.SCORE_RE1, scoreRE1);
    // RE2
    funcAddToIf(
      match,
      EMatchColumnsLong.SCORE_RE2,
      scoreRE2
      // scoreHomeRE2 >= scoreHomeRE1 && scoreAwayRE2 >= scoreAwayRE1
    );

    // Guard clause
    if (!match[EMatchColumnsLong.NOTES]) {
      // Correction clause #1c
      if (match[EMatchColumnsLong.SCORE] !== scoreRE2)
        scoreRE2 = match[EMatchColumnsLong.SCORE];

      // RE2
      funcAddToIf(
        match,
        EMatchColumnsLong.SCORE_RE2,
        scoreRE2
        // scoreHomeRE2 >= scoreHomeRE1 && scoreAwayRE2 >= scoreAwayRE1
      );
      return match as TMatchLong;
    }

    // --------------------------------------------------------------------------------

    // TODO: Investigate further complications by picking sample data
    // Correction clause #1d
    if (scoreHomeET2 < scoreHomeET1) {
      console.log(HOME, scoreHomeET2, '<-', scoreHomeET1);
      // scoreHomeET2 = scoreHomeET1;
      console.log(match);
      console.error(
        `mutGetHalftimeScoresOf: Home score for ET2 < ET1 for row ${row}`
      );
    }
    // Correction clause #1e
    if (scoreAwayET2 < scoreAwayET1) {
      console.log(AWAY, scoreAwayET2, '<-', scoreAwayET1);
      // scoreAwayET2 = scoreAwayET1;
      console.log(match);
      console.error(
        `mutGetHalftimeScoresOf: Away score for ET2 < ET1 for row ${row}`
      );
    }

    let scoreET1 = `${scoreHomeET1}${ESymbol.HYPHEN_LONG}${scoreAwayET1}`,
      scoreET2 = `${scoreHomeET2}${ESymbol.HYPHEN_LONG}${scoreAwayET2}`;

    // Correction clause #1f
    if (match[EMatchColumnsLong.SCORE] !== scoreET2)
      scoreET2 = match[EMatchColumnsLong.SCORE];

    // ET1
    funcAddToIf(
      match,
      EMatchColumnsLong.SCORE_ET1,
      scoreET1
      // scoreHomeET1 >= scoreHomeRE2 && scoreAwayET1 >= scoreAwayRE2
    );
    // ET2
    funcAddToIf(
      match,
      EMatchColumnsLong.SCORE_ET2,
      scoreET2
      // scoreHomeET2 >= scoreHomeET1 && scoreAwayET2 >= scoreAwayET1
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
      setCountries.add(homeCountry as string).add(awayCountry as string);
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

      objOccurrences[homeCountry].add(awayCountry as string);
      objOccurrences[awayCountry].add(homeCountry as string);
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

  /**
   * Returns all the matches of the given date from an array of matches.
   *
   * Status: Done
   *
   * @param wms
   * @param date
   * @returns {(TMatch[] | TMatchLong[])} The filtered array of matches as specified by the given date
   */
  public static getAll(
    wms: TMatch[] | TMatchLong[],
    date: string
  ): TMatch[] | TMatchLong[] {
    return wms.filter((wm) => wm[EMatchColumnsLong.DATE] === date);
  }

  /**
   * Returns the filtered array of matches using the given arguments provided by a function
   * that has ordered the stages by the fact if there are group stages or knockout stages.
   *
   * Status: Done
   *
   * @param wm
   * @param args
   * @returns {(TMatch[] | TMatchLong[]) | undefined} The filtered array of matches
   */
  public static getWorldCupStagesUsing(
    wm: TMatch[] | TMatchLong[],
    args: ERound[] | undefined
  ) {
    if (!args) return undefined;

    return wm.filter((match) => {
      if (args.includes(match[EMatchColumnsLong.ROUND] as ERound)) return match;
    });
  }

  /**
   * Returns an object considered to be a dictionary of type `IDictGridStatistics` with all
   * stats for the grids of the given data. It is assumed that the data is already filtered
   * by the given stage mode.
   *
   * Status: Done
   *
   * @param wm
   * @param abs
   * @param stageMode
   */
  public static getGridStatistics(
    wm: TMatch[] | TMatchLong[],
    abs: number,
    stageMode: EStageMode
  ): IDict {
    const dictHalftimeAbsScoreStats: IDict = {};
    if (!abs)
      throw new Error(
        `getGridStatistics: abs is invalid (typeof: ${typeof abs})`
      );

    switch (stageMode) {
      case EStageMode.GROUP: {
        for (let match of wm!) {
          let halftimeScore = match[EMatchColumnsLong.SCORE_RE1]!;
          if (!halftimeScore)
            throw new Error(
              'getGridStatistics: The halftime score does not exist'
            );

          if (!dictHalftimeAbsScoreStats[halftimeScore]) {
            dictHalftimeAbsScoreStats[halftimeScore] = funcGenGridStageGroup();
          }

          let ref = dictHalftimeAbsScoreStats[halftimeScore];
          let scoreHome = match[EMatchColumnsLong.SCORE_HOME]!,
            scoreAway = match[EMatchColumnsLong.SCORE_AWAY]!;

          if (scoreHome > scoreAway) {
            ref.home++;
          } else if (scoreHome < scoreAway) {
            ref.away++;
          } else {
            ref.draw++;
          }
        }

        return dictHalftimeAbsScoreStats;
      }
      case EStageMode.KNOCKOUT: {
        for (let match of wm!) {
          let halftimeScore = match[EMatchColumnsLong.SCORE_RE1]!;
          if (!halftimeScore)
            throw new Error(
              'getGridStatistics: The halftime score does not exist'
            );

          if (!dictHalftimeAbsScoreStats[halftimeScore]) {
            dictHalftimeAbsScoreStats[halftimeScore] =
              funcGenGridStageKnockout();
          }

          let ref = dictHalftimeAbsScoreStats[halftimeScore];
          let scoreHome = match[EMatchColumnsLong.SCORE_HOME]!,
            scoreHomePenalties = match[EMatchColumnsLong.SCORE_HOME_PENALTY]!,
            scoreAway = match[EMatchColumnsLong.SCORE_AWAY]!,
            scoreAwayPenalties = match[EMatchColumnsLong.SCORE_AWAY_PENALTY]!;

          if (scoreHome > scoreAway) {
            ref.home++;
          } else if (scoreHome < scoreAway) {
            ref.away++;
          } else {
            if (!scoreHomePenalties || !scoreAwayPenalties) {
              const _match = Match.mutLookup(wm, match);
              // It is assumed that the match does not exist anymore after 1982
              if (Type.isUndefined(_match)) {
                ref.et++;
              }
              continue;
            } else {
              ref.p++;
            }

            if (scoreHomePenalties > scoreAwayPenalties) {
              ref.home++;
            } else if (scoreHomePenalties < scoreAwayPenalties) {
              ref.away++;
            } else {
              console.log(scoreHomePenalties, scoreAwayPenalties);
              throw new Error(
                'getGridStatistics: Penalty shootout cannot end in a draw'
              );
            }
          }
        }

        return dictHalftimeAbsScoreStats;
      }
    }
  }

  public static mutLookup(
    wm: TMatch[] | TMatchLong[],
    match: TMatch | TMatchLong
  ) {
    switch (match.ID) {
      // Date: '1934-05-31' Italy vs Spain
      // "Da das Elfmeterschießen erst 1982 eingeführt wurde, gab es ein Wiederholungsspiel." (https://de.wikipedia.org/wiki/Fu%C3%9Fball-Weltmeisterschaft_1934#Viertelfinale)
      case 28: {
        match.REPLAY = wm[12] as TMatchLong; // ID = 30: Italy vs Spain (1:0)
        return match;
      }
      // Date: '1938-06-04' Switzerland vs Germany
      case 35: {
        match.REPLAY = wm[7] as TMatchLong; // ID = 42: Switzerland vs Germany (4:2)
        return match;
      }
      // Date: '1938-06-05' Cuba vs Romania
      case 37: {
        match.REPLAY = wm[8] as TMatchLong; // ID = 43: Cuba vs Romania (2:1)
        return match;
      }
      // Date: '1938-06-12' Brazil vs Czechoslovakia
      case 45: {
        match.REPLAY = wm[13] as TMatchLong; // ID = 48: Brazil vs Czechoslovakia (2:1)
        return match;
      }
    }
  }
}
