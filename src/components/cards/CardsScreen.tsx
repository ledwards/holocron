import React, {useContext} from 'react';
import SearchableCardList from './SearchableCardList';
import AllCardsContext from '../../contexts/AllCardsContext';
import Card from '../../models/Card';

const CardsScreen = () => {
  const allCardsContext = useContext(AllCardsContext);
  const allCards: Card[] = allCardsContext || [];

  return (
    <>
      {allCards.length > 0 && (
        <SearchableCardList cards={allCards} />
      )}
    </>
  );
};

export default CardsScreen;
