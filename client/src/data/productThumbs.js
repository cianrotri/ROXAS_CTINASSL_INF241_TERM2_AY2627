const CATALOG = {
  'CHIIKAWA PLUSH': { slug: 'chiikawa', image: '/assets/plush/chiikawa.png' },
  'HACHIWARE PLUSH': { slug: 'hachiware', image: '/assets/plush/hachiware.png' },
  'USAGI PLUSH': { slug: 'usagi', image: '/assets/plush/usagi.png' },
  'MOMONGA PLUSH': { slug: 'momonga', image: '/assets/plush/momonga.png' },
  'RAKKO PLUSH': { slug: 'rakko', image: '/assets/plush/rakko.png' },
  'KURIMANJU PLUSH': { slug: 'kurimanju', image: '/assets/plush/kurimanju.png' },
  'FURUHONYA PLUSH': { slug: 'furuhonya', image: '/assets/plush/furuhonya.png' },
  'SHISA PLUSH': { slug: 'shisa', image: '/assets/plush/shisa.png' },
};

export function getProductVisual(productName) {
  return CATALOG[productName] || CATALOG['CHIIKAWA PLUSH'];
}

export const ASSETS = {
  background: '/assets/background.jpg',
  loginDecoration: '/assets/login-decoration.png',
  logo: '/assets/chiikawa-logo.png',
  headerCharacters: '/assets/header-characters.png',
  headerPhoto: '/assets/header-photo.png',
};