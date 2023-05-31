import Http from 'axios';
import { Columns } from '../constants';
import { Match } from './Match';

export class Chart {
  public years: number[];
  public columns: string[];
  public data: any[];

  public year: number | null = null;

  // Constructor ########################################
  constructor(options: any) {
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
    console.log(Match.goalsOf(this.data, 1930, 10, Columns.HOME_GOALS));
    console.log(Match.goalsOf(this.data, 1930, 10, Columns.HOME_GOALS_OWN));
    console.log(Match.goalsOf(this.data, 1930, 10, Columns.HOME_GOALS_PENALTY));

    console.log(Match.goalsOf(this.data, 1930, 10, Columns.AWAY_GOALS));
    console.log(Match.goalsOf(this.data, 1930, 10, Columns.AWAY_GOALS_OWN));
    console.log(Match.goalsOf(this.data, 1930, 10, Columns.AWAY_GOALS_PENALTY));
  }
}
