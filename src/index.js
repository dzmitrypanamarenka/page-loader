import fs from 'mz/fs';
import url from 'url';
import axios from 'axios';
// import http from 'http';
// import _ from 'lodash';
// import path from 'path';

const loader = (address, folder) => {
  const { hostname, pathname } = url.parse(address);
  const fileName = `${hostname.split('.').join('-')}${pathname.split('/').join('-')}.html`;
  axios.get(address)
    .then((res) => {
      fs.writeFile(`${folder}/${fileName}`, res.data)
        .then((err) => {
          if (err) {
            throw err;
          }
        });
    })
    .catch(err => new Error(err));
};

export default loader;
