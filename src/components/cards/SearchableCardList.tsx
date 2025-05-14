import {useState, useEffect, useContext} from 'react';
import {View, ActivityIndicator, Text, Animated} from 'react-native';

import CardListItem from './CardListItem';
import CardSearchFooter from './CardSearchFooter';
import CardPresenter from '../../presenters/CardPresenter';
import FilterQuerySet from '../../models/FilterQuerySet';
import Card from '../../models/Card';

import styles from '../../styles/SearchableCardListStyles';
import layout from '../../constants/layout';
import AllCardsContext from '../../contexts/AllCardsContext';
import ThemeContext from '../../contexts/ThemeContext';
import { SearchMode, Theme } from '../../types/interfaces';

interface SearchableCardListProps {
  cards: Card[];
  nativeHeaderHeight?: number;
  nativeFooterHeight?: number;
}

interface SearchableCardListState {
  loading: boolean;
  error: null | Error;
  allCards: Card[];
  searchModeIndex: number;
  flatListRef: any;
  nativeHeaderHeight?: number;
  nativeFooterHeight?: number;
}

const SearchableCardList = (props: SearchableCardListProps) => {
  const [query, setQuery] = useState<string>('');
  const [data, setData] = useState<Card[]>([]);
  const [filterQuerySet, setFilterQuerySet] = useState<FilterQuerySet | undefined>();
  const [state, setState] = useState<SearchableCardListState>({
    loading: false,
    error: null,
    allCards: props.cards,
    searchModeIndex: 0,
    flatListRef: null,
    nativeHeaderHeight: props.nativeHeaderHeight,
    nativeFooterHeight: props.nativeFooterHeight,
  });
  const theme = useContext<Theme>(ThemeContext);
  const allCards = useContext<Card[]>(AllCardsContext);

  useEffect(() => {
    setState({
      ...state,
      loading: false,
      error: null,
      searchModeIndex: 0,
      flatListRef: null,
      nativeHeaderHeight: props.nativeHeaderHeight,
      nativeFooterHeight: props.nativeFooterHeight,
    });
    setData([]);
    setQuery('');
    setFilterQuerySet(new FilterQuerySet(''));
  }, []);

  // Using SearchMode interface imported from ../../types/interfaces

  const searchModes: Record<number, SearchMode> = {
    0: {
      index: 0, // existence of this is proof that this should be a class
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

  const currentSearchMode = (): SearchMode => {
    return searchModes[state.searchModeIndex] || searchModes[0];
  };

  const debug = (filterQuerySet: FilterQuerySet): void => {
    console.log('====');
    console.log('text entry: ', text);
    console.log('====');
    filterQuerySet.filterQueries.forEach(filterQuery => {
      console.log('field: ', filterQuery.field?.name);
      console.log('rawField', filterQuery.rawField);
      console.log('validField: ', filterQuery.validField());
      console.log('comparator: ', filterQuery.comparator?.name);
      console.log('rawComparator: ', filterQuery.rawComparator);
      console.log('validComparator: ', filterQuery.validComparator());
      console.log('value: ', filterQuery.value);
      console.log('rawValue: ', filterQuery.rawValue);
      console.log('validValue: ', filterQuery.validValue());
      console.log('filter: ', typeof filterQuery.filter);
      console.log('valid?: ', filterQuery.valid());
      console.log('\n');
    });
    console.log('\n');
  };

  const searchRouter = (text: string): void => {
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

  const queryFilterFunction = (text: string): boolean => {
    const filterQuerySet = new FilterQuerySet(text);

    setQuery(text);
    setFilterQuerySet(filterQuerySet);

    // debug(filterQuerySet); // Uncomment to help debug insane queries

    if (filterQuerySet.valid()) {
      const newData = filterQuerySet.execute(allCards);
      setData(newData);
    } else {
      setData([]);
    }

    return filterQuerySet.valid();
  };

  const searchFilterFunction = (text: string): void => {
    const newData = allCards.filter(card => {
      const textData = text;
      const itemData = `${card.title} ${card.sortTitle} ${card.abbr || ' '}`
        .toLowerCase()
        .trim();

      // Allow for unorderd word matches
      const textDataList = textData.split(' ');
      const matches = textDataList.filter(
        (w: string) => itemData.indexOf(w) > -1,
      );

      return matches.length === textDataList.length;
    });

    setData(newData);
  };

  const toggleSearchMode = (): void => {
    setQuery(null);
    searchRouter('');
    setState({
      ...state,
      searchModeIndex: (state.searchModeIndex + 1) % 2,
    });
  };

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

  const NoResultsListComponent = (): JSX.Element => (
    <View style={styles.listEmptyContainer}>
      <Text
        style={{
          color: theme.foregroundColor,
          ...styles.emptyListText,
        }}>
        No results found
      </Text>
    </View>
  );

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
        data={query ? data : []}
        renderItem={({item, index}) => (
          <CardListItem
                theme={theme}
                item={new CardPresenter(item)}
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
        ListEmptyComponent={() =>
          query ? NoResultsListComponent() : EmptyListComponent()
        }
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
