import $ from 'jquery';
import Http from 'axios';
import Moment from 'moment';
import { Match } from './Match.ts';
import { TJQueryPlainObject, TMatch, TMatchLong } from '../types.ts';
import {
  IDict,
  IDictParticipants,
  IObjStageGroupResult,
} from '../interfaces.ts';
import { EMatchColumns, EStageMode, EUnitOfTime } from '../enums.ts';
import {
  CHART_WIDTH_MAX,
  CHART_WIDTH_MIN,
  CHART_WIDTH_OFFSET_MAX,
  DATE_RANGE_IN_DAYS,
  NA,
  TOURNAMENT_START_LONG,
} from '../constants.ts';
import {
  funcComposeGridStageGroup,
  funcComposeGridStageKnockout,
  funcGetAllWorldCupStagesOf,
  funcResizeAppWidth,
  funcResizeWMMatchWidth,
} from '../functions.ts';
import { Type } from './Type.ts';

export class Chart {
  public arrYears: number[];
  public arrColumns: string[];
  public objData: { [key: number]: TMatch[] | TMatchLong[] };
  public arrData: TMatch[] | TMatchLong[];

  public dictStages: (IDict | undefined) | null;
  public dictStagesGrids: (IDict | undefined) | null;

  public currentYear: number | null;
  public currentWM: (TMatch[] | TMatchLong[]) | null;
  public currentDictGroups: (IDictParticipants | undefined) | null;

  public arrWMMatchesHTML: null | JQuery[];

  // ################################################################################
  // Static properties ##############################################################
  // ################################################################################
  public static CHART_WIDTH = CHART_WIDTH_MAX;
  // public static CHART_HEIGHT = 1080;
  public static CHART_WIDTH_OFFSET = CHART_WIDTH_OFFSET_MAX;
  public static matchDotSizes: null | number = null;

  // ################################################################################
  // Constructor ####################################################################
  // ################################################################################
  constructor(options: any) {
    this.arrYears = options.years;
    this.arrColumns = options.columns;

    this.objData = {};
    this.arrData = [];

    this.currentDictGroups = null;
    this.dictStages = {};
    this.dictStagesGrids = {};

    this.currentYear = null;
    this.currentWM = null;

    this.arrWMMatchesHTML = null;
  }

  // ################################################################################
  // Static methods #################################################################
  // ################################################################################
  public static createDot(
    properties: TJQueryPlainObject,
    innerHTML = '<div class="wm_match"></div>'
  ) {
    return $(innerHTML).css(properties);
  }

  // ################################################################################
  // Setter #########################################################################
  // ################################################################################
  setYear(year: number) {
    this.currentYear = year;
  }

  // ################################################################################
  setWM(wm: TMatch[] | TMatchLong[]) {
    this.currentWM = wm;
  }

  // ################################################################################
  // Methods ########################################################################
  // ################################################################################
  log() {
    console.log(this);
  }

  // ################################################################################
  async init() {
    try {
      await this.loadJSON();
      await this.render();
    } catch (error) {
      console.error(error);
    }
  }

  // ################################################################################
  // TODO: Document
  initEvents() {
    $(window).resize(() => {
      Chart.matchDotSizes = $('#app').innerWidth()! / DATE_RANGE_IN_DAYS;
    });

    new ResizeObserver(funcResizeWMMatchWidth).observe($('#app')![0]);
  }

  // ################################################################################
  // TODO: Document
  initInteractions() {
    $('.container').bind('mousewheel', funcResizeAppWidth);
  }

  // ################################################################################
  async loadJSON() {
    for (let i = 0; i < this.arrYears.length; i++) {
      try {
        const response = await Http.get(`/json/${this.arrYears[i]}.json`);
        if (response.status === 200) {
          this.objData[this.arrYears[i]] = response.data;
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  // ################################################################################
  assign() {
    this.setYear(this.arrYears[0]);
    this.setWM(this.objData[this.currentYear!]);

    this.arrData = Object.values(this.objData).flat();
    // @ts-ignore
    this.arrWMMatchesHTML = $('.wm_match');

    // Cannot reliably assign this here since World Cups can have consecutive group structures
    // this.currentDictGroups = Match.getGroupsFor(this.currentWM!);
  }

  // ################################################################################
  prerender() {
    if (!this.arrYears) {
      throw new Error('prepareData: Cannot prepare data without years');
    }

    let id = 0;

    for (let i = 0; i < this.arrYears.length; i++) {
      const year = this.arrYears[i];
      let wm = this.objData[year];

      for (let j = 0; j < wm.length; j++) {
        Match.mutGetHalftimeScoresOf(wm, j);

        // Custom property for unique identification
        wm[j].ID = id;

        const {
          arrStagesGroup: sG,
          arrStagesKnockout: sK,
        }: IObjStageGroupResult = funcGetAllWorldCupStagesOf(year);
        this.dictStages![year] = {
          arrStagesGroup: Match.getWorldCupStagesUsing(wm, sG),
          arrStagesKnockout: Match.getWorldCupStagesUsing(wm, sK),
        };

        id++;
      }

      this.dictStagesGrids![year] = {};
      const ref = this.dictStagesGrids![year];
      let arrSG = this.dictStages![year].arrStagesGroup;
      let arrKG = this.dictStages![year].arrStagesKnockout;
      ref.objStagesGroup = arrSG
        ? Match.getGridStatistics(arrSG, arrSG.length, EStageMode.GROUP)
        : undefined;
      ref.objStagesKnockout = arrKG
        ? Match.getGridStatistics(arrKG, arrKG.length, EStageMode.KNOCKOUT)
        : undefined;
      ref.stagesGroupLength = arrSG ? arrSG.length : 0;
      ref.stagesKnockoutLength = arrKG ? arrKG.length : 0;
    }

    // TODO: Check if assignments can be made later
    // this.assign();
  }

  // ################################################################################
  compose() {
    for (let i = 0; i < this.arrYears.length; i++) {
      const year = this.arrYears[i],
        wm = this.objData[year],
        wmHTML = $(`.wm[data-year="${year}"]`);

      Chart.matchDotSizes = wmHTML.innerWidth()! / DATE_RANGE_IN_DAYS;

      let daysDiffTemp = null;
      let dictWMMatchDots = {} as IDict;

      for (let match of wm!) {
        let dateStartLong = Moment(`${year}-${TOURNAMENT_START_LONG}`),
          date = match[EMatchColumns.DATE]!,
          daysDiff = Moment(date).diff(dateStartLong, EUnitOfTime.DAYS);

        if (!dictWMMatchDots[daysDiff]) {
          dictWMMatchDots[daysDiff] = {
            matches: [match],
            occurrences: 1,
            ids: [match.ID],
          };
        } else {
          dictWMMatchDots[daysDiff].matches.push(match);
          dictWMMatchDots[daysDiff].occurrences++;
          dictWMMatchDots[daysDiff].ids.push(match.ID);
        }
      }

      for (let i = 0; i < DATE_RANGE_IN_DAYS; i++) {
        if (!dictWMMatchDots[i]) {
          wmHTML.append(
            Chart.createDot(
              {
                left: `${(i / DATE_RANGE_IN_DAYS) * 100}%`,
                width: `${Chart.matchDotSizes * 0.75}px`,
              },
              '<div class="wm_match__empty"></div>'
            )
          );
          continue;
        }

        if (Type.isNull(daysDiffTemp) || daysDiffTemp !== i) {
          const matchHTML = Chart.createDot(
            {
              left: `${(i / DATE_RANGE_IN_DAYS) * 100}%`,
              width: `${Chart.matchDotSizes * 0.75}px`,
              height: `${Chart.matchDotSizes * 0.75}px`,
            },
            '<div class="wm_match" tabindex="0"></div>'
          );

          if (dictWMMatchDots[i].occurrences > 1) {
            matchHTML.attr('data-occurrences', dictWMMatchDots[i].occurrences);
          }

          matchHTML.attr(
            'data-date',
            dictWMMatchDots[i].matches[0][EMatchColumns.DATE] ?? NA
          );
          matchHTML.attr(
            'data-weekday',
            dictWMMatchDots[i].matches[0][EMatchColumns.WEEKDAY] ?? NA
          );
          matchHTML.data('data-matches', dictWMMatchDots[i].matches);
          matchHTML.data('data-ids', dictWMMatchDots[i].ids);

          wmHTML.append(matchHTML);
        }
        daysDiffTemp = i;
      }
      dictWMMatchDots = {};
    }
  }

  // ################################################################################
  /**
   * Status: Doing
   */
  composeGrids() {
    if (!this.dictStagesGrids)
      throw new Error('composeGrids: dictStagesGrids is null');

    for (let year in this.dictStagesGrids!) {
      const yearGrids = this.dictStagesGrids![year];
      const {
        objStagesGroup: objSG,
        objStagesKnockout: objSK,
        stagesGroupLength: sGL,
        stagesKnockoutLength: sKL,
      } = yearGrids;

      const asideHTML = $(`.aside[data-year="${year}"]`);
      const [wrapperA, wrapperB] = asideHTML.find('.wrapper-m');

      if (!wrapperA || !wrapperB)
        throw new Error('composeGrids: wrapperA or wrapperB is null');

      funcComposeGridStageGroup($(wrapperA)!, objSG, sGL);
      funcComposeGridStageKnockout($(wrapperB)!, objSK, sKL);
    }
  }

  // ################################################################################
  async render() {
    this.prerender();
    this.compose();
    this.composeGrids();

    this.initEvents();
    this.initInteractions();

    this.assign();

    Chart.CHART_WIDTH = CHART_WIDTH_MIN;
    // $('.asides').css('translate', `-${(1 / 22) * 100}%`);

    let index = 0;
    $('.asides').css('translate', `-${480 * index}px`);
    console.log(
      this.dictStagesGrids![this.arrYears[index]].objStagesGroup!,
      this.dictStagesGrids![this.arrYears[index]].objStagesKnockout!
    );
  }
}
