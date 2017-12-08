import fs from 'mz/fs';
import os from 'os';
import path from 'path';
import nock from 'nock';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import loadPage from '../src';

describe('ploader', () => {
  let dir;
  const { sep } = path;
  const host = 'https://hexlet.io';
  const address = `${host}/courses`;
  axios.defaults.adapter = httpAdapter;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), sep, 'ploader-'));
  });

  it('get #1 page: success', () => {
    const status = 200;
    nock(host).get('/courses').reply(status);

    return loadPage(address, dir).then((response) => {
      expect(response.status).toBe(status);
    });
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
    nock(host).get('/courses').reply(200);

    return loadPage(address, dir).then(() => {
      fs.open(`${dir}/hexlet-io-courses.html`, 'r', (err, data) => {
        expect(data).toBeTruthy();
      });
    });
  });
});
