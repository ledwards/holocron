import Card from './Card';

const searchableTitle = (card: Card): string =>
  `${card.title} ${card.sortTitle} ${card.abbr || ' '}`.toLowerCase().trim();

/**
 * Title search mode. Every typed word must appear in the card's title,
 * normalized title, or an abbreviation, in any order.
 *
 * When that finds nothing, the words are matched again with spaces removed
 * from the title, so "darthvader" finds "Darth Vader". Input that already
 * finds cards is never widened.
 */
export const searchCardsByTitle = (cards: Card[], text: string): Card[] => {
  const words = text.toLowerCase().split(' ');
  const found = cards.filter(card => {
    const title = searchableTitle(card);
    return words.every(word => title.indexOf(word) > -1);
  });

  const typed = words.filter(Boolean);
  if (found.length || !typed.length) {
    return found;
  }

  return cards.filter(card => {
    const title = searchableTitle(card).replace(/\s+/g, '');
    return typed.every(word => title.includes(word));
  });
};
