import Http from 'axios';
import { Match } from './Match.ts';
import { TMatch, TMatchLong } from '../types.ts';

export class Chart {
  public years: number[];
  public columns: string[];
  public data: { [key: number]: TMatch[] | TMatchLong[] };

  public year: number | null;
  public wm: (TMatch[] | TMatchLong[]) | null;

  // ################################################################################
  // Constructor ####################################################################
  // ################################################################################
  constructor(options: any) {
    this.years = options.years;
    this.columns = options.columns;
    this.data = [];

    this.year = null;
    this.wm = null;
  }

  // ################################################################################
  // Setter #########################################################################
  // ################################################################################
  setYear(year: number) {
    this.year = year;
  }

  // ################################################################################
  setWM(wm: TMatch[] | TMatchLong[]) {
    this.wm = wm;
  }

  // ################################################################################
  // Methods ########################################################################
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
    for (let i = 0; i < this.years.length; i++) {
      try {
        const response = await Http.get(`/json/${this.years[i]}.json`);
        if (response.status === 200) {
          this.data[this.years[i]] = response.data;
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  // ################################################################################
  prerender() {
    if (!this.years) {
      throw new Error('prepareData: Cannot prepare data without years');
    }

    this.setYear(this.years[0]);
    this.setWM(this.data[this.year!]);

    for (let i = 0; i < this.years.length; i++) {
      const year = this.years[i];

      for (let j = 0; j < this.data[year].length; j++) {
        let wm = this.data[year];

        Match.mutGetHalftimeScoresOf(wm, j);
        // ...
      }
    }
  }

  // ################################################################################
  async render() {
    this.prerender();
    console.log(Match.getRoundsOf(this.data[1930]!));
    console.log(Match.getGroupsFor(this.data[1930]!));
  }
}
