#!/usr/bin/env node

import program from 'commander';
import process from 'process';
import loader from '../';

program
  .version('0.0.1')
  .arguments('<address>')
  .description('Load all of your pages')
  .option('-o, --output [folder]', 'output folder');

program
  .action((address) => {
    const { output } = program;
    return loader(address, output).catch(() => {
      process.exit(1);
    });
  });

program.parse(process.argv);
