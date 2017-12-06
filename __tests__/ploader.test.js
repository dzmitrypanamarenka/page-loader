import fs from 'mz/fs';
import os from 'os';
import path from 'path';
import nock from 'nock';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import loader from '../src';

const host = 'https://hexlet.io';
const { sep } = path;
const dir = fs.mkdtempSync(path.join(os.tmpdir(), sep, 'ploader-'));
const address = `${host}/courses`;

axios.defaults.host = host;
axios.defaults.adapter = httpAdapter;

describe('ploader', () => {
  it('get #1 page: success', (done) => {
    const status = 200;
    nock(host).get('/courses').reply(status);

    loader(address, dir).then((response) => {
      expect(response.status).toBe(status);
      done();
    }).catch(done);
  });

  it('get #1 page: failed', (done) => {
    const status = 404;
    nock(host).get('/courses/failed').reply(status);

    loader(`${address}/failed`, dir).then((response) => {
      fail(response.status);
    }).catch((err) => {
      expect(err).not.toBeNull();
      done();
    });
  });

  it('get #1 page: body', () => {
    nock(host).get('/courses').reply(200);
    return loader(address, dir).then(() => {
      fs.open(`${dir}/hexlet-io-courses.html`, 'r', (err, data) => {
        expect(data).toBeTruthy();
      });
    });
  });
});
