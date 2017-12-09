import fs from 'mz/fs';
import url from 'url';
import axios from 'axios';
import cheerio from 'cheerio';
// import http from 'http';
// import _ from 'lodash';
// import path from 'path';

const getLocalPath = (address, index) => {
  const { hostname, pathname } = url.parse(address);
  const ext = index ? '.html' : '_files/';
  return `${hostname.split('.').join('-')}${pathname.split('/').join('-')}${ext}`;
};
const getLinkPath = (link) => {
  const { pathname } = url.parse(link);
  return `${pathname.split('/').filter(el => el).join('-')}`;
};

const loadPage = (address, folder) => {
  const indexHtml = `${folder}/${getLocalPath(address, true)}`;
  const localPath = `${folder}/${getLocalPath(address)}`;
  return axios(address)
    .then((res) => {

      const $ = cheerio.load(res.data, { decodeEntities: false });
      const resources = [];
      $('script[src]').add('link[href]').add('img[src]').each((i, el) => {
        if ($(el).prop('name') === 'link') {
          resources.push($(el).attr('href'));
          const localUrl = getLinkPath($(el).attr('href'));
          const newHref = url.format({ host: localPath, pathname: localUrl });
          $(el).attr('href', newHref);
        } else {
          resources.push($(el).attr('src'));
          const localUrl = getLinkPath($(el).attr('src'));
          const newSrc = url.format({ host: localPath, pathname: localUrl });
          $(el).attr('src', newSrc);
        }
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
