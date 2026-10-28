import {useEffect, useState, useContext, useRef, useMemo, useCallback} from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  Animated,
  TouchableOpacity,
  Dimensions,
  Keyboard,
} from 'react-native';
import useBottomClearance from '../../lib/useBottomClearance';
import {useHeaderHeight} from '@react-navigation/elements';

import DecklistListItem from './DecklistListItem';
import DecklistSearchFooter from './DecklistSearchFooter';
import DecklistPresenter from '../../presenters/DecklistPresenter';
import AllDecklistsContext from '../../contexts/AllDecklistsContext';

import styles from '../../styles/SearchableDecklistListStyles';
import ThemeContext from '../../contexts/ThemeContext';
import { Theme } from '../../types/interfaces';

// TODO: once it works use context for theme
// and perhaps break out most of state god object?

interface SearchableDecklistListProps {
  nativeHeaderHeight: number;
  nativeFooterHeight: number;
  navigation?: any;
  onSelect?: (deck: DecklistPresenter) => void;
  selectedSlug?: string;
  embedded?: boolean;
}

interface SearchableDecklistListState {
  loading: boolean;
  nativeHeaderHeight?: number;
  nativeFooterHeight?: number;
  error?: string | null;
}

const SearchableDecklistList = (props: SearchableDecklistListProps) => {
  const [query, setQuery] = useState('');
  const [data, setData] = useState<any[]>([]);
  const flatListRef = useRef<any>(null);
  const [state, setState] = useState<SearchableDecklistListState>({
    loading: true,
  });
  const theme = useContext<Theme | null>(ThemeContext);
  const allDecklists = useContext(AllDecklistsContext) || [];
  const bottomClearance = useBottomClearance(58);
  const headerHeight = useHeaderHeight();

  useEffect(() => {
    setState(prevState => ({
      ...prevState,
      loading: false,
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
  }, [query, allDecklists]);

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

  const SeparatorComponent = useCallback(() => {
    return (
      <View
        style={{
          backgroundColor: theme?.dividerColor,
          ...styles.separator,
        }}
      />
    );
  }, [theme?.dividerColor]);

  const dockDynamicHeight = 16 + 34 + 56 + bottomClearance + 2;
  const presentedData = useMemo(
    () => data.map(decklist => new DecklistPresenter(decklist)),
    [data],
  );
  const renderDecklistItem = useCallback(
    ({item, index}: {item: DecklistPresenter; index: number}) => (
      <TouchableOpacity testID={`decklist-row-${index}`}
        accessibilityLabel={item.displayTitle} accessibilityRole="button"
        accessibilityState={{selected: props.selectedSlug === item.slug}}
        activeOpacity={1}
        onPress={() => {
          Keyboard.dismiss();
          if (props.onSelect) props.onSelect(item);
          else props.navigation?.navigate('View Decklist', {decklist: item});
        }}>
        <DecklistListItem theme={theme} item={item} index={index} />
      </TouchableOpacity>
    ),
    [props.onSelect, props.navigation, props.selectedSlug, theme],
  );

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
        contentContainerStyle={{
          ...styles.flatListContentContainer,
          minHeight: Dimensions.get('window').height,
          paddingTop: props.embedded ? 0 : Math.max(headerHeight - 2, 0),
          paddingBottom: dockDynamicHeight + 8,
        }}
        contentInsetAdjustmentBehavior="never"
        data={presentedData}
        renderItem={renderDecklistItem}
        ListEmptyComponent={() => NoResultsListComponent()}
        ListHeaderComponent={() => <></>}
        ListHeaderComponentStyle={{
          backgroundColor: theme?.backgroundColor,
          borderColor: theme?.dividerColor,
          borderBottomWidth: query && data.length > 0 ? 2 : 0,
          height: 0,
        }}
        ListFooterComponent={() => <></>}
        ListFooterComponentStyle={{
          flexGrow: 1, // important!
          backgroundColor: theme?.backgroundColor,
          height: 0,
          // height: 800,
          borderTopWidth: query && data.length > 0 ? 2 : 0,
          borderColor: theme?.dividerColor,
        }}
        keyExtractor={(item, index) => `${index}_${item.slug || index}`}
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
        data={data}
        searchCallback={searchHandler}
      />
    </>
  );
};

export default SearchableDecklistList;
