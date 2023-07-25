import Card from '../models/Card'
import darkCards from '../../data/Dark.json'
import lightCards from '../../data/Light.json'

const allCards = [...darkCards.cards, ...lightCards.cards].map(c => new Card(c))

const aliases = {};

allCards.forEach(card => {
  const abbrs = card.abbr || [];
  abbrs.forEach(a => {
    const key = a.split('/')[0].replaceAll(/[^a-zA-Z0-9 -]/g, '').toLowerCase();
    aliases[key] = card.title.replaceAll(/[^a-zA-Z0-9 -]/g, '').toLowerCase();
  }); // should this actually be an array? Can two aliases go to the same thing?
});

export default function(a: string) {
  return aliases[a] || a;
}
