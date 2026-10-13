import React from 'react';
import DecklistPresenter from '../../presenters/DecklistPresenter';
import DecklistsScreenGridView from './DecklistsScreenGridView';
import DecklistsScreenListView from './DecklistsScreenListView';
import DecklistsScreenTextView from './DecklistsScreenTextView';

export type DeckDisplayMode = 'grid' | 'list' | 'text';
export default function AdaptiveDeckDetail({deck, mode = 'grid'}: {
  deck: DecklistPresenter; mode?: DeckDisplayMode;
}) {
  const route = {params: {decklist: deck}};
  return mode === 'grid' ? <DecklistsScreenGridView key={deck.slug} route={route} embedded />
    : mode === 'list' ? <DecklistsScreenListView key={deck.slug} route={route} embedded />
    : <DecklistsScreenTextView key={deck.slug} route={route} embedded />;
}
