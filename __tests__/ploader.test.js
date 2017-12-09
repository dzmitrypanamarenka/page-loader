import fs from 'mz/fs';
import os from 'os';
import path from 'path';
import nock from 'nock';
import axios from 'axios';
import cheerio from 'cheerio';
import url from 'url';
import httpAdapter from 'axios/lib/adapters/http';
import loadPage from '../src';

describe('ploader', () => {
  let dir;
  const { sep } = path;
  const host = 'https://hexlet.io';
  const address = `${host}/courses`;
  const html = fs.readFileSync('__tests__/fixtures/index.html', 'utf-8');
  axios.defaults.adapter = httpAdapter;

  const getLocalPath = (addr, index) => {
    const { hostname, pathname } = url.parse(addr);
    const ext = index ? '.html' : '_files';
    return `${hostname.split('.').join('-')}${pathname.split('/').join('-')}${ext}`;
  };

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), sep, 'ploader-'));
    axios.defaults.adapter = httpAdapter;
    nock(host).get('/courses').reply(200, html);
  });

  it('get #1 page: failed', () => {
    const status = 404;
    nock(host).get('/courses/failed').reply(status);
    expect.assertions(1);

    return loadPage(`${address}/failed`, dir).catch((err) => {
      expect(err).not.toBeNull();
    });
  });

  it('get #1 page: body', () => {
    const indexHtml = `${dir}/${getLocalPath(address, true)}`;

    return loadPage(address, dir).then(() => {
      const data = fs.openSync(indexHtml, 'r');
      expect(data).toBeTruthy();
    });
  });

  it('get load resources', () => {
    const indexHtml = `${dir}/${getLocalPath(address, true)}`;
    const localPath = `${dir}/${getLocalPath(address)}`;
    return loadPage(address, dir)
      .then(() => {
        const file = fs.readFileSync(indexHtml, 'utf-8');
        const $ = cheerio.load(file);
        const script = path.parse($('script[src]').first().attr('src')).dir;
        const link = path.parse($('link[href]').first().attr('href')).dir;
        const image = path.parse($('img[src]').first().attr('src')).dir;

        expect(script).toBe(localPath);
        expect(link).toBe(localPath);
        expect(image).toBe(localPath);
      });
  });

  it('get check assets dir', () => {
    const localPath = `${dir}/${getLocalPath(address)}`;
    return loadPage(address, dir)
      .then(() => {
        const files = fs.readdirSync(localPath);
        expect(files.length).toBeTruthy();
      });
  });
});
