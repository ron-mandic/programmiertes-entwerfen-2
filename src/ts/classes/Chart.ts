import $ from 'jquery';
import Http from 'axios';
import Moment from 'moment';
import { Match } from './Match.ts';
import { TJQueryPlainObject, TMatch, TMatchLong } from '../types.ts';
import { IDict, IDictParticipants } from '../interfaces.ts';
import { EMatchColumns, EUnitOfTime } from '../enums.ts';
import {
  CHART_WIDTH_MAX,
  CHART_WIDTH_MIN,
  CHART_WIDTH_OFFSET_MAX,
  DATE_RANGE_IN_DAYS,
  NA,
  TOURNAMENT_START_LONG,
} from '../constants.ts';
import { funcResizeAppWidth, funcResizeWMMatchWidth } from '../functions.ts';
import { Type } from './Type.ts';

export class Chart {
  public arrYears: number[];
  public arrColumns: string[];
  public objData: { [key: number]: TMatch[] | TMatchLong[] };
  public arrData: TMatch[] | TMatchLong[];

  public dictGroups: (IDictParticipants | undefined) | null;

  public currentYear: number | null;
  public currentWM: (TMatch[] | TMatchLong[]) | null;

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

    this.dictGroups = null;

    this.currentYear = null;
    this.currentWM = null;
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
    this.dictGroups = Match.getGroupsFor(this.currentWM!);
  }

  // ################################################################################
  prerender() {
    if (!this.arrYears) {
      throw new Error('prepareData: Cannot prepare data without years');
    }

    for (let i = 0; i < this.arrYears.length; i++) {
      const year = this.arrYears[i];
      let wm = this.objData[year];

      for (let j = 0; j < this.objData[year].length; j++) {
        Match.mutGetHalftimeScoresOf(wm, j);
      }
    }

    this.assign();
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
          };
        } else {
          dictWMMatchDots[daysDiff].matches.push(match);
          dictWMMatchDots[daysDiff].occurrences++;
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

          wmHTML.append(matchHTML);
        }
        daysDiffTemp = i;
      }
      dictWMMatchDots = {};
    }
  }

  // ################################################################################
  async render() {
    this.prerender();
    this.compose();

    this.initEvents();
    this.initInteractions();

    Chart.CHART_WIDTH = CHART_WIDTH_MIN;

    $('.asides').css('translate', `-${CHART_WIDTH_OFFSET_MAX * 2}px`);
  }
}
