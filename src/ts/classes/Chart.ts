import Http from 'axios';
import Moment from 'moment';
import { Match } from './Match.ts';
import { TMatch, TMatchLong } from '../types.ts';
import { IDictParticipants } from '../interfaces.ts';
import { EMatchColumnsLong } from '../enums.ts';

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

      for (let j = 0; j < this.objData[year].length; j++) {
        let wm = this.objData[year];

        Match.mutGetHalftimeScoresOf(wm, j);
        // ...
      }
    }
    this.assign();
  }

  // ################################################################################
  async render() {
    this.prerender();

    console.log(
      Moment.min(
        this.arrData.map((match) => Moment(match[EMatchColumnsLong.DATE]))
      ).format('YYYY-MM-DD'),
      Moment.max(
        this.arrData.map((match) => Moment(match[EMatchColumnsLong.DATE]))
      ).format('YYYY-MM-DD')
    );
  }
}
