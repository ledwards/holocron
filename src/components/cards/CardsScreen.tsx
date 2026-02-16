import React, {useContext} from 'react';
import {View, Text} from 'react-native';
import SearchableCardList from './SearchableCardList';
import AllCardsContext from '../../contexts/AllCardsContext';
import ThemeContext from '../../contexts/ThemeContext';
import Card from '../../models/Card';
import {Theme} from '../../types/interfaces';

const CardsScreen = () => {
  const allCardsContext = useContext(AllCardsContext);
  const allCards: Card[] = allCardsContext || [];
  const theme = useContext<Theme | null>(ThemeContext);

  return (
    <>
      {allCards.length > 0 && (
        <SearchableCardList cards={allCards} />
      )}
      {allCards.length === 0 && (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme?.backgroundColor,
            paddingHorizontal: 24,
          }}>
          <Text style={{color: theme?.foregroundColor, textAlign: 'center'}}>
            No card data is available yet. Connect to the internet and relaunch to download data.
          </Text>
        </View>
      )}
    </>
  );
};

export default CardsScreen;
