import React, {useContext} from 'react';
import {View, Text, ActivityIndicator} from 'react-native';
import SearchableCardList from './SearchableCardList';
import AllCardsContext from '../../contexts/AllCardsContext';
import CardDataStatusContext from '../../contexts/CardDataStatusContext';
import ThemeContext from '../../contexts/ThemeContext';
import Card from '../../models/Card';
import {Theme} from '../../types/interfaces';

const CardsScreen = () => {
  const allCardsContext = useContext(AllCardsContext);
  const allCards: Card[] = allCardsContext || [];
  const theme = useContext<Theme | null>(ThemeContext);
  const status = useContext(CardDataStatusContext);

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
          {status === 'loading' && <ActivityIndicator testID="cards-loading" size="large" color={theme?.foregroundColor} />}
          <Text accessibilityLiveRegion="polite" style={{color: theme?.foregroundColor, textAlign: 'center', marginTop: 12}}>
            {status === 'loading' ? 'Loading cards…' : 'Unable to load card data. Please reopen the app to try again.'}
          </Text>
        </View>
      )}
    </>
  );
};

export default CardsScreen;
