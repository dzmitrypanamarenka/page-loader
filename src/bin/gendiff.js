#!/usr/bin/env node

import program from 'commander';

program
  .version('0.0.1')
  .arguments('<firstConfig> <secondConfig>')
  .description('Compares two configuration files and shows a difference.')
  .option('-f, --format [type]', 'choose output format');

program
  .action((firstConfig, secondConfig) => {
    const { format } = program;
    const result = genDiff(`${firstConfig}`, `${secondConfig}`, format);
    console.log(result);
  });

program.parse(process.argv);
