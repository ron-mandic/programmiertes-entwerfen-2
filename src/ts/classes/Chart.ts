import $ from 'jquery';
import Http from 'axios';
import Moment from 'moment';
import Anime from 'animejs';
import { Match } from './Match.ts';
import { TJQueryPlainObject, TMatch, TMatchLong } from '../types.ts';
import {
  IDict,
  IDictParticipants,
  IObjStageGroupResult,
} from '../interfaces.ts';
import { EMatchColumns, EStageMode, ESymbol, EUnitOfTime } from '../enums.ts';
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
  funcFormat,
  funcGetAllWorldCupStagesOf,
  funcGetFuncFromGradient,
  funcGetScrollAmountBy,
  funcGetYearFrom,
  funcIsAnyOfThoseClasses,
  funcMakeDraggable,
  funcPopulateModal,
  funcResizeAppWidth,
  funcResizeWMMatchWidth,
  funcSimulateMouseClick,
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

  public objAsideState: {
    current: null | JQuery;
    previous: null | JQuery;
  };
  public objAsideStateScrollTops: { [key: number]: number };

  public currentlySelectedMatch: null | JQuery;

  // ################################################################################
  // Static properties ##############################################################
  // ################################################################################
  public static IS_EXPANDED = false;
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

    this.objAsideState = {
      current: null,
      previous: null,
    };

    this.objAsideStateScrollTops = {
      1930: 0,
      1934: 0,
      1938: 0,
      1950: 0,
      1954: 0,
      1958: 0,
      1962: 0,
      1966: 0,
      1970: 0,
      1974: 0,
      1978: 0,
      1982: 0,
      1986: 0,
      1990: 0,
      1994: 0,
      1998: 0,
      2002: 0,
      2006: 0,
      2010: 0,
      2014: 0,
      2018: 0,
      2022: 0,
    };

    this.currentlySelectedMatch = null;
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

    let asides = $('.asides'),
      years = $('.years'),
      yearsHTML = years[0];

    let chart = this;

    $('.year > label').each(function (_, element) {
      $(element).on('click', function () {
        let main = $('main');
        let i = +$(this).parent().attr('data-i')!;
        let year = $(this).parent().find('input[type="radio"]').val()!;
        asides.css('translate', `-${((i - 1) / 22) * 100}%`);

        chart.setYear(+year);
        chart.setWM(chart.objData[+year]);

        // ########################################

        if (chart.objAsideState.previous) {
          chart.objAsideStateScrollTops[+year!] = <number>(
            chart.objAsideState.previous!.scrollTop()
          );
        }

        // ########################################

        if (
          chart.objAsideStateScrollTops[+year!] === 0 &&
          main.hasClass('out')
        ) {
          main.removeClass('out');
        } else if (
          chart.objAsideStateScrollTops[+year!] > 0 &&
          !main.hasClass('out')
        ) {
          main.addClass('out');
        }

        let previousYear = chart.objAsideState.previous?.attr('data-year')!;
        if (
          chart.objAsideState.previous &&
          chart.objAsideStateScrollTops[+previousYear] !== 0
        ) {
          let thisAsideHTML = $(`.aside[data-year="${previousYear}"]`)[0];
          thisAsideHTML.scrollTo({
            top: 0,
            behavior: 'smooth',
          });
          main.removeClass('out'); // Even though the scroll triggered event takes care of this
        }

        if (chart.objAsideStateScrollTops[+year] !== 0) {
          let thisAsideHTML = $(`.aside[data-year="${year}"]`)[0];
          thisAsideHTML.scrollTo({
            top: 0,
            behavior: 'smooth',
          });
          main.removeClass('out'); // Even though the scroll triggered event takes care of this
        }

        // ########################################

        // 1a)
        $(`.wm[data-year='${+year}']`).addClass('on');

        // ########################################

        if (chart.objAsideState.current!.attr('data-year') !== year) {
          chart.objAsideState.previous = chart.objAsideState.current;
          chart.objAsideState.current = $(`.aside[data-year="${year}"]`);
        }

        // ########################################

        // 1b)
        previousYear = chart.objAsideState.previous?.attr('data-year')!;
        $(`.wm[data-year='${+previousYear!}']`).removeClass('on');

        // ########################################

        /* console.log(
          chart.objAsideState.previous?.attr('data-year'),
          chart.objAsideState.current!.attr('data-year')
        ); */

        main.attr('data-title-after', `${year}`);

        // console.log(chart.currentYear);
        // console.log(chart.currentWM);

        yearsHTML.scrollTo({
          left: funcGetScrollAmountBy(i) - 10,
          top: 0,
          behavior: 'smooth',
        });
      });
    });

    $('.wm_match').on('click', function (event) {
      const wmMatchDot = $(this);
      let year = +wmMatchDot.attr('data-date')!.substring(0, 4);
      let wmModal = $('.wm_modal');

      funcSimulateMouseClick(chart, year);
      funcPopulateModal(chart, wmModal, wmMatchDot, event);

      wmMatchDot.focus();
      chart.currentlySelectedMatch = wmMatchDot;
      // console.log(chart.currentlySelectedMatch);
    });

    years.bind('mousewheel', function (event) {
      event.preventDefault();
    });

    $(document).on('keydown', function (event) {
      let app = $('#app'),
        container = $('.container'),
        aside = $('aside');

      if (event.key === 'd') {
        if (Chart.CHART_WIDTH === CHART_WIDTH_MAX) {
          // If the chart takes up whole screen
          Chart.CHART_WIDTH = CHART_WIDTH_MIN;

          app.css('width', Chart.CHART_WIDTH).addClass('min');
          container.css('width', Chart.CHART_WIDTH).addClass('min');
          aside.show();
        } else {
          // If the chart is in the middle of the screen
          Chart.CHART_WIDTH = CHART_WIDTH_MAX;

          app.css('width', Chart.CHART_WIDTH).removeClass('min');
          container.css('width', Chart.CHART_WIDTH).removeClass('min');
          aside.hide();
        }

        if (chart.currentYear !== 1930) {
          // Only visual indicator
          // 1a)
          $(`.wm.on`).removeClass('on');
          // 1b)
          $(`.wm[data-year='${chart.currentYear}']`).addClass('on');

          const index = funcGetYearFrom(chart.currentYear!);
          // a) Simulate mouse click
          $(`.year[data-i="${index}"] > label`).click();
          // b) Change title
          $('main').attr('data-title-after', `${chart.currentYear!}`);
          // c) Trigger footer area
          $('.years')[0].scrollTo({
            left: funcGetScrollAmountBy(index) - 10,
            top: 0,
            behavior: 'smooth',
          });
          // d) Trigger the slider
          $('.asides').css('translate', `-${((index - 1) / 22) * 100}%`);
        }

        if (chart.currentlySelectedMatch) {
          chart.currentlySelectedMatch.focus();
        }

        if (!chart.objAsideState.previous) {
          $(`.wm[data-year='${chart.currentYear}']`).addClass('on');
        }
      }
    });
  }

  // ################################################################################
  // TODO: Document
  initInteractions() {
    $('.container').bind('mousewheel', funcResizeAppWidth);

    let chart = this;

    $('.aside').each(function (_, element) {
      $(element).scroll(function () {
        let main = $('main');
        let thisAside = $(this);
        let scrollTop = thisAside.scrollTop()!;

        let year = +thisAside.attr('data-year')!;
        chart.objAsideStateScrollTops[year] = scrollTop;

        if (scrollTop > 75) {
          if (!main.hasClass('out')) main.addClass('out');
        } else {
          if (main.hasClass('out')) main.removeClass('out');
        }
      });
    });

    let wmModal = $('.wm_modal');
    const wmModalContent = wmModal.find('.content')!;
    const wmModalTitle = wmModal.find('h2')!;
    // If I click outside the modal, the content should reset itself
    window.addEventListener('click', function (e) {
      if (
        !document.querySelector('.wm_modal')!.contains(e.target) &&
        !e.target.classList.contains('wm_match')
      ) {
        chart.currentlySelectedMatch = null;
        wmModalTitle.removeClass('on');
        wmModalContent.empty();
      }
    });
  }

  initAnimations() {
    Anime({
      targets: Array.from($('.wm_match')),
      translateX: [Anime.random(-1000, 500), 0],
      opacity: [0.075, 1],
      easing: 'easeOutQuad',
      duration: 200,
      delay: Anime.stagger(15, { start: 0, from: 'center' }),
      complete: () => {
        $('.container').addClass('ready');
      },
    });
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

    this.objAsideState.current = $('.aside').first();

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
   * Retrieves the wrapper elements for the grid and passes the arguments to subordinate functions
   * which then actually compose each individual grid.
   *
   * Status: Done
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
      const colorStart = '#e2fdff', // #d9ed92, #e0aaff, #c7f9cc, #e2fdff
        colorEnd = '#5465ff'; // #d9ed92, #10002b, #22577a, #5465ff
      const funcGetColor = funcGetFuncFromGradient(colorStart, colorEnd, 0, 1);

      if (!wrapperA || !wrapperB)
        throw new Error('composeGrids: wrapperA or wrapperB is null');

      funcComposeGridStageGroup($(wrapperA)!, objSG, funcGetColor, sGL);
      funcComposeGridStageKnockout($(wrapperB)!, objSK, funcGetColor, sKL);
    }
  }

  // ################################################################################
  async render() {
    this.prerender();
    this.compose();
    this.composeGrids();

    this.assign();

    this.initEvents();
    this.initInteractions();
    this.initAnimations();

    funcMakeDraggable($('.wm_modal')[0], $('#app')[0]);
  }
}
