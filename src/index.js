import fs from 'mz/fs';
import url from 'url';
import axios from 'axios';
import cheerio from 'cheerio';
import { getLocalPath, getLinkPath } from './localPath';

const loadPage = (address, folder) => {
  const indexHtml = `${folder}/${getLocalPath(address, true)}`;
  const localPath = `${folder}/${getLocalPath(address)}`;
  return axios(address)
    .then((res) => {
      const $ = cheerio.load(res.data, { decodeEntities: false });
      const resources = [];
      $('script[src]').add('link[href]').add('img[src]').each((i, el) => {
        const attribute = $(el).prop('name') === 'link' ? 'href' : 'src';
        resources.push($(el).attr(attribute));
        const localUrl = getLinkPath($(el).attr(attribute));
        const newAttr = url.format({ host: localPath, pathname: localUrl });
        $(el).attr(attribute, newAttr);
      });

      fs.writeFile(indexHtml, $.html());

      fs.open(localPath, 'r', (err) => {
        if (err) {
          fs.mkdir(localPath);
        }
      });

      return Promise.all(resources.map((el) => axios({
        method: 'get',
        url: el,
        responseType: 'stream',
      })));
    })
    .then((resp) => {
      return Promise.all(resp.map((el) => {
        const file = getLinkPath(el.request.path);
        return el.data.pipe(fs.createWriteStream(`${localPath}${file}`));
      }));
    });
};

export default loadPage;
