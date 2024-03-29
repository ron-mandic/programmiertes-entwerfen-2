enum EConsoleStyles {
  SUCCESS = 'background-color: #44aa6b; color: white; padding: .25rem .5rem; border-radius: .25rem; font-style: italic;',
  INFO = 'background-color: #446bcc; padding: .25rem .5rem; border-radius: .25rem; font-style: italic;',
  WARNING = 'background-color: #eeaa46; padding: .25rem .5rem; border-radius: .25rem; font-style: italic;',
  ERROR = 'background-color: #cc446b; color: white; padding: .25rem .5rem; border-radius: .25rem; font-style: italic;',
}

enum ESymbol {
  HYPHEN = '-',
  HYPHEN_LONG = '–',
  COMMA = ',',
}

enum EMatchColumns {
  YEAR = 'Year',
  DATE = 'Date',
  WEEKDAY = 'Weekday',
  HOST = 'Host',
  ROUND = 'Round',
  HOME = 'Home',
  SCORE_HOME_PENALTY = 'Score (Home Penalty)',
  SCORE_HOME = 'Score (Home)',
  SCORE = 'Score',
  SCORE_LONG = '_Score',
  SCORE_AWAY = 'Score (Away)',
  SCORE_AWAY_PENALTY = 'Score (Away Penalty)',
  AWAY = 'Away',
  HOME_MANAGER = 'Home (Manager)',
  AWAY_MANAGER = 'Away (Manager)',
  ATTENDANCE = 'Attendance',
  HOME_GOALS = 'Home (Goals)',
  AWAY_GOALS = 'Away (Goals)',
  HOME_GOALS_LONG = 'Home (_Goals)',
  AWAY_GOALS_LONG = 'Away (_Goals)',
  HOME_GOALS_OWN = 'Home (Own Goals)',
  AWAY_GOALS_OWN = 'Away (Own Goals)',
  HOME_GOALS_PENALTY = 'Home (Penalty Goals)',
  AWAY_GOALS_PENALTY = 'Away (Penalty Goals)',
  HOME_PENALTY_MISSES = 'Home (_Penalty_Misses)',
  AWAY_PENALTY_MISSES = 'Away (_Penalty_Misses)',
  HOME_GOALS_PENALTY_SHOOTOUT = 'Home (_Penalty_Shootout_Goals)',
  AWAY_GOALS_PENALTY_SHOOTOUT = 'Away (_Penalty_Shootout_Goals)',
  HOME_PENALTY_SHOOTOUT_MISSES_LONG = 'Home (_Penalty_Shootout_Misses)',
  AWAY_PENALTY_SHOOTOUT_MISSES_LONG = 'Away (_Penalty_Shootout_Misses)',
  HOME_YELLOW_LONG = 'Home (_Yellow_Cards)',
  AWAY_YELLOW_LONG = 'Away (_Yellow_Cards)',
  HOME_CARDS_YELLOW_RED = 'Home (Yellow Red Cards)',
  AWAY_CARDS_YELLOW_RED = 'Away (Yellow Red Cards)',
  HOME_CARDS_RED = 'Home (Red Cards)',
  AWAY_CARDS_RED = 'Away (Red Cards)',
  HOME_SUBSTITUTES = 'Home (_Substitutes)',
  AWAY_SUBSTITUTES = 'Away (_Substitutes)',
  NOTES = 'Notes',
}

enum EMatchColumnsLong {
  YEAR = 'Year',
  DATE = 'Date',
  WEEKDAY = 'Weekday',
  HOST = 'Host',
  ROUND = 'Round',
  HOME = 'Home',
  SCORE_HOME_PENALTY = 'Score (Home Penalty)',
  SCORE_HOME = 'Score (Home)',
  SCORE = 'Score',
  SCORE_LONG = '_Score',
  SCORE_AWAY = 'Score (Away)',
  SCORE_AWAY_PENALTY = 'Score (Away Penalty)',
  AWAY = 'Away',
  HOME_MANAGER = 'Home (Manager)',
  AWAY_MANAGER = 'Away (Manager)',
  ATTENDANCE = 'Attendance',
  HOME_GOALS = 'Home (Goals)',
  AWAY_GOALS = 'Away (Goals)',
  HOME_GOALS_LONG = 'Home (_Goals)',
  AWAY_GOALS_LONG = 'Away (_Goals)',
  HOME_GOALS_OWN = 'Home (Own Goals)',
  AWAY_GOALS_OWN = 'Away (Own Goals)',
  HOME_GOALS_PENALTY = 'Home (Penalty Goals)',
  AWAY_GOALS_PENALTY = 'Away (Penalty Goals)',
  HOME_PENALTY_MISSES = 'Home (_Penalty_Misses)',
  AWAY_PENALTY_MISSES = 'Away (_Penalty_Misses)',
  HOME_GOALS_PENALTY_SHOOTOUT = 'Home (_Penalty_Shootout_Goals)',
  AWAY_GOALS_PENALTY_SHOOTOUT = 'Away (_Penalty_Shootout_Goals)',
  HOME_PENALTY_SHOOTOUT_MISSES_LONG = 'Home (_Penalty_Shootout_Misses)',
  AWAY_PENALTY_SHOOTOUT_MISSES_LONG = 'Away (_Penalty_Shootout_Misses)',
  HOME_YELLOW_LONG = 'Home (_Yellow_Cards)',
  AWAY_YELLOW_LONG = 'Away (_Yellow_Cards)',
  HOME_CARDS_YELLOW_RED = 'Home (Yellow Red Cards)',
  AWAY_CARDS_YELLOW_RED = 'Away (Yellow Red Cards)',
  HOME_CARDS_RED = 'Home (Red Cards)',
  AWAY_CARDS_RED = 'Away (Red Cards)',
  HOME_SUBSTITUTES = 'Home (_Substitutes)',
  AWAY_SUBSTITUTES = 'Away (_Substitutes)',
  NOTES = 'Notes',
  // TODO: Check if this refactoring causes any issues
  SCORE_RE1 = 'Score (1.1)',
  SCORE_RE2 = 'Score (1.2)',
  SCORE_ET1 = 'Score (2.1)',
  SCORE_ET2 = 'Score (2.2)',
}

enum EGoalType {
  OG = 'Own Goal',
  P = 'Penalty Goal',
}

enum EWeekday {
  SUNDAY,
  MONDAY,
  TUESDAY,
  WEDNESDAY,
  THURSDAY,
  FRIDAY,
  SATURDAY,
}

enum EMonthDays {
  MAY = 31,
  JUNE = 30,
  JULY = 31,
  AUGUST = 31,
  SEPTEMBER = 30,
  OCTOBER = 31,
  NOVEMBER = 30,
  DECEMBER = 31,
}

enum ERound {
  GROUP_STAGE = 'Group stage',
  GROUP_STAGE_PLAYOFF = 'Group stage play-off',
  FIRST_GROUP_STAGE = 'First group stage',
  SECOND_GROUP_STAGE = 'Second group stage',
  FIRST_ROUND = 'First round',
  SECOND_ROUND = 'Second round',
  ROUND_OF_16 = 'Round of 16',
  QUARTER_FINALS = 'Quarter-finals',
  SEMI_FINALS = 'Semi-finals',
  THIRD_PLACE_MATCH = 'Third-place match',
  FINAL_STAGE = 'Final stage',
  FINAL = 'Final',
}

enum EStageMode {
  GROUP,
  KNOCKOUT,
}

enum EUnitOfTime {
  YEAR = 'year',
  Years = 'years',
  Y = 'y',
  MONTH = 'month',
  MONTHS = 'months',
  M = 'M',
  WEEK = 'week',
  WEEKS = 'weeks',
  W = 'w',
  DAY = 'day',
  DAYS = 'days',
}

enum ERegExpFlags {
  GLOBAL = 'g',
  CASE_INSENSITIVE = 'i',
  MULTILINE = 'm',
  DOT_ALL = 's',
  UNICODE = 'u',
  STICKY = 'y',
}

enum EMatchLongInfo {
  REPLAY = 'Replay',
}

export {
  EConsoleStyles,
  ESymbol,
  EMatchColumns,
  EMatchColumnsLong,
  EGoalType,
  EWeekday,
  EMonthDays,
  ERound,
  EStageMode,
  EUnitOfTime,
  ERegExpFlags,
  EMatchLongInfo,
};
