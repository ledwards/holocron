import ReactNativeBlobUtil from 'react-native-blob-util';
import ExpansionSet from '../models/ExpansionSet';
import { ExpansionSetJSON } from '../types/interfaces';
import isExpectedMissingFileError from './isExpectedMissingFileError';
const localExpansionSetsFilePath = ReactNativeBlobUtil.fs.dirs.DocumentDir;

interface ExpansionSetsResponse {
  sets: ExpansionSetJSON[];
}

const normalizeExpansionSetsPayload = (
  payload: ExpansionSetsResponse | ExpansionSetJSON[],
): ExpansionSetJSON[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  return payload?.sets || [];
};

const fallbackExpansionSets = (): ExpansionSetJSON[] => {
  const fixture = require('../data/__fixtures__/sets.json') as ExpansionSetJSON[];
  return Array.isArray(fixture) ? fixture : [];
};

const loadExpansionSets = (): Promise<ExpansionSet[]> => {
  return ReactNativeBlobUtil.fs
    .readFile(`${localExpansionSetsFilePath}/sets.json`, 'utf8')
    .then((data: string) => {
      if (!data) {
        return [];
      }

      const parsed = JSON.parse(data) as ExpansionSetsResponse | ExpansionSetJSON[];
      return normalizeExpansionSetsPayload(parsed);
    })
    .catch(err => {
      if (!isExpectedMissingFileError(err)) {
        console.log(err);
      }
      return fallbackExpansionSets();
    })
    .then((results: ExpansionSetJSON[]) => {
      return (results || [])
        .filter((s: ExpansionSetJSON) => !s.legacy) // exclude legacy sets
        .map((s: ExpansionSetJSON) => new ExpansionSet(s));
    });
};

export default loadExpansionSets;
