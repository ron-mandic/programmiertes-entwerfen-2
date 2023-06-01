import { EConsoleStyles } from './enums.ts';
import { TConsole } from './types.ts';

const NA = 'N/A';
const HOME = 'HOME';
const AWAY = 'AWAY';

const EXIT_FAILURE: TConsole = [
  '\n%cindex.ts (EXIT_FAILURE) - main()',
  EConsoleStyles.ERROR,
];
const EXIT_SUCCESS: TConsole = [
  '\n%cindex.ts (EXIT_SUCCESS) - main()',
  EConsoleStyles.SUCCESS,
];

const WorldCupYears = [
  1930 /* 1934, 1938, 1950, 1954, 1958, 1962, 1966, 1970, 1974, 1978, 1982, 1986, */,
  /* 1990, 1994, 1998, 2002, 2006, 2010, 2014, 2018, */ 2022,
];

const MatchColumns = {
  YEAR: 'Year',
  DATE: 'Date',
  WEEKDAY: 'Weekday',
  HOST: 'Host',
  ROUND: 'Round',
  HOME: 'Home',
  SCORE_HOME_PENALTY: 'Score (Home Penalty)',
  SCORE_HOME: 'Score (Home)',
  SCORE: 'Score',
  SCORE_LONG: '_Score',
  SCORE_AWAY: 'Score (Away)',
  SCORE_AWAY_PENALTY: 'Score (Away Penalty)',
  AWAY: 'Away',
  HOME_MANAGER: 'Home (Manager)',
  AWAY_MANAGER: 'Away (Manager)',
  ATTENDANCE: 'Attendance',
  HOME_GOALS: 'Home (Goals)',
  AWAY_GOALS: 'Away (Goals)',
  HOME_GOALS_LONG: 'Home (_Goals)',
  AWAY_GOALS_LONG: 'Away (_Goals)',
  HOME_GOALS_OWN: 'Home (Own Goals)',
  AWAY_GOALS_OWN: 'Away (Own Goals)',
  HOME_GOALS_PENALTY: 'Home (Penalty Goals)',
  AWAY_GOALS_PENALTY: 'Away (Penalty Goals)',
  HOME_PENALTY_MISSES: 'Home (_Penalty_Misses)',
  AWAY_PENALTY_MISSES: 'Away (_Penalty_Misses)',
  HOME_GOALS_PENALTY_SHOOTOUT: 'Home (_Penalty_Shootout_Goals)',
  AWAY_GOALS_PENALTY_SHOOTOUT: 'Away (_Penalty_Shootout_Goals)',
  HOME_PENALTY_SHOOTOUT_MISSES_LONG: 'Home (_Penalty_Shootout_Misses)',
  AWAY_PENALTY_SHOOTOUT_MISSES_LONG: 'Away (_Penalty_Shootout_Misses)',
  HOME_YELLOW_LONG: 'Home (_Yellow_Cards)',
  AWAY_YELLOW_LONG: 'Away (_Yellow_Cards)',
  HOME_CARDS_YELLOW_RED: 'Home (Yellow Red Cards)',
  AWAY_CARDS_YELLOW_RED: 'Away (Yellow Red Cards)',
  HOME_CARDS_RED: 'Home (Red Cards)',
  AWAY_CARDS_RED: 'Away (Red Cards)',
  HOME_SUBSTITUTES: 'Home (_Substitutes)',
  AWAY_SUBSTITUTES: 'Away (_Substitutes)',
  NOTES: 'Notes',
};

const RE1_LIMIT = '45';
const RE2_LIMIT = '90';
const ET1_LIMIT = '105';
const ET2_LIMIT = '120';

export {
  NA,
  HOME,
  AWAY,
  EXIT_FAILURE,
  EXIT_SUCCESS,
  WorldCupYears,
  MatchColumns,
  RE1_LIMIT,
  RE2_LIMIT,
  ET1_LIMIT,
  ET2_LIMIT,
};
