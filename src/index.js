import fs from 'mz/fs';
import url from 'url';
import axios from 'axios';
// import http from 'http';
// import _ from 'lodash';
// import path from 'path';

const loader = (address, folder) => {
  const { hostname, pathname } = url.parse(address);
  const fileName = `${hostname.split('.').join('-')}${pathname.split('/').join('-')}.html`;

  return new Promise((resolve, reject) => {
    axios.get(address)
      .then((res) => {
        fs.writeFile(`${folder}/${fileName}`, res.data)
          .then((err) => {
            if (err) {
              throw err;
            }
            return resolve({
              data: res.data,
              status: res.status,
            });
          });
      })
      .catch(err => reject(err));
  });
};

export default loader;
