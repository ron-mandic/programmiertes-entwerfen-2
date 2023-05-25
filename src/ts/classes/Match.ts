export class Match {
  static REG_EXP_HOME_AND_AWAY_GOALS =
    /([^|·\(\)]+)(?:\((OG|P)\))?\s·\s([\d\+]+)/g;
  static REG_EXP_HOME_AND_AWAY_GOALS_LONG =
    /\'(\d+)\’\|(\d+\:\d+)\|([^|\,]+)(?:\|Assist:\|([^|\,]+))?\'/g;

  static extractGoals() {}
}
