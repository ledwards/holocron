import ReactNativeBlobUtil from 'react-native-blob-util';
import Card from '../models/Card';
const localCardFilePath = ReactNativeBlobUtil.fs.dirs.DocumentDir;

const readCardFilePromise = side => {
  return ReactNativeBlobUtil.fs
    .readFile(`${localCardFilePath}/${side}.json`, 'utf8')
    .then(data => {
      return JSON.parse(data)['cards'];
    })
    .catch(err => {
      console.log(err);
    });
};

const loadCardDefinitions = () => {
  return Promise.allSettled([
    readCardFilePromise('Dark'),
    readCardFilePromise('Light'),
  ]).then(results => {
    return results
      .map(r => {
        return r.value
          .map(c => new Card(c))
          .filter(c => !c.title.includes('AI)')) // excludes (AI) and (Holo AI)
          .filter(c => c.type != 'Game Aid')
          .sort((a, b) =>
            a.sortTitle > b.sortTitle ? 1 : b.sortTitle > a.sortTitle ? -1 : 0,
          );
      })
      .flat();
  });
};

export default loadCardDefinitions;
