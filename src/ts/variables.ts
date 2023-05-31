import { Chart } from './classes/Chart';
import { Columns } from './constants';

// Chart ########################################
const chartOptions = {
  years: [1930, 2022],
  columns: Columns,
};
const chart = new Chart(chartOptions);

export { chart };
