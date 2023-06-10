import { EConsoleStyles } from './enums.ts';
import { TConsole } from './types.ts';

const NA = 'N/A';
const OG = 'OG';
const P = 'P';
const HOME = 'HOME';
const AWAY = 'AWAY';

const EXIT_FAILURE: TConsole = [
  '\n%cindex.ts (EXIT_FAILURE) - async f main()',
  EConsoleStyles.ERROR,
];
const EXIT_SUCCESS: TConsole = [
  '\n%cindex.ts (EXIT_SUCCESS) - async f main()',
  EConsoleStyles.SUCCESS,
];

const WorldCupYears = [
  1930 /* https://de.wikipedia.org/wiki/Fu%C3%9Fball-Weltmeisterschaft_1930 */,
  1934 /* https://de.wikipedia.org/wiki/Fu%C3%9Fball-Weltmeisterschaft_1934 */,
  1938 /* https://de.wikipedia.org/wiki/Fu%C3%9Fball-Weltmeisterschaft_1938 */,
  1950 /* https://de.wikipedia.org/wiki/Fu%C3%9Fball-Weltmeisterschaft_1950 */,
  1954 /* https://de.wikipedia.org/wiki/Fu%C3%9Fball-Weltmeisterschaft_1954 */,
  1958 /* https://de.wikipedia.org/wiki/Fu%C3%9Fball-Weltmeisterschaft_1958 */,
  1962 /* https://de.wikipedia.org/wiki/Fu%C3%9Fball-Weltmeisterschaft_1962 */,
  1966 /* https://de.wikipedia.org/wiki/Fu%C3%9Fball-Weltmeisterschaft_1966 */,
  1970 /* https://de.wikipedia.org/wiki/Fu%C3%9Fball-Weltmeisterschaft_1970 */,
  1974 /* https://de.wikipedia.org/wiki/Fu%C3%9Fball-Weltmeisterschaft_1974 */,
  1978 /* https://de.wikipedia.org/wiki/Fu%C3%9Fball-Weltmeisterschaft_1978 */,
  1982 /* https://de.wikipedia.org/wiki/Fu%C3%9Fball-Weltmeisterschaft_1982 */,
  1986 /* https://de.wikipedia.org/wiki/Fu%C3%9Fball-Weltmeisterschaft_1986 */,
  1990 /* https://de.wikipedia.org/wiki/Fu%C3%9Fball-Weltmeisterschaft_1990 */,
  1994 /* https://de.wikipedia.org/wiki/Fu%C3%9Fball-Weltmeisterschaft_1994 */,
  1998 /* https://de.wikipedia.org/wiki/Fu%C3%9Fball-Weltmeisterschaft_1998 */,
  2002 /* https://de.wikipedia.org/wiki/Fu%C3%9Fball-Weltmeisterschaft_2002 */,
  2006 /* https://de.wikipedia.org/wiki/Fu%C3%9Fball-Weltmeisterschaft_2006 */,
  2010 /* https://de.wikipedia.org/wiki/Fu%C3%9Fball-Weltmeisterschaft_2010 */,
  2014 /* https://de.wikipedia.org/wiki/Fu%C3%9Fball-Weltmeisterschaft_2014 */,
  2018 /* https://de.wikipedia.org/wiki/Fu%C3%9Fball-Weltmeisterschaft_2018 */,
  2022 /* https://de.wikipedia.org/wiki/Fu%C3%9Fball-Weltmeisterschaft_2022 */,
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

const TOURNAMENT_START_LONG = '05-01',
  TOURNAMENT_START = '05-27',
  TOURNAMENT_END = '12-18',
  TOURNAMENT_END_LONG = '12-31';

const DATE_RANGE_IN_DAYS = 245;
const DATE_RANGE_IN_MONTHS = 8;

const DATA_VIEW_YEAR = 'view:year',
  DATA_VIEW_DAY = 'view:day',
  DATA_VIEW_WEEKDAY = 'view:weekday',
  DATA_VIEW_HOST = 'view:host';

const CHART_WIDTH_MIN = 1440,
  CHART_WIDTH_MAX = 1920;
const CHART_WIDTH_OFFSET_MIN = 360,
  CHART_WIDTH_OFFSET_MAX = 480;

export {
  NA,
  OG,
  P,
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
  TOURNAMENT_START_LONG,
  TOURNAMENT_START,
  TOURNAMENT_END,
  TOURNAMENT_END_LONG,
  DATE_RANGE_IN_DAYS,
  DATE_RANGE_IN_MONTHS,
  DATA_VIEW_YEAR,
  DATA_VIEW_DAY,
  DATA_VIEW_WEEKDAY,
  DATA_VIEW_HOST,
  CHART_WIDTH_MIN,
  CHART_WIDTH_MAX,
  CHART_WIDTH_OFFSET_MIN,
  CHART_WIDTH_OFFSET_MAX,
};
