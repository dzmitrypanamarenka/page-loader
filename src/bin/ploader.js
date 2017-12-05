#!/usr/bin/env node

import program from 'commander';
import loader from '../';

program
  .version('0.0.1')
  .arguments('<address>')
  .description('Load all of your pages')
  .option('-o, --output [folder]', 'output folder');

program
  .action((address) => {
    const { output } = program;
    const result = loader(address, output);
    console.log(result);
  });

program.parse(process.argv);
