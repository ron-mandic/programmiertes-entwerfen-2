import { TGoal, TMatch, TMatchLong, TScoreTypes } from './types.ts';
import { Type } from './classes/Type.ts';
import {
  CHART_WIDTH_MAX,
  DATE_RANGE_IN_DAYS,
  ET1_LIMIT,
  ET2_LIMIT,
  NA,
  RE1_LIMIT,
  RE2_LIMIT,
  WorldCupYearsIndices,
} from './constants.ts';
import { Match } from './classes/Match.ts';
import { EMatchColumnsLong, ERound, EStageMode, ESymbol } from './enums.ts';
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
    return false; // Prevents the main view from scrolling over the modal
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

// @ts-ignore
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

  let boxShadow = 'box-shadow',
    boxShadowValueOn = '4px 4px 10px 0 rgba(0, 0, 0, 0.375)',
    boxShadowValueOff = 'none';

  function dragMouseDown(e: any) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    // @ts-ignore
    document.onmousemove = elementDrag;
  }

  function elementDrag(e: DragEvent) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:

    element.style.left = element.offsetLeft - pos1 + 'px';
    element.style.top = element.offsetTop - pos2 + 'px';
    $(element).css('cursor', 'grab');
    if ($(element).css(boxShadow) !== boxShadowValueOn)
      $(element).css(boxShadow, boxShadowValueOn);
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
    $(element).css('cursor', 'auto');
    $(element).css(boxShadow, boxShadowValueOff);
  }
}

function funcPopulateModal(
  // @ts-ignore
  chart: Chart,
  wmModal: JQuery,
  wmMatchDot: JQuery,
  // @ts-ignore
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

  let host = arrWMMatches[0][EMatchColumnsLong.HOST];
  if (host.startsWith('Korea Republic')) host = 'Korea, Japan';
  else if (host.startsWith('United States')) host = 'USA';

  wmModalContent.empty();
  wmModalTitle.addClass('on');
  wmModalTitle.attr(
    'data-date',
    `${host} • ${Moment(date).format('dddd, MMMM Do YYYY')}`
  );
  wmModalTitle.attr('data-matches', arrWMMatches.length);

  for (let i = 0; i < arrWMMatches.length; i++) {
    const wmModalEntry = funcCreateModalEntry(arrWMMatches[i]);
    wmModalContent.append(wmModalEntry);
  }
}

function funcCreateModalEntry(element: TMatchLong): JQuery {
  const el = $('<div class="wm_modal_match is-flex c-c is-parent"></div>');
  const col1 = $('<div class="col-1 is-flex"></div>');
  const col2 = $('<div class="col-2 is-flex"></div>');

  // col-1
  const home = element[EMatchColumnsLong.HOME];
  const away = element[EMatchColumnsLong.AWAY];
  const round = element[EMatchColumnsLong.ROUND];
  const teamHome = $('<p class="team-home"></p>')
    .attr('data-label', '(H)')
    .text(home);
  const teamAway = $('<p class="team-away"></p>')
    .attr('data-label', '(A)')
    .text(away);
  const teams = $('<div class="teams"></div>');
  teams.append(teamHome, teamAway);
  const stage = $('<p class="stage"></p>').text(round);
  col1.append(teams, stage);

  // col-2
  const scoreResultString = funcDetermineResultString(element);
  const attendance = funcFormat(
    +element[EMatchColumnsLong.ATTENDANCE],
    ESymbol.COMMA
  );
  const score = $('<p class="score"></p>').text(scoreResultString);
  const attendanceEl = $('<p class="attendance"></p>').text(attendance);
  col2.append(score, attendanceEl);

  // End
  el.append(col1, col2);
  return el;
}

function funcDetermineResultString(element: TMatchLong): string {
  const LABEL_ET = 'a.e.t',
    LABEL_P = 'p.s';

  const score = element[EMatchColumnsLong.SCORE_ET2];
  const scoreChronology = [
    element[EMatchColumnsLong.SCORE_ET1],
    element[EMatchColumnsLong.SCORE_RE2],
    element[EMatchColumnsLong.SCORE_RE1],
  ];

  const scoreRE1 = element[EMatchColumnsLong.SCORE_RE1];
  const scoreRE2 = element[EMatchColumnsLong.SCORE_RE2];
  const scoreET1 = element[EMatchColumnsLong.SCORE_ET1];
  const scoreET2 = element[EMatchColumnsLong.SCORE_ET2];

  let score00 = `0${ESymbol.HYPHEN_LONG}0`;

  const homePenaltyGoals = element[EMatchColumnsLong.SCORE_HOME_PENALTY];
  const awayPenaltyGoals = element[EMatchColumnsLong.SCORE_AWAY_PENALTY];

  // Guard clause #1
  if (
    (!Type.isUndefined(scoreET1) && Type.isUndefined(scoreET2)) ||
    (Type.isUndefined(scoreET1) && !Type.isUndefined(scoreET2))
  ) {
    throw new Error(
      'funcDetermineResultString: Score ET1 and ET2 must be both defined or both undefined'
    );
  }
  // Guard clause #2
  if (
    (!Type.isUndefined(homePenaltyGoals) &&
      Type.isUndefined(awayPenaltyGoals)) ||
    (Type.isUndefined(homePenaltyGoals) && !Type.isUndefined(awayPenaltyGoals))
  ) {
    throw new Error(
      'funcDetermineResultString: Score ET1 and ET2 must be both defined or both undefined'
    );
  }

  // i.e. 1-1 (4-3)
  if (Type.isUndefined(scoreET1) && Type.isUndefined(scoreET2)) {
    return scoreRE2 !== scoreRE1
      ? `${scoreRE2} (${scoreRE1})`
      : scoreRE2 === score00 && scoreRE1 === score00
      ? scoreRE2
      : `${scoreRE2} (${scoreRE1})`;
  }

  // if penalty shootout
  let strPenalty = `${homePenaltyGoals}${ESymbol.HYPHEN_LONG}${awayPenaltyGoals} ${LABEL_P}`;
  let strScore = `${scoreET2} ${LABEL_ET}`;
  let strScoreSuffix = funcEvaluateScore(score, scoreChronology);
  if (
    Type.isUndefined(homePenaltyGoals) &&
    Type.isUndefined(awayPenaltyGoals)
  ) {
    return scoreChronology.every((s) => s === score)
      ? `${strScore}`
      : `${strScore} ${strScoreSuffix}`;
  } else {
    return scoreChronology.every((s) => s === score)
      ? `${strScore}, ${strPenalty}`
      : `${strScore} ${strScoreSuffix}, ${strPenalty}`;
  }
}

function funcEvaluateScore(score: string, scoreChronology: string[]): string {
  if (
    !scoreChronology.every((s) => !Type.isUndefined(s)) &&
    scoreChronology.length !== 3
  )
    return NA;

  let scoreRE2 = scoreChronology[1],
    scoreRE1 = scoreChronology[2];
  return scoreChronology.every((s) => s === score)
    ? score
    : `(${scoreRE2}, ${scoreRE1})`;
}

function funcIsAnyOfThoseClasses(target: HTMLElement, classes: string[]) {
  return classes.some((c) => target.classList.contains(c));
}

function funcFormat(num: number, delimiter: string) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, delimiter);
}

/**
 * @see https://www.w3schools.com/howto/howto_custom_select.asp
 */
function funcActivateSelect() {
  let x, i, j, l, ll, selElmnt, a, b, c;

  x = document.getElementsByClassName('custom-select');
  l = x.length;
  for (i = 0; i < l; i++) {
    selElmnt = x[i].getElementsByTagName('select')[0];
    ll = selElmnt.length;

    a = document.createElement('DIV');
    a.setAttribute('class', 'select-selected');
    a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
    x[i].appendChild(a);

    b = document.createElement('DIV');
    b.setAttribute('class', 'select-items select-hide');
    for (j = 1; j < ll; j++) {
      c = document.createElement('DIV');
      c.innerHTML = selElmnt.options[j].innerHTML;
      c.addEventListener('click', function (e) {
        let y, i, k, s, h, sl, yl;
        // @ts-ignore
        s = this.parentNode.parentNode.getElementsByTagName('select')[0];
        sl = s.length;
        h = this.parentNode?.previousSibling;
        for (i = 0; i < sl; i++) {
          if (s.options[i].innerHTML == this.innerHTML) {
            s.selectedIndex = i;
            // @ts-ignore
            h.innerHTML = this.innerHTML;
            // @ts-ignore
            y = this.parentNode?.getElementsByClassName('same-as-selected');
            yl = y.length;
            for (k = 0; k < yl; k++) {
              y[k].removeAttribute('class');
            }
            this.setAttribute('class', 'same-as-selected');
            break;
          }
        }

        funcFilterWMMatchDots(e.target);

        // @ts-ignore
        h!.click();
      });
      b.appendChild(c);
    }
    x[i].appendChild(b);
    a.addEventListener('click', function (e) {
      /* When the select box is clicked, close any other select boxes,
      and open/close the current select box: */
      e.stopPropagation();
      closeAllSelect(this);
      // @ts-ignore
      this.nextSibling!.classList.toggle('select-hide');
      this.classList.toggle('select-arrow-active');
    });
  }

  function closeAllSelect(elmnt: any) {
    /* A function that will close all select boxes in the document,
    except the current select box: */
    var x,
      y,
      i,
      xl,
      yl,
      arrNo = [];
    x = document.getElementsByClassName('select-items');
    y = document.getElementsByClassName('select-selected');
    xl = x.length;
    yl = y.length;
    for (i = 0; i < yl; i++) {
      if (elmnt == y[i]) {
        arrNo.push(i);
      } else {
        y[i].classList.remove('select-arrow-active');
      }
    }
    for (i = 0; i < xl; i++) {
      if (arrNo.indexOf(i)) {
        x[i].classList.add('select-hide');
      }
    }
  }

  document.addEventListener('click', closeAllSelect);
}

function funcFilterWMMatchDots(eventTarget: EventTarget | null) {
  if (eventTarget === null) return;
  const _eventTarget = $(eventTarget);
  const innerText = _eventTarget.text();

  const regExp = /([a-zA-Z]+):\s([\w\s\-,]+)/g;

  let value = innerText.replace(regExp, '$2').trim();
  let prop = innerText.replace(regExp, '$1').trim().toLowerCase();

  const allWMMatchDots = $('.wm_match');

  if (value === 'All') {
    Chart.filterStates[prop] = '';
  } else {
    Chart.filterStates[prop] = value;
  }

  let searchAttributes = '';
  if (
    Chart.filterStates.round === '' &&
    Chart.filterStates.host === '' &&
    Chart.filterStates.weekday === ''
  ) {
    allWMMatchDots.removeClass('filtered');
  } else {
    if (Chart.filterStates.round) {
      // *= means contains
      // ^= means starts with
      // $= means ends with
      // ~= means contains word
      // |= means contains prefix or ends with prefix followed by -
      searchAttributes += `[data-rounds*="${Chart.filterStates.round}"]`; // Because of data-rounds="Third-place match,Final"
    }
    if (Chart.filterStates.host) {
      searchAttributes += `[data-host="${Chart.filterStates.host}"]`;
    }
    if (Chart.filterStates.weekday) {
      searchAttributes += `[data-weekday="${Chart.filterStates.weekday}"]`;
    }

    let searchString = `.wm_match${searchAttributes}`;
    // console.log(searchString);

    allWMMatchDots.addClass('filtered');
    $(searchString).removeClass('filtered');
  }

  // console.log(Chart.filterStates);
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
  funcCreateModalEntry,
  funcEvaluateScore,
  funcFormat,
  funcIsAnyOfThoseClasses,
  funcActivateSelect,
  funcFilterWMMatchDots,
};
