import React, {useContext} from 'react';
import SearchableCardList from './SearchableCardList';
import ThemeContext from '../../contexts/ThemeContext';

type SearchScreenProps = {
  allCards: any;
  expansionSets: any;
};

const CardsScreen = (props: SearchScreenProps) => {
  const theme = useContext(ThemeContext);

  return (
    <>
      {props.allCards && props.allCards.length > 0 && (
        <SearchableCardList cards={props.allCards} theme={theme} />
      )}
    </>
  );
};

export default CardsScreen;
