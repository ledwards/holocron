import {useEffect, useState, useContext} from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

import DecklistListItem from './DecklistListItem';
import DecklistSearchFooter from './DecklistSearchFooter';
import DecklistPresenter from '../../presenters/DecklistPresenter';
import AllDecklistsContext from '../../contexts/AllDecklistsContext';

import styles from '../../styles/SearchableDecklistListStyles';
import layout from '../../constants/layout';
import ThemeContext from '../../contexts/ThemeContext';
import { Theme } from '../../types/interfaces';

// TODO: once it works use context for theme
// and perhaps break out most of state god object?

interface SearchableDecklistListProps {
  nativeHeaderHeight: number;
  nativeFooterHeight: number;
  navigation: any;
}

interface SearchableDecklistListState {
  loading: boolean;
  flatListRef?: any;
  nativeHeaderHeight?: number;
  nativeFooterHeight?: number;
  error?: string | null;
}

const SearchableDecklistList = (props: SearchableDecklistListProps) => {
  const [query, setQuery] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [state, setState] = useState<SearchableDecklistListState>({
    loading: true,
  });
  const theme = useContext<Theme | null>(ThemeContext);
  const allDecklists = useContext(AllDecklistsContext) || [];

  useEffect(() => {
    setState(prevState => ({
      ...prevState,
      loading: false,
      flatListRef: null,
      nativeHeaderHeight: props.nativeHeaderHeight,
      nativeFooterHeight: props.nativeFooterHeight,
      error: null,
    }));
    setData([...allDecklists].reverse());
    setQuery('');
  }, []);

  useEffect(() => {
    if (query == '') {
      setData([...allDecklists].reverse());
    } else {
      searchFilterFunction();
    }
  }, [query]);

  const searchHandler = (text: string) => {
    const newInput = text.toLowerCase();
    setQuery(newInput);
    // this will trigger the searchFilterFunction via useEffect
  };

  const searchFilterFunction = () => {
    const newData = allDecklists
      .filter(decklist => {
        const textData = query;
        const itemData = decklist.searchData ? decklist.searchData() : '';

        // Allow for unorderd word matches
        const textDataList = textData.split(' ');
        const matches = textDataList.filter(
          (w: string) => itemData.indexOf(w) > -1,
        );

        return matches.length === textDataList.length;
      })
      .reverse();

    setData(newData);
  };

  const NoResultsListComponent = () => (
    <View style={styles.listEmptyContainer}>
      <Text
        style={{
          color: theme?.foregroundColor,
          fontSize: 16, // Default style instead of using unavailable styles.emptyListText
        }}>
        No results found
      </Text>
    </View>
  );

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
        contentContainerStyle={{
          ...styles.flatListContentContainer,
          minHeight: Dimensions.get('window').height,
        }}
        data={data}
        renderItem={({item, index}) => (
          <TouchableOpacity
            onPress={() => {
              props.navigation.navigate('View Decklist', {
                decklist: new DecklistPresenter(item),
              });
            }}
            activeOpacity={1}>
            <DecklistListItem
              theme={theme}
              item={new DecklistPresenter(item)}
              index={index}
            />
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => NoResultsListComponent()}
        ListHeaderComponent={() => <></>}
        ListHeaderComponentStyle={{
          backgroundColor: theme?.backgroundColor,
          borderColor: theme?.dividerColor,
          borderBottomWidth: query && data.length > 0 ? 2 : 0,
          height: layout.nativeHeaderHeight(),
        }}
        ListFooterComponent={() => <></>}
        ListFooterComponentStyle={{
          flexGrow: 1, // important!
          backgroundColor: theme?.backgroundColor,
          height: layout.footerHeight(layout.tabBarHeight(), undefined),
          // height: 800,
          borderTopWidth: query && data.length > 0 ? 2 : 0,
          borderColor: theme?.dividerColor,
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
      <DecklistSearchFooter
        query={query}
        nativeFooterHeight={layout.nativeFooterHeight()}
        searchBarHeight={layout.searchBarHeight()}
        data={data}
        searchCallback={searchHandler}
      />
    </>
  );
};

export default SearchableDecklistList;
