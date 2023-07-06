import Field from '../models/Field';
import { ARRAY_COMPARATORS, STRING_COMPARATORS, NUMERIC_COMPARATORS } from './comparators';

const FIELDS = [
  new Field('ability', NUMERIC_COMPARATORS, ['a', 'ab']),
  new Field('armor', NUMERIC_COMPARATORS, ['arm']),
  new Field('darkSideIcons', NUMERIC_COMPARATORS, ['darksideicons', 'dark side icons', 'ds icons', 'dsicons', 'dsi', 'ds force icons', 'dsforceicons', 'dark force icons', 'darkforceicons', 'dsforce', 'darksideforce', 'darkforce']),
  new Field('deploy', NUMERIC_COMPARATORS, ['d', 'dep']),
  new Field('destiny', NUMERIC_COMPARATORS, ['dest', 'des', 'destiny number', 'destiny value']),
  new Field('ferocity', NUMERIC_COMPARATORS, ['fer']),
  new Field('forfeit', NUMERIC_COMPARATORS, ['ff']),
  new Field('hyperspeed', NUMERIC_COMPARATORS, ['hs']),
  new Field('landspeed', NUMERIC_COMPARATORS, ['ls']),
  new Field('lightSideIcons', NUMERIC_COMPARATORS, ['light side icons', 'ls icons', 'lsicons', 'lsi', 'ls force icons', 'lsforceicons', 'light force icons', 'lightforceicons', 'lsforce', 'lightsideforce', 'lightforce']),
  new Field('maneuver', NUMERIC_COMPARATORS, ['man']),
  new Field('parsec', NUMERIC_COMPARATORS, ['parsec number', 'par']),
  new Field('politics', NUMERIC_COMPARATORS, ['pol']),
  new Field('power', NUMERIC_COMPARATORS, ['p', 'pow', 'pwr']),

  new Field('extraText', STRING_COMPARATORS, ['extratext', 'extra text']),
  new Field('gametext', STRING_COMPARATORS, ['game text']),
  new Field('lore', STRING_COMPARATORS, ['l']),
  new Field('title', STRING_COMPARATORS, ['t']),
  new Field('type', STRING_COMPARATORS, []),

  new Field('characteristics', ARRAY_COMPARATORS, ['characteristic']),
  new Field('icons', ARRAY_COMPARATORS, ['i']),
  new Field('rarity', STRING_COMPARATORS, ['r']),
  new Field('set', STRING_COMPARATORS, []),
  new Field('side', STRING_COMPARATORS, []),
  new Field('subType', STRING_COMPARATORS, ['sub-type', 'subtype', 'sub type']),
  new Field('uniqueness', STRING_COMPARATORS, []),
];

export default FIELDS;
