import { EGoalType } from './enums.ts';
import { HOME, AWAY } from './constants.ts';

type TConsole = [string, string];

type TSide = typeof HOME | typeof AWAY;
type TMatch = {
  Year: string;
  Date: string;
  Weekday: string;
  Host: string;
  Round: string;
  Home: string;
  'Score (Home Penalty)': string;
  'Score (Home)': string;
  Score: string;
  _Score: string;
  'Score (Away)': string;
  'Score (Away Penalty)': string;
  Away: string;
  'Home (Manager)': string;
  'Away (Manager)': string;
  Attendance: string;
  'Home (Goals)': string;
  'Away (Goals)': string;
  'Home (_Goals)': string;
  'Away (_Goals)': string;
  'Home (Own Goals)': string;
  'Away (Own Goals)': string;
  'Home (Penalty Goals)': string;
  'Away (Penalty Goals)': string;
  'Home (_Penalty_Misses)': string;
  'Away (_Penalty_Misses)': string;
  'Home (_Penalty_Shootout_Goals)': string;
  'Away (_Penalty_Shootout_Goals)': string;
  'Home (_Penalty_Shootout_Misses)': string;
  'Away (_Penalty_Shootout_Misses)': string;
  'Home (_Yellow_Cards)': string;
  'Away (_Yellow_Cards)': string;
  'Home (Yellow Red Cards)': string;
  'Away (Yellow Red Cards)': string;
  'Home (Red Cards)': string;
  'Away (Red Cards)': string;
  'Home (_Substitutes)': string;
  'Away (_Substitutes)': string;
  Notes: string;
  [key: string]: string; // TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'TMatch'.
};
type TMatchLong = TMatch & {
  'Score (RE1)': string;
  'Score (RE2)': string;
  'Score (ET1)'?: string;
  'Score (ET2)'?: string;
};

type TGoal = {
  minute: string;
  scoredBy: string;
  type: undefined | EGoalType.OG | EGoalType.P;
};
type TGoalLong = {
  minute: string;
  scoredBy: string;
  assistedBy: string;
  type: undefined | EGoalType.OG | EGoalType.P;
};

type TGroupRow = {
  games: number;
  wins: number;
  draws: number;
  losses: number;
  goalsScored: number;
  goalsConceded: number;
  goalsDiff: number;
};

export type {
  TConsole,
  TSide,
  TMatch,
  TMatchLong,
  TGoal,
  TGoalLong,
  TGroupRow,
};
