import Card from '../models/Card';
import type {CardListItemProps} from '../components/cards/CardListItem';
import {CardSide} from '../types/enums';
import CardPresenter from './CardPresenter';
import {DetailCard} from '../types/adaptive';

interface RawEntry {
  id?: string;
  title?: string;
  quantity?: number;
  type?: string;
  subType?: string;
  imageUrl?: string;
  imageBackUrl?: string;
}
export interface DeckEntry extends DetailCard {
  quantity: number;
  listItem: CardListItemProps['item'];
}

/** Accept both the public array payload and older ID-to-quantity caches. */
export function deckEntries(raw: unknown, allCards: Card[]): DeckEntry[] {
  const entries: RawEntry[] = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object'
    ? Object.entries(raw).map(([id, quantity]) => ({
        id,
        quantity: Number(quantity),
      }))
    : [];
  const byId = new Map(allCards.map(card => [card.id, card]));
  return entries.map((entry, index) => {
    const model = byId.get(String(entry.id));
    const card = model ? new CardPresenter(model) : null;
    return {
      id: String(entry.id || `unmatched-${index}`),
      title:
        card?.displayTitle || entry.title || String(entry.id || 'Unknown card'),
      imageUrl: card?.displayImageUrl || entry.imageUrl || '',
      backImageUrl: card?.displayBackImageUrl || entry.imageBackUrl,
      sideways: card?.sideways ?? entry.subType === 'Site',
      type: card?.displayType || entry.type || 'Other',
      listItem: card || {
        displayTitle: entry.title || String(entry.id || 'Unknown card'),
        displayImageUrl: entry.imageUrl || '', displayBackImageUrl: entry.imageBackUrl || '',
        displayExpansionSet: '', type: entry.type || '', rarity: '', side: CardSide.Light,
        sideways: entry.subType === 'Site', aspectRatio: entry.subType === 'Site' ? 339 / 475 : 475 / 339,
        twoSided: !!entry.imageBackUrl, offsetY: entry.subType === 'Site' ? -30 : entry.type === 'Objective' ? -10 : 0,
      },
      quantity: Math.max(1, Math.floor(Number(entry.quantity) || 1)),
    };
  });
}
