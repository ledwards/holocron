import Field from '../models/Field';
import {
  ARRAY_COMPARATORS, STRING_COMPARATORS, NUMERIC_COMPARATORS,
  EQ_COMPARATOR, INCLUDES_COMPARATOR, STRING_EQUALS_COMPARATOR, SUBSTR_COMPARATOR,
} from './comparators';

const FIELDS = [
  new Field('ability', NUMERIC_COMPARATORS, EQ_COMPARATOR, ['a', 'ab']),
  new Field('armor', NUMERIC_COMPARATORS, EQ_COMPARATOR, ['ar', 'arm']),
  new Field('dsicons', NUMERIC_COMPARATORS, EQ_COMPARATOR, ['darksideicons', 'dark side icons', 'ds icons', 'dsi', 'ds force icons', 'dsforceicons', 'dark force icons', 'darkforceicons', 'dsforce', 'darksideforce', 'darkforce']),
  new Field('deploy', NUMERIC_COMPARATORS, EQ_COMPARATOR, ['d', 'dep']),
  new Field('destiny', NUMERIC_COMPARATORS, EQ_COMPARATOR, ['dest', 'des', 'destiny number', 'destiny value']),
  new Field('ferocity', NUMERIC_COMPARATORS, EQ_COMPARATOR, ['fer']),
  new Field('forfeit', NUMERIC_COMPARATORS, EQ_COMPARATOR, ['f', 'ff']),
  new Field('hyperspeed', NUMERIC_COMPARATORS, EQ_COMPARATOR, ['h', 'hs', 'hyp']),
  new Field('landspeed', NUMERIC_COMPARATORS, EQ_COMPARATOR, ['ls', 'land', 'lsp', 'lspd']),
  new Field('lsicons', NUMERIC_COMPARATORS, EQ_COMPARATOR, ['light side icons', 'ls icons', 'lsi', 'ls force icons', 'lsforceicons', 'light force icons', 'lightforceicons', 'lsforce', 'lightsideforce', 'lightforce']),
  new Field('maneuver', NUMERIC_COMPARATORS, EQ_COMPARATOR, ['m', 'man', 'mvr']),
  new Field('parsec', NUMERIC_COMPARATORS, EQ_COMPARATOR, ['parsec number', 'par', 'ps']),
  new Field('politics', NUMERIC_COMPARATORS, EQ_COMPARATOR, ['pol']),
  new Field('power', NUMERIC_COMPARATORS, EQ_COMPARATOR, ['p', 'pow', 'pwr']),

  new Field('extratext', STRING_COMPARATORS, SUBSTR_COMPARATOR, ['extra text', 'xtra', 'xt']),
  new Field('gametext', STRING_COMPARATORS, null, ['game text', 'gt', 'txt', 'text']),
  new Field('lore', STRING_COMPARATORS, null, ['l']),
  new Field('title', STRING_COMPARATORS, null, ['t', 'name']),
  new Field('type', STRING_COMPARATORS, null, []),

  new Field('characteristics', ARRAY_COMPARATORS, INCLUDES_COMPARATOR, ['characteristic', 'chars', 'char']),
  new Field('icons', ARRAY_COMPARATORS, INCLUDES_COMPARATOR, ['i']),
  new Field('rarity', STRING_COMPARATORS, STRING_EQUALS_COMPARATOR, ['r']),
  new Field('set', STRING_COMPARATORS, SUBSTR_COMPARATOR, []),
  new Field('side', STRING_COMPARATORS, STRING_EQUALS_COMPARATOR, []),
  new Field('subtype', STRING_COMPARATORS, SUBSTR_COMPARATOR, ['sub-type', 'sub type']),
  new Field('uniqueness', STRING_COMPARATORS, STRING_EQUALS_COMPARATOR, []),

  new Field('identities', ARRAY_COMPARATORS, INCLUDES_COMPARATOR, ['is', 'is a', 'is an', 'identity', 'ident', 'id', 'ids']),
  new Field('cancels', ARRAY_COMPARATORS, INCLUDES_COMPARATOR, ['cancels', 'cancel', 'is canceler for', 'iscancelerfor', 'iscancellerfor', 'is canceller for']),
  new Field('canceledby', ARRAY_COMPARATORS, INCLUDES_COMPARATOR, ['canceled by', 'cancelled by', 'cancels by', 'cancelsby', 'cancel by', 'cancelby', 'is canceled by', 'iscanceledby', 'is cancelled by', 'iscancelledby']),
  new Field('matching', ARRAY_COMPARATORS, INCLUDES_COMPARATOR, ['matches', 'match', 'm', 'is matching for', 'is match for']),
  new Field('matchingweapon', ARRAY_COMPARATORS, INCLUDES_COMPARATOR, ['matching weapon', 'matchingweapon', 'is matching weapon for']),
  new Field('pulledby', ARRAY_COMPARATORS, INCLUDES_COMPARATOR, ['pulled by', 'pulledby', 'is pulled by']),
  new Field('pulls', ARRAY_COMPARATORS, INCLUDES_COMPARATOR, ['pull', 'pulls', 'is puller for', 'ispullerfor']),
  new Field('underlyingcardfor', ARRAY_COMPARATORS, INCLUDES_COMPARATOR, ['is underlying card for', 'underlying card for', 'underlyingcardfor', 'underlying card', 'underlyingcard', 'underlying', 'undercard', 'uc']),

  // TODO: counterpart
];

export default FIELDS;
