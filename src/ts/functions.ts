import { TGoal, TMatch, TMatchLong, TScoreTypes } from './types.ts';
import { Type } from './classes/Type.ts';
import {
  CHART_WIDTH_MAX,
  CHART_WIDTH_MIN,
  DATE_RANGE_IN_DAYS,
  ET1_LIMIT,
  ET2_LIMIT,
  RE1_LIMIT,
  RE2_LIMIT,
  WorldCupYearsIndices,
} from './constants.ts';
import { Match } from './classes/Match.ts';
import { EMatchColumnsLong, ERound, EStageMode } from './enums.ts';
import $ from 'jquery';
import { Chart } from './classes/Chart.ts';
import {
  IDict,
  IDictGridStatistics,
  IObjStageGroupResult,
} from './interfaces.ts';
import Chroma from 'chroma-js';
import Moment from 'moment/moment';

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
  let target = e.target as HTMLElement;
  if (
    funcIsAnyOfThoseClasses(target, [
      'wm_modal',
      'wm_modal_title',
      'content',
      'wm_model_match',
    ])
  ) {
    e.preventDefault(); // Prevents overflow in the minified window of the app
    return; // Prevents the main view from scrolling over the modal
  }

  // console.log(target);
  e.preventDefault();

  // @ts-ignore
  let deltaX = e.originalEvent?.wheelDeltaX,
    // @ts-ignore
    deltaY = e.originalEvent?.wheelDeltaY;
  let app = $('#app');
  let appInnerWidth = app.innerWidth()!;

  if (deltaX) {
    e.preventDefault();
    return;
  }

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

function funcComposeGridStageGroup(
  wrapper: JQuery,
  dict: IDict,
  funcGetColor: Chroma.Scale<Chroma.Color>,
  absAmount: number
) {
  if (Type.isUndefined(dict)) {
    funcComposePlaceholder(wrapper);
    return;
  }

  let arrHalftimeScores = Object.keys(dict).sort();
  let length = arrHalftimeScores.length;

  let grid = funcCreateGrid(false);
  let n = 0;

  for (let i = 0; i < length * 4; i++) {
    let gridTile;

    if (i % 4 === 0) {
      gridTile = funcCreateGridTile(arrHalftimeScores[n]);
      n++;
    } else {
      gridTile = funcCreateGridTile();
    }

    if (!i) gridTile.attr('data-col-label', 'H');
    if (i === 1) gridTile.attr('data-col-label', 'D');
    if (i === 2) gridTile.attr('data-col-label', 'A');

    if (i % 4 === 0) {
      gridTile.attr('data-row', arrHalftimeScores[n - 1]);
      gridTile.attr('data-prop', 'home');
    }
    if (i % 4 === 1) {
      gridTile.attr('data-row', arrHalftimeScores[n - 1]);
      gridTile.attr('data-prop', 'draw');
    }
    if (i % 4 === 2) {
      gridTile.attr('data-row', arrHalftimeScores[n - 1]);
      gridTile.attr('data-prop', 'away');
    }
    // The fourth row does not exist here
    /* if (i % 4 === 3) {
      // ...
    } */

    grid.append(gridTile);
  }

  funcPaintGrid(grid, dict, funcGetColor, EStageMode.GROUP, absAmount);

  wrapper.append(grid);
}

function funcComposeGridStageKnockout(
  wrapper: JQuery,
  dict: IDict,
  funcGetColor: Chroma.Scale<Chroma.Color>,
  absAmount: number
) {
  if (Type.isUndefined(dict)) {
    funcComposePlaceholder(wrapper);
    return;
  }

  let arrHalftimeScores = Object.keys(dict).sort();
  let length = arrHalftimeScores.length;

  let grid = funcCreateGrid(true);
  let n = 0;

  for (let i = 0; i < length * 4; i++) {
    let gridTile;

    if (i % 4 === 0) {
      gridTile = funcCreateGridTile(arrHalftimeScores[n]);
      n++;
    } else {
      gridTile = funcCreateGridTile();
    }

    if (!i) gridTile.attr('data-col-label', 'H');
    if (i === 1) gridTile.attr('data-col-label', 'A');
    if (i === 2) gridTile.attr('data-col-label', 'ET');
    if (i === 3) gridTile.attr('data-col-label', 'P');

    if (i % 4 === 0) {
      gridTile.attr('data-row', arrHalftimeScores[n - 1]);
      gridTile.attr('data-prop', 'home');
    }
    if (i % 4 === 1) {
      gridTile.attr('data-row', arrHalftimeScores[n - 1]);
      gridTile.attr('data-prop', 'away');
    }
    if (i % 4 === 2) {
      gridTile.attr('data-row', arrHalftimeScores[n - 1]);
      gridTile.attr('data-prop', 'et');
    }
    if (i % 4 === 3) {
      gridTile.attr('data-row', arrHalftimeScores[n - 1]);
      gridTile.attr('data-prop', 'p');
    }

    grid.append(gridTile);
  }

  funcPaintGrid(grid, dict, funcGetColor, EStageMode.KNOCKOUT, absAmount);

  wrapper.append(grid);
}

function funcComposePlaceholder(wrapper: JQuery) {
  wrapper.removeClass('wrapper-m').addClass('wrapper-s');
}

function funcCreateGrid(withFourthColumn: boolean) {
  return !withFourthColumn
    ? $('<div class="grid col-4 is-grid no-col-4"></div>')
    : $('<div class="grid col-4 is-grid"></div>');
}

function funcCreateGridTile(rowLabel?: string, colLabel?: string) {
  const gridTile = $("<div class='grid_tile col-4 is-parent'></div>");
  if (rowLabel) gridTile.attr('data-row-label', rowLabel);
  if (colLabel) gridTile.attr('data-col-label', colLabel);
  return gridTile;
}

function funcGetScrollAmountBy(index: number): number {
  switch (index) {
    case 1:
      return 0;
    case 2:
      return 78;
    case 3:
      return 151;
    case 4:
      return 229;
    case 5:
      return 303;
    case 6:
      return 381;
    case 7:
      return 450;
    case 8:
      return 532;
    case 9:
      return 610;
    case 10:
      return 684;
    case 11:
      return 765;
    case 12:
      return 835;
    case 13:
      return 913;
    case 14:
      return 987;
    case 15:
      return 1065;
    case 16:
      return 1143;
    case 17:
      return 1221;
    case 18:
      return 1306;
    case 19:
      return 1384;
    case 20:
      return 1462;
    case 21:
      return 1532;
    case 22:
      return 1612;
    default: {
      throw new Error(
        'funcGetScrollAmountBy: index does not appear in the mapping.'
      );
    }
  }
}

function funcGetFuncFromGradient(
  start: string,
  end: string,
  rangeStart: number = 0,
  rangeEnd: number = 100,
  toFlip: boolean = false
): Chroma.Scale<Chroma.Color> {
  return !toFlip
    ? Chroma.scale([start, end]).domain([rangeStart, rangeEnd])
    : Chroma.scale([end, start]).domain([rangeStart, rangeEnd]);
}

function funcPaintGrid(
  grid: JQuery,
  dictScores: IDict,
  funcGetColor: Chroma.Scale<Chroma.Color>,
  stageMode: EStageMode,
  absAmount: number
) {
  // The caller function should make sure that the dict is not undefined.
  // So the years 1934 and 1938 are not included here.

  // The children now include both the key for the score and the property to access
  const gridTiles = grid.children();

  if (stageMode === EStageMode.GROUP) {
    for (let gridTile of gridTiles) {
      const _gridTile = $(gridTile);
      const dataRow = _gridTile.attr('data-row'),
        dataProp = _gridTile.attr('data-prop');

      // Skip grid tiles from the fourth row
      if (Type.isUndefined(dataRow) || Type.isUndefined(dataProp)) continue;

      const dataScore = dictScores[dataRow!][dataProp!];
      const hexColor = funcGetColor(dataScore / absAmount).hex();

      if (!dataScore) {
        _gridTile.css('background-color', '#f5f5f5');
      } else {
        _gridTile.css('background-color', hexColor);
      }

      _gridTile.attr('data-score', dataScore);

      if (dataScore) {
        _gridTile.append(
          `<span class="valid" data-score="${dataScore}">${Math.round(
            (dataScore / absAmount) * 100
          )}%</span>`
        );
      } else {
        _gridTile.append(
          `<span class="invalid">${Math.round(
            (dataScore / absAmount) * 100
          )}%</span>`
        );
      }
    }
    return;
  }

  if (stageMode === EStageMode.KNOCKOUT) {
    for (let gridTile of gridTiles) {
      const _gridTile = $(gridTile);
      const dataRow = _gridTile.attr('data-row'),
        dataProp = _gridTile.attr('data-prop');

      const dataScore = dictScores[dataRow!][dataProp!];
      const hexColor = funcGetColor(dataScore / absAmount).hex();

      if (!dataScore) {
        _gridTile.css('background-color', '#f5f5f5');
      } else {
        _gridTile.css('background-color', hexColor);
      }

      _gridTile.attr('data-score', dataScore);

      if (dataScore) {
        let span = $(
          `<span class="valid" data-score="${dataScore}">${Math.round(
            (dataScore / absAmount) * 100
          )}%</span>`
        );

        let text;
        if (dataProp === 'et') {
          text = `${dataScore}`;
          span.addClass('et');
        } else if (dataProp === 'p') {
          text = `${dataScore}`;
          span.addClass('p');
        } else {
          text = `${Math.round((dataScore / absAmount) * 100)}%`;
        }

        span.text(text);

        _gridTile.append(span);
      } else {
        let span = $(`<span class="invalid"></span>`);

        let text;
        if (dataProp === 'et') {
          text = `${dataScore}`;
          span.addClass('et');
        } else if (dataProp === 'p') {
          text = `${dataScore}`;
          span.addClass('p');
        } else {
          text = `${Math.round((dataScore / absAmount) * 100)}%`;
        }

        span.text(text);
        _gridTile.append(span);
      }
    }
    return;
  }
}

function funcSimulateMouseClick(chart: Chart, year: number) {
  if (Chart.CHART_WIDTH === CHART_WIDTH_MAX) {
    // Only visual indicator
    if (!chart.objAsideState.previous)
      $(`.wm[data-year='${year}']`).addClass('on');
    if (chart.objAsideState.current!.attr('data-year') !== `${year}`) {
      // Only visual indicator
      // 1a)
      $(`.wm.on`).removeClass('on');
      // 1b)
      $(`.wm[data-year='${year}']`).addClass('on');
    }

    if (chart.objAsideState.current!.attr('data-year') !== `${year}`) {
      chart.objAsideState.previous = chart.objAsideState.current;
      chart.objAsideState.current = $(`.aside[data-year="${year}"]`);
    }
    chart.setYear(year);
    chart.setWM(chart.objData[+year]);

    // console.log('Helllllllllooooooo', `currentYear = ${chart.currentYear}`);
    return;
  }

  // ##############################
  // Only visual indicator
  if (!chart.objAsideState.previous) {
    $(`.wm[data-year='${year}']`).addClass('on');
  }
  if (chart.objAsideState.current!.attr('data-year') !== `${year}`) {
    // Only visual indicator
    // 1a)
    $(`.wm.on`).removeClass('on');
    // 1b)
    $(`.wm[data-year='${year}']`).addClass('on');
  }

  if (chart.objAsideState.current!.attr('data-year') !== `${year}`) {
    chart.objAsideState.previous = chart.objAsideState.current;
    chart.objAsideState.current = $(`.aside[data-year="${year}"]`);
  }
  chart.setYear(year);
  chart.setWM(chart.objData[+year]);

  // ##############################

  const index = funcGetYearFrom(year);
  // a) Simulate mouse click
  $(`.year[data-i="${index}"] > label`).click();
  // b) Change title
  $('main').attr('data-title-after', `${year}`);
  // c) Trigger footer area
  $('.years')[0].scrollTo({
    left: funcGetScrollAmountBy(index) - 10,
    top: 0,
    behavior: 'smooth',
  });
  // d) Trigger the slider
  $('.asides').css('translate', `-${((index - 1) / 22) * 100}%`);
}

function funcGetYearFrom(index: number) {
  return WorldCupYearsIndices[index as keyof typeof WorldCupYearsIndices];
}

function funcMakeDraggable(element: HTMLElement, parent: HTMLElement) {
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  if (document.getElementById(element.id + 'header')) {
    // if present, the header is where you move the DIV from:
    document.getElementById(element.id + 'header')!.onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    element.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e: DragEvent) {
    const { width: widthMax, height: heightMax } =
      parent.getBoundingClientRect();
    const { width: widthElement, height: heightElement } =
      element.getBoundingClientRect();

    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:

    let absTop = element.offsetTop - pos2;
    let absLeft = element.offsetLeft - pos1;

    if (absLeft >= 0 && absLeft <= widthMax - widthElement) {
      element.style.left = absLeft + 'px';
    }
    // Upon switching to the narrower chart width
    /* if (Chart.CHART_WIDTH === CHART_WIDTH_MIN && absLeft > CHART_WIDTH_MAX) {
      element.style.left = CHART_WIDTH_MIN - widthElement + 'px';
    } */
    if (absTop >= 0 && absTop <= heightMax - heightElement) {
      element.style.top = absTop + 'px';
    }

    // element.style.left = element.offsetLeft - pos1 + 'px';
    // element.style.top = element.offsetTop - pos2 + 'px';
    $(element).css('cursor', 'grab');
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
    $(element).css('cursor', 'auto');
  }
}

function funcPopulateModal(
  chart: Chart,
  wmModal: JQuery,
  wmMatchDot: JQuery,
  event: JQuery.ClickEvent<HTMLElement>
) {
  const wmModalContent = wmModal.find('.content')!;
  const wmModalTitle = wmModal.find('h2')!;

  // If clicked somewhere else, the modal should reset itself
  /* if (
    !event.target.classList.contains('wm_match') &&
    !funcIsAnyOfThoseClasses(event.target, [
      'wm_modal',
      'wm_modal_title',
      'content',
      'wm_model_match',
    ])
  ) {
    chart.currentlySelectedMatch?.blur();
    wmModalTitle.removeClass('on');
    wmModalContent.empty();
    return;
  } */

  const date = wmMatchDot.attr('data-date')!;
  const arrWMMatches = wmMatchDot.data().dataMatches as TMatchLong[];

  // if (chart.currentlySelectedMatch?.is(wmMatchDot)) return;

  wmModalContent.empty();
  wmModalTitle.addClass('on');
  wmModalTitle.attr('data-date', Moment(date).format('dddd, MMMM Do'));
  wmModalTitle.attr('data-matches', arrWMMatches.length);

  for (let i = 0; i < arrWMMatches.length; i++) {
    const wmModalEntry = $('<div class="wm_modal_match is-flex c-c"></div>');
    wmModalEntry.text(arrWMMatches[i][EMatchColumnsLong.SCORE_LONG]);
    wmModalContent.append(wmModalEntry);
  }
}

function funcIsAnyOfThoseClasses(target: HTMLElement, classes: string[]) {
  return classes.some((c) => target.classList.contains(c));
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
  funcComposeGridStageGroup,
  funcComposeGridStageKnockout,
  funcComposePlaceholder,
  funcCreateGrid,
  funcCreateGridTile,
  funcGetScrollAmountBy,
  funcGetFuncFromGradient,
  funcSimulateMouseClick,
  funcGetYearFrom,
  funcMakeDraggable,
  funcPopulateModal,
  funcIsAnyOfThoseClasses,
};
