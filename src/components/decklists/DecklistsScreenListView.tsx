import React, {useContext, useState, useEffect, useRef} from 'react';
import {useHeaderHeight} from '@react-navigation/elements';
import useBottomClearance from '../../lib/useBottomClearance';
import {
  View,
  ActivityIndicator,
  Text,
  Animated,
} from 'react-native';

import Card from '../../models/Card';

import DecklistEmptyFooter from './DecklistEmptyFooter';
import CardListItem from '../cards/CardListItem';
import CardPresenter from '../../presenters/CardPresenter';
import AllCardsContext from '../../contexts/AllCardsContext';

import styles from '../../styles/SearchableCardListStyles';
import layout from '../../constants/layout';
import ThemeContext from '../../contexts/ThemeContext';
import { Theme } from '../../types/interfaces';

const DecklistsScreenListView = ({route, embedded = false}: {route: any; embedded?: boolean}) => {
  const theme = useContext<Theme | null>(ThemeContext);
  const allCards = useContext(AllCardsContext);
  const flatListRef = useRef<any>(null);
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomClearance();

  const [data, setData] = useState<any[]>([]);
  const [state, setState] = useState<{
    loading: boolean;
    error: null | string;
  }>({
    loading: false,
    error: null,
  });

  useEffect(() => {
    // let items = [];
    // route.params.decklist.cards.forEach(card => {
    //   for (let i = 0; i < card.quantity; i++) {
    //     items.push(card);
    //   }
    // });
    // //

    setState({
      ...state,
      loading: false,
      error: null,
    });

    const decklistCards = route.params.decklist?.cards || [];
    const cards = decklistCards.map((card: {id: string}) => {
      if (allCards && card && card.id) {
        return allCards.find((c: Card) => c && c.id === card.id);
      }
      return null;
    });
    setData(cards);
  }, []);

  const EmptyListComponent = () => {
    return (
      <View
        style={{
          height: '100%',
          backgroundColor: theme?.backgroundColor,
        }}>
        <Text
          style={{
            color: theme?.foregroundColor,
            ...styles.defaultTextTitle,
          }}></Text>
        <Text
          style={{
            color: theme?.foregroundColor,
            ...styles.defaultTextDescription,
          }}></Text>
      </View>
    );
  };

  const SeparatorComponent = () => {
    return (
      <View
        style={{
          backgroundColor: theme?.dividerColor,
          ...styles.separator,
        }}
      />
    );
  };

  if (state.loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <>
      <Animated.FlatList
        testID="deck-card-list"
        ref={flatListRef}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{
          ...styles.flatListContentContainer,
          paddingTop: embedded ? 0 : headerHeight,
          paddingBottom: tabBarHeight + 16,
        }}
        data={data}
        renderItem={({item, index}) =>
          item && (
            <CardListItem
              item={new CardPresenter(item)}
              quantity={
                route.params.decklist?.cards?.find((c: {id: string; quantity: number}) => c.id === item.id)?.quantity || 1
              }
              index={index}
              flatListRef={flatListRef.current}
              scrollToIndex={(i: number) =>
                flatListRef.current?.scrollToIndex({
                  animated: true,
                  index: i,
                  // viewPosition: 0.5,
                  viewOffset: embedded ? 8 : headerHeight + 8,
                })
              }
            />
          )
        }
        ListEmptyComponent={() => EmptyListComponent()}
        ListHeaderComponent={() => <></>}
        ListHeaderComponentStyle={{
          backgroundColor: theme?.backgroundColor,
          borderColor: theme?.dividerColor,
          borderBottomWidth: 0,
        }}
        ListFooterComponent={() => <></>}
        ListFooterComponentStyle={{
          flexGrow: 1, // important!
          backgroundColor: theme?.backgroundColor,
          borderTopWidth: 0,
          borderColor: theme?.dividerColor,
        }}
        keyExtractor={(item, index) => `${index}_${item ? item.id : 0}`}
        ItemSeparatorComponent={SeparatorComponent}
        keyboardShouldPersistTaps="handled"
        //
        // Performance settings:
        initialNumToRender={10} // Reduce initial render amount
        removeClippedSubviews={true} // Unmount components when outside of window
        maxToRenderPerBatch={10} // Reduce number in each render batch
        updateCellsBatchingPeriod={100} // Increase time between renders
        windowSize={10} // Reduce the window size
      />
      <DecklistEmptyFooter
        nativeFooterHeight={layout.nativeFooterHeight()}
        tabBarHeight={layout.tabBarHeight()}
      />
    </>
  );
};

export default React.memo(DecklistsScreenListView);
