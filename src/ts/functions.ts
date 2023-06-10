import { TGoal, TMatch, TMatchLong, TScoreTypes } from './types.ts';
import { Type } from './classes/Type.ts';
import {
  DATE_RANGE_IN_DAYS,
  ET1_LIMIT,
  ET2_LIMIT,
  RE1_LIMIT,
  RE2_LIMIT,
} from './constants.ts';
import { Match } from './classes/Match.ts';
import { EMatchColumnsLong, ERound } from './enums.ts';
import $ from 'jquery';
import { Chart } from './classes/Chart.ts';
import { IDictGridStatistics, IObjStageGroupResult } from './interfaces.ts';

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

// TODO: Check if this causes any corruptions in data
function funcFilterScoreOfRE1({ minute }: TGoal) {
  return (
    (+minute <= +RE1_LIMIT && !Match.REG_RE1_EXTRA_TIME.test(minute)) ||
    Match.REG_RE1_EXTRA_TIME.test(minute)
  );
}
// TODO: Check if this causes any corruptions in data
function funcFilterScoreOfRE2({ minute }: TGoal) {
  return (
    (+minute <= +RE2_LIMIT &&
      !Match.REG_RE1_EXTRA_TIME.test(minute) &&
      !Match.REG_RE2_EXTRA_TIME.test(minute)) ||
    Match.REG_RE1_EXTRA_TIME.test(minute) ||
    Match.REG_RE2_EXTRA_TIME.test(minute)
  );
}
// TODO: Check if this causes any corruptions in data
function funcFilterScoreOfET1({ minute }: TGoal) {
  return (
    (+minute <= +ET1_LIMIT &&
      !Match.REG_RE1_EXTRA_TIME.test(minute) &&
      !Match.REG_RE2_EXTRA_TIME.test(minute) &&
      !Match.REG_ET1_EXTRA_TIME.test(minute)) ||
    Match.REG_RE1_EXTRA_TIME.test(minute) ||
    Match.REG_RE2_EXTRA_TIME.test(minute) ||
    Match.REG_ET1_EXTRA_TIME.test(minute)
  );
}
// TODO: Check if this causes any corruptions in data
function funcFilterScoreOfET2({ minute }: TGoal) {
  return (
    (+minute <= +ET2_LIMIT &&
      !Match.REG_RE1_EXTRA_TIME.test(minute) &&
      !Match.REG_RE2_EXTRA_TIME.test(minute) &&
      !Match.REG_ET1_EXTRA_TIME.test(minute) &&
      !Match.REG_ET2_EXTRA_TIME.test(minute)) ||
    Match.REG_RE1_EXTRA_TIME.test(minute) ||
    Match.REG_RE2_EXTRA_TIME.test(minute) ||
    Match.REG_ET1_EXTRA_TIME.test(minute) ||
    Match.REG_ET2_EXTRA_TIME.test(minute)
  );
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
  let deltaX = e.originalEvent?.wheelDeltaX,
    // @ts-ignore
    deltaY = e.originalEvent?.wheelDeltaY;
  let app = $('#app');
  let appInnerWidth = app.innerWidth()!;

  if (Type.isUndefined(deltaX) || Type.isUndefined(deltaY)) return;
  if (deltaX) return;

  if (deltaY > 0) {
    if (appInnerWidth < Chart.CHART_WIDTH * 4) {
      app.css('width', `+=${Chart.CHART_WIDTH_OFFSET}px`);
    }
  } else {
    if (appInnerWidth > Chart.CHART_WIDTH) {
      app.css('width', `-=${Chart.CHART_WIDTH_OFFSET}px`);
    } else if (appInnerWidth < Chart.CHART_WIDTH) {
      app.css('width', `${Chart.CHART_WIDTH}px`);
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

function funcGetAllWorldCupStagesOf(year: number): IObjStageGroupResult {
  switch (year) {
    case 1930:
      return {
        arrStagesGroup: [ERound.GROUP_STAGE],
        arrStagesKnockout: [ERound.SEMI_FINALS, ERound.FINAL],
      };
    case 1934:
    case 1938:
      return {
        arrStagesKnockout: [
          ERound.ROUND_OF_16,
          ERound.QUARTER_FINALS,
          ERound.SEMI_FINALS,
          ERound.THIRD_PLACE_MATCH,
          ERound.FINAL,
        ],
      };
    case 1950:
      return {
        arrStagesGroup: [ERound.GROUP_STAGE, ERound.FINAL_STAGE],
      };
    case 1954:
    case 1958:
      return {
        arrStagesGroup: [ERound.GROUP_STAGE, ERound.GROUP_STAGE_PLAYOFF],
        arrStagesKnockout: [
          ERound.QUARTER_FINALS,
          ERound.SEMI_FINALS,
          ERound.THIRD_PLACE_MATCH,
          ERound.FINAL,
        ],
      };
    case 1962:
    case 1966:
    case 1970:
      return {
        arrStagesGroup: [ERound.GROUP_STAGE],
        arrStagesKnockout: [
          ERound.QUARTER_FINALS,
          ERound.SEMI_FINALS,
          ERound.THIRD_PLACE_MATCH,
          ERound.FINAL,
        ],
      };
    case 1974:
    case 1978:
      return {
        arrStagesGroup: [ERound.FIRST_ROUND, ERound.SECOND_ROUND],
        arrStagesKnockout: [ERound.THIRD_PLACE_MATCH, ERound.FINAL],
      };
    case 1982:
      return {
        arrStagesGroup: [ERound.FIRST_GROUP_STAGE, ERound.SECOND_GROUP_STAGE],
        arrStagesKnockout: [
          ERound.SEMI_FINALS,
          ERound.THIRD_PLACE_MATCH,
          ERound.FINAL,
        ],
      };
    case 1986:
    case 1990:
    case 1994:
    case 1998:
    case 2002:
    case 2006:
    case 2010:
    case 2014:
    case 2018:
    case 2022:
      return {
        arrStagesGroup: [ERound.GROUP_STAGE],
        arrStagesKnockout: [
          ERound.ROUND_OF_16,
          ERound.QUARTER_FINALS,
          ERound.SEMI_FINALS,
          ERound.THIRD_PLACE_MATCH,
          ERound.FINAL,
        ],
      };
    default:
      return {};
  }
}

function funcGenGridStageGroup(): IDictGridStatistics {
  return {
    home: 0,
    draw: 0,
    away: 0,
  };
}

function funcGenGridStageKnockout(): IDictGridStatistics {
  return {
    home: 0,
    away: 0,
    et: 0,
    p: 0,
  };
}

export {
  funcSortTGoalAsc,
  funcFilterScoreOfRE1,
  funcFilterScoreOfRE2,
  funcFilterScoreOfET1,
  funcFilterScoreOfET2,
  funcFilterByGroupStages,
  funcGetScoreTypes,
  funcAddTo,
  funcAddToIf,
  funcResizeAppWidth,
  funcResizeWMMatchWidth,
  funcGetAllWorldCupStagesOf,
  funcGenGridStageGroup,
  funcGenGridStageKnockout,
};
