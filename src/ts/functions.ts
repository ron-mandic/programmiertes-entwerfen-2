import { TGoal, TMatch, TMatchLong, TScoreTypes } from './types.ts';
import { Type } from './classes/Type.ts';
import {DATE_RANGE_IN_DAYS, ET1_LIMIT, ET2_LIMIT, RE1_LIMIT, RE2_LIMIT} from './constants.ts';
import { Match } from './classes/Match.ts';
import { EMatchColumnsLong, ERound } from './enums.ts';
import $ from 'jquery';
import { Chart } from './classes/Chart.ts';

/**
 * `funcSortAscTGoal` sorts an array of goals ascending by minute in alphabetical order
 * @param a - The first goal
 * @param b - The second goal
 */
function funcSortTGoalAsc(a: TGoal, b: TGoal) {
  if (!Type.isNumber(a.minute) && a.minute < b.minute) return -1;
  if (!Type.isNumber(a.minute) && a.minute === b.minute) return 0;
  if (!Type.isNumber(a.minute) && a.minute > b.minute) return 1;

  if (!Type.isNumber(b.minute) && a.minute < b.minute) return -1;
  if (!Type.isNumber(b.minute) && a.minute === b.minute) return 0;
  if (!Type.isNumber(b.minute) && a.minute > b.minute) return 1;

  return +a.minute - +b.minute;
}

function funcFilterScoreOfRE1({ minute }: TGoal) {
  return +minute <= +RE1_LIMIT || Match.REG_RE1.test(minute);
}
function funcFilterScoreOfRE2({ minute }: TGoal) {
  return +minute <= +RE2_LIMIT || Match.REG_RE2.test(minute);
}
function funcFilterScoreOfET1({ minute }: TGoal) {
  return +minute <= +ET1_LIMIT || Match.REG_ET1.test(minute);
}
function funcFilterScoreOfET2({ minute }: TGoal) {
  return +minute <= +ET2_LIMIT || Match.REG_ET2.test(minute);
}

function funcFilterByGroupStages(match: TMatch | TMatchLong) {
  switch (match[EMatchColumnsLong.ROUND]) {
    case ERound.GROUP_STAGE:
    case ERound.GROUP_STAGE_PLAYOFF:
    case ERound.FIRST_GROUP_STAGE:
    case ERound.SECOND_GROUP_STAGE:
    case ERound.FIRST_ROUND:
    case ERound.SECOND_ROUND:
      return match;
  }
}
const funcFilterByRoundOf16 = (match: TMatch | TMatchLong) =>
    match[EMatchColumnsLong.ROUND] === ERound.ROUND_OF_16,
  funcFilterByQuarterFinals = (match: TMatch | TMatchLong) =>
    match[EMatchColumnsLong.ROUND] === ERound.QUARTER_FINALS,
  funcFilterBySemiFinals = (match: TMatch | TMatchLong) =>
    match[EMatchColumnsLong.ROUND] === ERound.SEMI_FINALS,
  funcFilterByThirdPlace = (match: TMatch | TMatchLong) =>
    match[EMatchColumnsLong.ROUND] === ERound.THIRD_PLACE_MATCH,
  funcFilterByFinalStage = (match: TMatch | TMatchLong) =>
    match[EMatchColumnsLong.ROUND] === ERound.FINAL_STAGE,
  funcFilterByFinal = (match: TMatch | TMatchLong) =>
    match[EMatchColumnsLong.ROUND] === ERound.FINAL;

function funcGetScoreTypes(
  arrGoalsByHome: TGoal[],
  arrGoalsByAway: TGoal[]
): TScoreTypes {
  return {
    scoreHomeRE1: arrGoalsByHome.filter(funcFilterScoreOfRE1).length,
    scoreAwayRE1: arrGoalsByAway.filter(funcFilterScoreOfRE1).length,
    scoreHomeRE2: arrGoalsByHome.filter(funcFilterScoreOfRE2).length,
    scoreAwayRE2: arrGoalsByAway.filter(funcFilterScoreOfRE2).length,
    scoreHomeET1: arrGoalsByHome.filter(funcFilterScoreOfET1).length,
    scoreAwayET1: arrGoalsByAway.filter(funcFilterScoreOfET1).length,
    scoreHomeET2: arrGoalsByHome.filter(funcFilterScoreOfET2).length,
    scoreAwayET2: arrGoalsByAway.filter(funcFilterScoreOfET2).length,
  };
}

function funcAddTo(
  obj: { [key: string | number]: unknown },
  key: string | number,
  value: unknown
) {
  obj[key] = value;
  return obj;
}

function funcAddToIf(
  obj: { [key: string | number]: unknown },
  key: string | number,
  value: unknown,
  condition: boolean = true
) {
  if (condition) obj[key] = value;
  return obj;
}

/**
 * @param e - The event to be bound to
 */
function funcResizeAppWidth(
  e: JQuery.TriggeredEvent<HTMLElement, undefined, HTMLElement, HTMLElement>
) {
  e.preventDefault();
  // @ts-ignore
  let deltaX = e.originalEvent.wheelDeltaX, deltaY = e.originalEvent.wheelDeltaY;
  let offset = 480;
  let app = $('#app');
  let appInnerWidth = app.innerWidth()!;

  if (deltaX) return;

  if (deltaY > 0) {
    if (appInnerWidth < 1920 * 4) {
      app.css('width', `+=${offset}px`);
    }
  } else {
    if (appInnerWidth > 1920) {
      app.css('width', `-=${offset}px`);
    }
    if (appInnerWidth < 1920) {
      app.css('width', `1920px`);
    }
  }
}

function funcResizeWMMatchWidth() {
  Chart.matchDotSizes = $('#app').innerWidth()! / DATE_RANGE_IN_DAYS;

  for (let match of Array.from($('.wm_match'))) {
    $(match).css({
      width: `${Chart.matchDotSizes! * 0.75}px`,
      height: `${Chart.matchDotSizes! * 0.75}px`,
    });
  }

  for (let match of Array.from($('.wm_match__empty'))) {
    $(match).css({
      width: `${Chart.matchDotSizes! * 0.75}px`,
    });
  }
}

export {
  funcSortTGoalAsc,
  funcFilterScoreOfRE1,
  funcFilterScoreOfRE2,
  funcFilterScoreOfET1,
  funcFilterScoreOfET2,
  funcFilterByGroupStages,
  funcFilterByRoundOf16,
  funcFilterByQuarterFinals,
  funcFilterBySemiFinals,
  funcFilterByThirdPlace,
  funcFilterByFinalStage,
  funcFilterByFinal,
  funcGetScoreTypes,
  funcAddTo,
  funcAddToIf,
  funcResizeAppWidth,
  funcResizeWMMatchWidth,
};
