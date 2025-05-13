import React, {useContext} from 'react';
import SearchableCardList from './SearchableCardList';
import AllCardsContext from '../../contexts/AllCardsContext';
import Card from '../../models/Card';

interface CardsScreenProps {
  // No specific props needed currently, but defining the interface for future use
}

const CardsScreen = (props: CardsScreenProps) => {
  const allCards = useContext<Card[]>(AllCardsContext);

  return (
    <>
      {allCards && allCards.length > 0 && (
        <SearchableCardList cards={allCards} />
      )}
    </>
  );
};

export default CardsScreen;
