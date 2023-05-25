type TChartOptions = {
  years: number[];
  columns: string[];
};

type TChartColumns = {
  Year: number;
  Date: string;
  Weekday: string;
  Host: string;
  Round: string;
  Home: string;
  'Score (Home Penalty)'?: string;
  'Score (Home)': string;
  Score: string;
  _Score: string;
  'Score (Away)': string;
  'Score (Away Penalty)'?: string;
  Away: string;
  'Home (Manager)': string;
  'Away (Manager)': string;
  Attendance: number;
  'Home (Goals)'?: string;
  'Away (Goals)'?: string;
  'Home (_Goals)'?: string;
  'Away (_Goals)'?: string;
  'Home (Own Goals)'?: string;
  'Away (Own Goals)'?: string;
  'Home (Penalty Goals)'?: string;
  'Away (Penalty Goals)'?: string;
  'Home (_Penalty_Misses)'?: string;
  'Away (_Penalty_Misses)'?: string;
  'Home (_Penalty_Shootout_Goals)'?: string;
  'Away (_Penalty_Shootout_Goals)'?: string;
  'Home (_Penalty_Shootout_Misses)'?: string;
  'Away (_Penalty_Shootout_Misses)'?: string;
  'Home (_Yellow_Cards)'?: string;
  'Away (_Yellow_Cards)'?: string;
  'Home (Yellow Red Cards)'?: string;
  'Away (Yellow Red Cards)'?: string;
  'Home (Red Cards)'?: string;
  'Away (Red Cards)'?: string;
  'Home (_Substitutes)'?: string;
  'Away (_Substitutes)'?: string;
  Notes?: string;
};

type TChartData = {
  [key: number]: TChartColumns[];
};

export type { TChartOptions, TChartColumns, TChartData };