import { NA } from '../constants';
import { GoalType } from '../enums';

export class Match {
  static REG_EXP_HOME_AND_AWAY_GOALS =
    /([^|·\(\)]+)(?:\s\((OG|P)\))?\s·\s([\d\+]+)/g;

  static goalsOf(
    data: any[],
    year: number,
    index: number,
    column: string
  ): any[] | undefined {
    const expr = data[year][index][column];
    if (!expr) return undefined;

    const iterator = expr.matchAll(this.REG_EXP_HOME_AND_AWAY_GOALS);
    const arrGoals: any[] = [];

    for (const match of iterator) {
      const minute = match[3] ?? NA;
      const scorer = match[1] ?? NA;
      const type = match[2] ?? NA;
      arrGoals.push({ minute, scorer, type: Match.typeOf(type) });
    }

    return arrGoals;
  }

  static typeOf(type: string): string {
    return GoalType[type as keyof typeof GoalType];
  }
}
