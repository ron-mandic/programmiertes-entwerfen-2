import { chart } from './ts/variables';
import { EXIT_SUCCESS } from './ts/constants.ts';

async function main() {
  try {
    await chart.init();
  } catch (error) {
    console.error(error);
  }
}

main()
  .then((_) => console.log(...EXIT_SUCCESS))
  .catch(console.error);
