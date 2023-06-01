import { TGoal } from './types.ts';
import { Type } from './classes/Type.ts';

/**
 * `funcSortAscTGoal` sorts an array of goals ascending by minute in alphabetical order
 * @param a - The first goal
 * @param b - The second goal
 */
function funcSortAscTGoal(a: TGoal, b: TGoal) {
  if (!Type.isNumber(a.minute) && a.minute < b.minute) return -1;
  if (!Type.isNumber(a.minute) && a.minute === b.minute) return 0;
  if (!Type.isNumber(a.minute) && a.minute > b.minute) return 1;

  if (!Type.isNumber(b.minute) && a.minute < b.minute) return -1;
  if (!Type.isNumber(b.minute) && a.minute === b.minute) return 0;
  if (!Type.isNumber(b.minute) && a.minute > b.minute) return 1;

  return +a.minute - +b.minute;
}

export { funcSortAscTGoal };
