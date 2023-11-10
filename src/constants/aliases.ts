import loadCardDefinitions from '../lib/LoadCardDefinitions';

// TODO: add aliases for e.g. virtual sets from ../../data/ExpansionSets.json file
// TODO: "unique", "non-unique"
// TODO: array of aliases, e.g. BF = Babu Frik and Boba Fett

// const allCards = loadCardDefinitions();
const aliases = {};

// allCards.forEach(card => {
//   const abbrs = card.abbr || [];
//   abbrs.forEach(a => {
//     const key = a
//       .split('/')[0]
//       .replaceAll(/[^a-zA-Z0-9 -]/g, '')
//       .toLowerCase();
//     aliases[key] = card.title.replaceAll(/[^a-zA-Z0-9 -]/g, '').toLowerCase();
//   }); // should this actually be an array? Can two aliases go to the same thing?
// });

export default function (a: string) {
  return aliases[a] || a;
}
