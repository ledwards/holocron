import {Component} from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  Animated,
  KeyboardAvoidingView,
} from 'react-native';
import {SearchBar, Icon, Chip} from 'react-native-elements';
import {BlurView} from '@react-native-community/blur';

import CardListItem from './CardListItem';
import QueryStatusBar from './QueryStatusBar';
import CardSearchFooter from './CardSearchFooter';
import CardPresenter from '../presenters/CardPresenter';
import FilterQuerySet from '../models/FilterQuerySet';

import styles from '../styles/SearchableCardListStyles';
const searchBarHeight = 28; // not used to set height, used for other calculations

class SearchableCardList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      error: null,
      allCards: [], // all cards, doesn't change
      data: [], // currently filtered cards
      searchModeIndex: 0,
      query: '',
      filterQuerySet: new FilterQuerySet(''),
      flatListRef: null,
      theme: this.props.theme,
      nativeHeaderHeight: this.props.nativeHeaderHeight,
      nativeFooterHeight: this.props.nativeFooterHeight,
    };
  }

  readonly searchModes = {
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

  componentDidMount() {
    this.setState({
      data: this.props.cards,
      allCards: this.props.cards,
      theme: this.props.theme,
      error: null,
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.theme.name != this.props.theme.name) {
      this.setState({
        theme: this.props.theme,
      });
    }
  }

  currentSearchMode() {
    return this.searchModes[this.state.searchModeIndex] || 0;
  }

  debugger = filterQuerySet => {
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

  searchRouter = (text: string) => {
    text = text.toLowerCase();

    this.setState({
      query: text,
    });

    switch (this.state.searchModeIndex) {
      case 0:
        this.searchFilterFunction(text);
        break;
      case 1:
        this.queryFilterFunction(text);
        break;
    }
  };

  queryFilterFunction = (text: string) => {
    const filterQuerySet = new FilterQuerySet(text);

    this.setState({
      query: text,
      filterQuerySet: filterQuerySet,
    });

    // this.debugger(filterQuerySet); // Uncomment to help debug insane queries

    if (filterQuerySet.valid()) {
      const newData = filterQuerySet.execute(this.state.allCards);
      this.setState({data: newData});
    } else {
      this.setState({data: []});
    }

    return filterQuerySet.valid();
  };

  searchFilterFunction = (text: string) => {
    const newData = this.state.allCards.filter(card => {
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

    this.setState({
      data: newData,
    });
  };

  toggleSearchMode = () => {
    this.setState({query: null});
    this.searchRouter('');
    this.setState({
      searchModeIndex: (this.state.searchModeIndex + 1) % 2,
    });
  };

  renderEmptyListComponent = () => {
    return (
      <View style={styles.foo}>
        <Text
          style={{
            color: this.state.theme.foregroundColor,
            ...styles.defaultTextTitle,
          }}>
          {this.currentSearchMode().title}
        </Text>
        <Text
          style={{
            color: this.state.theme.foregroundColor,
            ...styles.defaultTextDescription,
          }}>
          {this.currentSearchMode().description}
        </Text>
      </View>
    );
  };

  renderNoResultsListComponent = () => (
    <View style={styles.listEmptyContainer}>
      <Text
        style={{
          color: this.state.theme.foregroundColor,
          ...styles.emptyListText,
        }}>
        No results found
      </Text>
    </View>
  );

  renderSeparatorComponent = () => {
    return (
      <View
        style={{
          backgroundColor: this.state.theme.dividerColor,
          ...styles.separator,
        }}
      />
    );
  };

  render() {
    if (this.state.loading) {
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
            this.state.flatListRef = ref;
          }}
          data={this.state.query ? this.state.data : []}
          renderItem={({item, index}) => (
            <CardListItem
              theme={this.state.theme}
              item={new CardPresenter(item)}
              index={index}
              flatListRef={this.state.flatListRef}
              scrollToIndex={(i: number) =>
                this.state.flatListRef.scrollToIndex({
                  animated: true,
                  index: i,
                  // viewPosition: 0.5,
                  viewOffset: this.state.nativeHeaderHeight,
                })
              }
            />
          )}
          ListEmptyComponent={() =>
            this.state.query
              ? this.renderNoResultsListComponent()
              : this.renderEmptyListComponent()
          }
          ListHeaderComponent={() => <></>}
          ListHeaderComponentStyle={{
            backgroundColor: this.state.theme.backgroundColor,
            height: this.state.nativeHeaderHeight,
            borderTopWidth: this.state.query ? 2 : 0,
            borderColor: this.state.theme.dividerColor,
          }}
          ListFooterComponent={() => <></>}
          ListFooterComponentStyle={{
            backgroundColor: this.state.theme.backgroundColor,
            height:
              this.state.nativeFooterHeight +
              this.state.filterQuerySet.viewHeight() -
              searchBarHeight,
            borderTopWidth: this.state.query ? 2 : 0,
            borderColor: this.state.theme.dividerColor,
          }}
          keyExtractor={(item, index) => `${index}_${item.id}`}
          ItemSeparatorComponent={this.renderSeparator}
          keyboardShouldPersistTaps="handled"
          // Performance settings
          initialNumToRender={10} // Reduce initial render amount
          removeClippedSubviews={true} // Unmount components when outside of window
          maxToRenderPerBatch={10} // Reduce number in each render batch
          updateCellsBatchingPeriod={100} // Increase time between renders
          windowSize={10} // Reduce the window size
        />
        <CardSearchFooter
          theme={this.state.theme}
          query={this.state.query}
          filterQuerySet={this.state.filterQuerySet}
          nativeFooterHeight={this.state.nativeFooterHeight}
          searchBarHeight={searchBarHeight}
          searchMode={this.currentSearchMode()}
          allCards={this.state.allCards}
          data={this.state.data}
          searchCallback={this.searchRouter}
          toggleSearchMode={this.toggleSearchMode}
        />
      </>
    );
  }
}

export default SearchableCardList;
