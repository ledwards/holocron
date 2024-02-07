import React, {useContext, useState, useEffect} from 'react';
import {
  ScrollView,
  View,
  ActivityIndicator,
  Text,
  Animated,
} from 'react-native';

import DecklistEmptyFooter from './DecklistEmptyFooter';
import CardListItem from '../cards/CardListItem';
import CardPresenter from '../../presenters/CardPresenter';
import AllCardsContext from '../../contexts/AllCardsContext';

import styles from '../../styles/SearchableCardListStyles';
import layout from '../../constants/layout';
import ThemeContext from '../../contexts/ThemeContext';

const DecklistsScreenListView = ({route}) => {
  const theme = useContext(ThemeContext);
  const allCards = useContext(AllCardsContext);

  const [data, setData] = useState([]);
  const [state, setState] = useState({
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

    const decklistCards = route.params.decklist.cards;
    const cards = decklistCards.map(card =>
      allCards.find(c => c.id === card.id),
    );
    setData(cards);
  }, []);

  const EmptyListComponent = () => {
    return (
      <View
        style={{
          height: '100%',
          backgroundColor: theme.backgroundColor,
        }}>
        <Text
          style={{
            color: theme.foregroundColor,
            ...styles.defaultTextTitle,
          }}></Text>
        <Text
          style={{
            color: theme.foregroundColor,
            ...styles.defaultTextDescription,
          }}></Text>
      </View>
    );
  };

  const SeparatorComponent = () => {
    return (
      <View
        style={{
          backgroundColor: theme.dividerColor,
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
          state.flatListRef = ref;
        }}
        contentContainerStyle={styles.flatListContentContainer}
        data={data}
        renderItem={({item, index}) => (
          <CardListItem
            item={new CardPresenter(item)}
            quantity={
              route.params.decklist.cards.find(c => c.id === item.id).quantity
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
        )}
        ListEmptyComponent={() => EmptyListComponent()}
        ListHeaderComponent={() => <></>}
        ListHeaderComponentStyle={{
          backgroundColor: theme.backgroundColor,
          borderColor: theme.dividerColor,
          borderBottomWidth: 0,
        }}
        ListFooterComponent={() => <></>}
        ListFooterComponentStyle={{
          flexGrow: 1, // important!
          backgroundColor: theme.backgroundColor,
          height: layout.footerHeight(layout.tabBarHeight()),
          borderTopWidth: 0,
          borderColor: theme.dividerColor,
        }}
        keyExtractor={(item, index) => `${index}_${item.id}`}
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
