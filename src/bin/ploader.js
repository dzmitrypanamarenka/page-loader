#!/usr/bin/env node

import program from 'commander';
import process from 'process';
import path from 'path';
import Listr from 'listr';
import loader from '../';
import { getLinkPath, getLocalPath } from '../localPath';

program
  .version('0.0.1')
  .arguments('<address>')
  .description('Load all of your pages')
  .option('-o, --output [folder]', 'output folder');

program
  .action((address) => {
    const { output } = program;
    const tasks = new Listr([
      {
        title: `Loading assets from page: ${address}...`,
        task: () => loader(address, output)
          .then((data) => {
            const [pages, ...assets] = data;
            return new Listr(pages.map((el, i) => ({
              title: el,
              task: () => {
                const localPath = path.join(output, getLocalPath(address));
                const file = getLinkPath(el);
                return assets[i].path === `${localPath}${file}`;
              },
            })));
          })
          .then(links => links.run()),
      },
    ]);
    return tasks.run()
      .then(() => console.log(`\nPage was downloaded as ${getLocalPath(address, 'indexHTML')}!`))
      .catch((err) => {
        const statusTxt = {
          403: 'Forbidden',
          404: 'Not Found',
          500: 'Internal Server Error',
        };
        if (err.code) {
          console.error(
            '\nError!! The program fell out with error:\n%s\n%s path: %s\n',
            err.message,
            err.syscall,
            err.path,
          );
        }
        if (err.response) {
          const curStatusText = err.response.statusText || statusTxt[err.response.status];
          console.error(
            '\nError!! The program fell out with error :\ncode: %d - %s %s',
            err.response.status,
            curStatusText,
            err.config.url,
          );
        }
        process.exit(1);
      });
  });

program.parse(process.argv);
