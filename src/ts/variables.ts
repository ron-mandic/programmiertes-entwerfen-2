import { Chart } from './classes/Chart';
import { MatchColumns, WorldCupYears } from './constants';

// Chart ########################################
const chartOptions = {
  years: WorldCupYears,
  columns: Object.values(MatchColumns),
};
const chart = new Chart(chartOptions);

export { chart };
