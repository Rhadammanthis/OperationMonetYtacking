import {translate} from '../localization';

const CATEGORIES = {
  vgt: {
    color: '#238364',
    icon: 'carrot',
    name: translate('main_category_vegetables'),
  },
  fts: {
    color: '#afc474',
    icon: 'apple-alt',
    name: translate('main_category_fruits'),
  },
  dry: {
    color: '#F99D33',
    icon: 'cheese',
    name: translate('main_category_dairy'),
  },
  mef: {
    color: '#AA3C3B',
    icon: 'drumstick-bite',
    name: translate('main_category_meets'),
  },
  swt: {
    color: '#CA7E8D',
    icon: 'ice-cream',
    name: translate('main_category_sweets'),
  },
  crl: {
    color: '#71503A',
    icon: 'bread-slice',
    name: translate('main_category_cereals'),
  },
  cln: {
    color: '#5E96AE',
    icon: 'toilet-paper',
    name: translate('main_category_hygiene'),
  },
  oth: {
    color: '#909090',
    icon: 'cash-register',
    name: translate('main_category_other'),
  },
};

export var getIcon = category => {
  return CATEGORIES[category].icon;
};

export var getName = category => {
  return CATEGORIES[category].name;
};

export var getColor = category => {
  return CATEGORIES[category].color;
};

export var getCategoryObject = category => {
  return CATEGORIES[category];
};

var Categories = {
  Vegtables: 'vgt',
  Fruits: 'fts',
  Dairy: 'dry',
  Meet: 'mef',
  Sweets: 'swt',
  Cereals: 'crl',
  Cleaning: 'cln',
  Other: 'oth',
};

export {Categories};
