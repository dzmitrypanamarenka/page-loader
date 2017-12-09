import fs from 'mz/fs';
import url from 'url';
import axios from 'axios';
import cheerio from 'cheerio';
import debug from 'debug';
import { getLocalPath, getLinkPath } from './localPath';

const pageDebug = debug('ploader:page');
pageDebug('start loading your page');

const loadPage = (address, folder) => {
  const indexHtml = `${folder}/${getLocalPath(address, true)}`;
  const localPath = `${folder}/${getLocalPath(address)}`;
  pageDebug('sending request');
  return axios(address)
    .then((res) => {
      pageDebug('receiving html');
      const $ = cheerio.load(res.data, { decodeEntities: false });
      const resources = [];
      pageDebug('selecting assets');
      $('script[src]').add('link[href]').add('img[src]').each((i, el) => {
        const attribute = $(el).prop('name') === 'link' ? 'href' : 'src';
        resources.push($(el).attr(attribute));
        const localUrl = getLinkPath($(el).attr(attribute));
        const newAttr = url.format({ host: localPath, pathname: localUrl });
        $(el).attr(attribute, newAttr);
      });
      pageDebug('updating html with local assets');
      fs.writeFile(indexHtml, $.html());

      pageDebug('creating directory for local assets');
      fs.open(localPath, 'r', (err) => {
        if (err) {
          fs.mkdir(localPath);
        }
      });

      pageDebug('downloading assets');
      return Promise.all(resources.map((el) => axios({
        method: 'get',
        url: el,
        responseType: 'stream',
      })));
    })
    .then((resp) => {
      pageDebug('writing assets');
      return Promise.all(resp.map((el) => {
        const file = getLinkPath(el.request.path);
        return el.data.pipe(fs.createWriteStream(`${localPath}${file}`));
      }));
    });
};

export default loadPage;
