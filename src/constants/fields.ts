import Field from '../models/Field';
import { ARRAY_COMPARATORS, STRING_COMPARATORS, NUMERIC_COMPARATORS, IDENTITY_COMPARATORS } from './comparators';

const FIELDS = [
  new Field('ability', NUMERIC_COMPARATORS, ['a', 'ab']),
  new Field('armor', NUMERIC_COMPARATORS, ['arm']),
  new Field('dsicons', NUMERIC_COMPARATORS, ['darksideicons', 'dark side icons', 'ds icons', 'dsi', 'ds force icons', 'dsforceicons', 'dark force icons', 'darkforceicons', 'dsforce', 'darksideforce', 'darkforce']),
  new Field('deploy', NUMERIC_COMPARATORS, ['d', 'dep']),
  new Field('destiny', NUMERIC_COMPARATORS, ['dest', 'des', 'destiny number', 'destiny value']),
  new Field('ferocity', NUMERIC_COMPARATORS, ['fer']),
  new Field('forfeit', NUMERIC_COMPARATORS, ['ff']),
  new Field('hyperspeed', NUMERIC_COMPARATORS, ['hs']),
  new Field('landspeed', NUMERIC_COMPARATORS, ['ls']),
  new Field('lsicons', NUMERIC_COMPARATORS, ['light side icons', 'ls icons', 'lsi', 'ls force icons', 'lsforceicons', 'light force icons', 'lightforceicons', 'lsforce', 'lightsideforce', 'lightforce']),
  new Field('maneuver', NUMERIC_COMPARATORS, ['man']),
  new Field('parsec', NUMERIC_COMPARATORS, ['parsec number', 'par']),
  new Field('politics', NUMERIC_COMPARATORS, ['pol']),
  new Field('power', NUMERIC_COMPARATORS, ['p', 'pow', 'pwr']),

  new Field('extratext', STRING_COMPARATORS, ['extra text']),
  new Field('gametext', STRING_COMPARATORS, ['game text']),
  new Field('lore', STRING_COMPARATORS, ['l']),
  new Field('title', STRING_COMPARATORS, ['t', 'name']),
  new Field('type', STRING_COMPARATORS, []),

  new Field('characteristics', ARRAY_COMPARATORS, ['characteristic', 'chars', 'char']),
  new Field('icons', ARRAY_COMPARATORS, ['i']),
  new Field('rarity', STRING_COMPARATORS, ['r']),
  new Field('set', STRING_COMPARATORS, []),
  new Field('side', STRING_COMPARATORS, []),
  new Field('subtype', STRING_COMPARATORS, ['sub-type', 'sub type']),
  new Field('uniqueness', STRING_COMPARATORS, []),

  new Field('identities', IDENTITY_COMPARATORS, ['', 'identity', 'ident', 'id']),
];

export default FIELDS;
