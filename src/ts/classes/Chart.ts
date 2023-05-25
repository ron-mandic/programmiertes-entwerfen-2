import { log } from 'console';
import { TChartData, TChartOptions } from '../types';
import Http from 'axios';

export class Chart {
  public years: number[];
  public columns: string[];
  public data: TChartData[];

  public year: number | null = null;

  // Constructor ########################################
  constructor(options: TChartOptions) {
    this.years = options.years;
    this.columns = options.columns;

    this.data = [];
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

      if (this.years) this.setYear(this.years[0]);
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

  async render() {
    console.log(this.data, 'render');
  }
}
