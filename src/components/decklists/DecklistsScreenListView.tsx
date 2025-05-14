import React, {useContext, useState, useEffect} from 'react';
import {
  ScrollView,
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

const DecklistsScreenListView = ({route}: {route: any}) => {
  const theme = useContext<Theme | null>(ThemeContext);
  const allCards = useContext(AllCardsContext);

  const [data, setData] = useState<any[]>([]);
  const [state, setState] = useState<{
    loading: boolean;
    error: null | string;
    flatListRef: any;
  }>({
    loading: false,
    error: null,
    flatListRef: null,
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
      flatListRef: null,
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
        ref={ref => {
          setState(prevState => ({
            ...prevState,
            flatListRef: ref
          }));
        }}
        contentContainerStyle={styles.flatListContentContainer}
        data={data}
        renderItem={({item, index}) =>
          item && (
            <CardListItem
              item={new CardPresenter(item)}
              quantity={
                route.params.decklist?.cards?.find((c: {id: string; quantity: number}) => c.id === item.id)?.quantity || 1
              }
              index={index}
              flatListRef={state.flatListRef}
              scrollToIndex={(i: number) =>
                state.flatListRef.scrollToIndex({
                  animated: true,
                  index: i,
                  // viewPosition: 0.5,
                  viewOffset: layout.nativeHeaderHeight(),
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
          height: layout.footerHeight(layout.tabBarHeight(), undefined),
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
