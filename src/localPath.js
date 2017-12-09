import url from 'url';

export const getLocalPath = (address, index) => {
  const { hostname, pathname } = url.parse(address);
  const ext = index ? '.html' : '_files/';
  return `${hostname.split('.').join('-')}${pathname.split('/').join('-')}${ext}`;
};

export const getLinkPath = (link) => {
  const { pathname } = url.parse(link);
  return `${pathname.split('/').filter(el => el).join('-')}`;
};
