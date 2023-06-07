import $ from 'jquery';
import Http from 'axios';
import Moment from 'moment';
import { Match } from './Match.ts';
import { TMatch, TMatchLong } from '../types.ts';
import { IDictParticipants } from '../interfaces.ts';
import { EMatchColumns } from '../enums.ts';
import {
  DATE_RANGE_IN_DAYS,
  TOURNAMENT_END_LONG,
  TOURNAMENT_START_LONG,
} from '../constants.ts';

export class Chart {
  public arrYears: number[];
  public arrColumns: string[];
  public objData: { [key: number]: TMatch[] | TMatchLong[] };
  public arrData: TMatch[] | TMatchLong[];

  public dictGroups: (IDictParticipants | undefined) | null;

  public currentYear: number | null;
  public currentWM: (TMatch[] | TMatchLong[]) | null;

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

  paint() {
    let hasBeenSet = false;
    let wm = this.currentWM;
    let wmHTML = $(`.wm[data-year="${this.currentYear}"]`);
    let dotDimensionsMax = wmHTML.innerWidth()! / DATE_RANGE_IN_DAYS;

    const objOccurrences: { [key: string]: number } = {};

    let dateStartLong = Moment(`${this.currentYear}-${TOURNAMENT_START_LONG}`);
    // let dateStart = Moment(wm![0][EMatchColumns.DATE]!);
    // let dateEnd = Moment(wm![wm!.length - 1][EMatchColumns.DATE]!);
    let dateEndLong = Moment(`${this.currentYear}-${TOURNAMENT_END_LONG}`);

    console.log(wm);
    console.log(wmHTML, dotDimensionsMax);
    console.log(dateStartLong.format('YYYY-MM-DD'));
    // console.log(dateStart.format('YYYY-MM-DD'));
    // console.log(dateEnd.format('YYYY-MM-DD'));
    console.log(dateEndLong.format('YYYY-MM-DD'));

    let daysTotal = dateEndLong.diff(dateStartLong, 'days');

    for (let match of wm!) {
      if (!objOccurrences[match[EMatchColumns.DATE]]) {
        objOccurrences[match[EMatchColumns.DATE]] = 1;
      } else {
        objOccurrences[match[EMatchColumns.DATE]]++;
      }
    }

    console.log(objOccurrences);

    for (let match of wm!) {
      let date = match[EMatchColumns.DATE]!;
      let dateMoment = Moment(date);
      let days = dateMoment.diff(dateStartLong, 'days');
      console.log(dateMoment.format('YYYY-MM-DD'), days);

      const matchHTML = $('<div class="wm_match" tabindex="0"></div>');
      matchHTML.css({
        left: `${(days / daysTotal) * 100}%`,
        width: `${dotDimensionsMax * 0.8}px`,
        height: `${dotDimensionsMax * 0.8}px`,
      });

      matchHTML.attr('data-date', date);
      if (objOccurrences[date] > 1 && !hasBeenSet) {
        matchHTML.attr('data-occurrences', objOccurrences[date]);
        hasBeenSet = true;
      } else {
        hasBeenSet = false;
      }

      wmHTML.append(matchHTML);
    }

    $('main').bind('mousewheel', (e) => {
      // @ts-ignore
      let delta = e.originalEvent.wheelDeltaY;
      let app = $('#app');
      let appInnerWidth = app.innerWidth()!;

      if (delta > 0) {
        if (appInnerWidth <= 1920 * 4) app.css('width', `+=${delta / 10}px`);
      } else {
        if (appInnerWidth > 1920) app.css('width', `+=${delta / 10}px`);
        if (appInnerWidth < 1920) {
          app.css('width', `1920px`);
        }
      }

      /**
       * Credits: https://stackoverflow.com/a/40832273
       * @param e MouseMoveEvent
       */
      const updateScrollPos = function (
        e: JQuery.MouseMoveEvent<Document, undefined, Document, Document>
      ) {
        $('html').css('cursor', 'grabbing');
        let main = $('main');
        main.scrollLeft(main.scrollLeft()! / 10 + (clickX - e.pageX));
      };

      let clicked = false,
        clickX: number;
      $(document).on({
        mousemove: function (e) {
          clicked && updateScrollPos(e);
        },
        mousedown: function (e) {
          e.preventDefault();
          clicked = true;
          clickX = e.offsetX;
        },
        mouseup: function () {
          clicked = false;
          $('html').css('cursor', 'auto');
        },
      });

      // window resize event
      $(window).resize(() => {
        dotDimensionsMax = wmHTML.innerWidth()! / DATE_RANGE_IN_DAYS;
        // console.log(dotDimensionsMax);
      });
    });
  }

  // ################################################################################
  async render() {
    this.prerender();
    this.paint();
  }
}
