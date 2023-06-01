import Http from 'axios';
import { Match } from './Match.ts';

export class Chart {
  public years: number[];
  public columns: string[];
  public data: any[];

  public year: number | null;

  // Constructor ########################################
  constructor(options: any) {
    this.years = options.years;
    this.columns = options.columns;
    this.data = [];

    this.year = null;
  }

  // Getter ########################################

  // Setter ########################################
  setYear(year: number) {
    this.year = year;
  }

  // Methods ########################################
  async init() {
    try {
      await this.loadJSON();
      await this.render();
    } catch (error) {
      console.error(error);
    }
  }

  async loadJSON() {
    for (let i = 0; i < this.years.length; i++) {
      try {
        const response = await Http.get(`/json/${this.years[i]}.json`);
        this.data[this.years[i]] = response.data;
      } catch (error) {
        console.error(error);
      }
    }
  }

  prerender() {
    if (!this.years) {
      throw new Error('prepareData: Cannot prepare data without years');
    }

    this.setYear(this.years[0]);

    for (let i = 0; i < this.years.length; i++) {
      const year = this.years[i];

      for (let j = 0; j < this.data[year].length; j++) {
        Match.halfTimeScoresOf(this.data[year], j);
        // TODO: Make tables for group stages
      }
    }
  }

  async render() {
    this.prerender();

    console.log(this.data[1930]);
  }
}
