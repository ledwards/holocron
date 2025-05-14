import React, {useState, useEffect, useContext, useRef} from 'react';
import {View, ActivityIndicator, Text, Animated, FlatList} from 'react-native';

import CardListItem  from './CardListItem';
import CardSearchFooter from './CardSearchFooter';
import CardPresenter from '../../presenters/CardPresenter';
import FilterQuerySet from '../../models/FilterQuerySet';
import Card from '../../models/Card';

import styles from '../../styles/SearchableCardListStyles';
import layout from '../../constants/layout';
import AllCardsContext from '../../contexts/AllCardsContext';
import ThemeContext from '../../contexts/ThemeContext';
import {SearchMode, Theme, SearchCallback, ScrollToIndexFunction} from '../../types/interfaces';

/**
 * Props for SearchableCardList component
 */
interface SearchableCardListProps {
  cards: Card[];
  nativeHeaderHeight?: number;
  nativeFooterHeight?: number;
}

/**
 * State for SearchableCardList component
 */
interface SearchableCardListState {
  loading: boolean;
  error: null | Error;
  allCards: Card[];
  searchModeIndex: number;
  nativeHeaderHeight?: number;
  nativeFooterHeight?: number;
}

/**
 * Component for displaying a searchable list of cards
 */
const SearchableCardList: React.FC<SearchableCardListProps> = (props) => {
  // State variables
  const [query, setQuery] = useState<string>('');
  const [data, setData] = useState<Card[]>([]);
  const [filterQuerySet, setFilterQuerySet] = useState<FilterQuerySet>(new FilterQuerySet(''));
  const [state, setState] = useState<SearchableCardListState>({
    loading: false,
    error: null,
    allCards: props.cards,
    searchModeIndex: 0,
    nativeHeaderHeight: props.nativeHeaderHeight,
    nativeFooterHeight: props.nativeFooterHeight,
  });

  // FlatList reference for scrolling
  const flatListRef = useRef<FlatList<Card>>(null);

  // Get theme from context or provide default
  const themeContext = useContext(ThemeContext);
  const theme: Theme = themeContext || {
    name: 'dark',
    backgroundColor: '#000000',
    foregroundColor: '#FFFFFF',
    dividerColor: '#444444',
    translucentBackgroundColor: 'rgba(0,0,0,0.5)'
  };

  // Get cards from context or use empty array
  const allCardsContext = useContext(AllCardsContext);
  const allCards: Card[] = allCardsContext || [];

  // Initialize state on component mount
  useEffect(() => {
    setState({
      ...state,
      loading: false,
      error: null,
      searchModeIndex: 0,
      nativeHeaderHeight: props.nativeHeaderHeight,
      nativeFooterHeight: props.nativeFooterHeight,
    });
    setData([]);
    setQuery('');
    setFilterQuerySet(new FilterQuerySet(''));
  }, []);

  // Define search modes
  const searchModes: Record<number, SearchMode> = {
    0: {
      index: 0,
      label: 'title',
      icon: 'search-outline',
      title: 'Search cards by title',
      description:
        'quick draw \n\n farm \n\n chimaera \n\n destroyer \n\n dvdlots \n\n hdadtj',
    },
    1: {
      index: 1,
      label: 'natural language query',
      icon: 'color-filter-outline',
      title: 'Search cards with natural language (BETA) ',
      description: `gametext contains bad feeling \n\n gt c bad feeling \n\n lore matches isb \n\n lore m isb \n\n power = 9 \n\n pulls falcon \n\n subtype contains starting \n\n icons c pilot \n\n lore c isb and side=dark and type=character`,
    },
  };

  /**
   * Get the current search mode
   */
  const currentSearchMode = (): SearchMode => {
    return searchModes[state.searchModeIndex] || searchModes[0];
  };

  /**
   * Route search to the appropriate function based on search mode
   */
  const searchRouter: SearchCallback = (text: string): void => {
    text = text.toLowerCase();

    setQuery(text);

    switch (state.searchModeIndex) {
      case 0:
        searchFilterFunction(text);
        break;
      case 1:
        queryFilterFunction(text);
        break;
    }
  };

  /**
   * Process a natural language query filter
   */
  const queryFilterFunction = (text: string): boolean => {
    const newFilterQuerySet = new FilterQuerySet(text);

    setQuery(text);
    setFilterQuerySet(newFilterQuerySet);

    if (newFilterQuerySet.valid()) {
      const newData = newFilterQuerySet.execute(allCards);
      setData(newData);
    } else {
      setData([]);
    }

    return newFilterQuerySet.valid();
  };

  /**
   * Process a simple title search filter
   */
  const searchFilterFunction = (text: string): void => {
    const newData = allCards.filter(card => {
      const textData = text;
      const itemData = `${card.title} ${card.sortTitle} ${card.abbr || ' '}`
        .toLowerCase()
        .trim();

      // Allow for unordered word matches
      const textDataList = textData.split(' ');
      const matches = textDataList.filter(
        (w: string) => itemData.indexOf(w) > -1,
      );

      return matches.length === textDataList.length;
    });

    setData(newData);
  };

  /**
   * Toggle between search modes
   */
  const toggleSearchMode = (): void => {
    setQuery('');
    searchRouter('');
    setState({
      ...state,
      searchModeIndex: (state.searchModeIndex + 1) % 2,
    });
  };

  /**
   * Component to display when the list is empty and no search is performed
   */
  const EmptyListComponent = (): JSX.Element => {
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
          }}>
          {currentSearchMode().title}
        </Text>
        <Text
          style={{
            color: theme.foregroundColor,
            ...styles.defaultTextDescription,
          }}>
          {currentSearchMode().description}
        </Text>
      </View>
    );
  };

  /**
   * Component to display when a search returns no results
   */
  const NoResultsListComponent = (): JSX.Element => (
    <View style={styles.listEmptyContainer}>
      <Text
        style={{
          color: theme.foregroundColor,
          fontSize: 16,
          textAlign: 'center',
          padding: 20
        }}>
        No results found
      </Text>
    </View>
  );

  /**
   * Separator component for list items
   */
  const SeparatorComponent = (): JSX.Element => {
    return (
      <View
        style={{
          backgroundColor: theme.dividerColor,
          ...styles.separator,
        }}
      />
    );
  };

  /**
   * Scroll to a specific index in the list
   */
  const scrollToIndex: ScrollToIndexFunction = (index: number): void => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({
        animated: true,
        index: index,
        viewOffset: layout.nativeHeaderHeight(),
      });
    }
  };

  /**
   * Render card item for the FlatList
   */
  const renderItem = ({item, index}: {item: Card; index: number}) => {
    return (
      <CardListItem
        theme={theme}
        item={new CardPresenter(item)}
        index={index}
        scrollToIndex={scrollToIndex}
      />
    );
  };

  /**
   * Loading indicator
   */
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
        ref={flatListRef}
        contentContainerStyle={styles.flatListContentContainer}
        data={query ? data : []}
        renderItem={renderItem}
        ListEmptyComponent={query ? NoResultsListComponent : EmptyListComponent}
        ListHeaderComponent={() => <></>}
        ListHeaderComponentStyle={{
          backgroundColor: theme.backgroundColor,
          borderColor: theme.dividerColor,
          borderBottomWidth: query && data.length > 0 ? 2 : 0,
          height: layout.nativeHeaderHeight(),
        }}
        ListFooterComponent={() => <></>}
        ListFooterComponentStyle={{
          flexGrow: 1, // important!
          backgroundColor: theme.backgroundColor,
          height: layout.footerHeight(layout.tabBarHeight(), filterQuerySet),
          borderTopWidth: query && data.length > 0 ? 2 : 0,
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
      <CardSearchFooter
        query={query}
        filterQuerySet={filterQuerySet}
        nativeFooterHeight={layout.nativeFooterHeight()}
        searchBarHeight={layout.searchBarHeight()}
        tabBarHeight={layout.tabBarHeight()}
        searchMode={currentSearchMode()}
        allCards={allCards}
        data={data}
        searchCallback={searchRouter}
        toggleSearchMode={toggleSearchMode}
      />
    </>
  );
};

export default SearchableCardList;
