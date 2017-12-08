import fs from 'mz/fs';
import url from 'url';
import axios from 'axios';
// import http from 'http';
// import _ from 'lodash';
// import path from 'path';

const loadPage = (address, folder) => {
  const { hostname, pathname } = url.parse(address);
  const fileName = `${hostname.split('.').join('-')}${pathname.split('/').join('-')}.html`;
  const filePath = `${folder}/${fileName}`;
    return axios.get(address)
      .then((res) => {
        fs.writeFile(filePath, res.data);
        return {
          data: res.data,
          status: res.status,
        };
      })
};

export default loadPage;
