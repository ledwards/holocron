import React, {useContext} from 'react';
import SearchableCardList from './SearchableCardList';
import AllCardsContext from '../../contexts/AllCardsContext';

const CardsScreen = props => {
  const allCards = useContext(AllCardsContext);

  return (
    <>
      {allCards && allCards.length > 0 && (
        <SearchableCardList cards={allCards} />
      )}
    </>
  );
};

export default CardsScreen;
