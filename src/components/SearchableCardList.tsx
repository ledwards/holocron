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
import CardPresenter from '../presenters/CardPresenter';
import FilterQuerySet from '../models/FilterQuerySet';
import FilterQuery from '../models/FilterQuery';

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

  readonly searchModes = {
    0: {
      label: 'title',
      icon: 'search-outline',
      title: 'Search cards by title',
      description:
        'quick draw \n\n farm \n\n chimaera \n\n destroyer \n\n dvdlots \n\n hdadtj',
    },
    1: {
      label: 'natural language query',
      icon: 'color-filter-outline',
      title: 'Search cards with natural language (BETA) ',
      description: `gametext contains bad feeling \n\n gt c bad feeling \n\n lore matches isb \n\n lore m isb \n\n power = 9 \n\n pulls falcon \n\n subtype contains starting \n\n icons c pilot \n\n lore c isb and side=dark and type=character`,
    },
  };

  currentSearchMode() {
    return this.searchModes[this.state.searchModeIndex] || 0;
  }

  renderSeparator = () => {
    return (
      <View
        style={{
          backgroundColor: this.state.theme.dividerColor,
          ...styles.separator,
        }}
      />
    );
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

      this.setState({
        data: newData,
      });
    } else {
      this.setState({
        data: [],
      });
    }

    return filterQuerySet.valid();
  };

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

  searchFilterFunction = (text: string) => {
    console.log('searching for:', text);

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

  // note: this header is badly named, as it appears on the bottom of the screen...
  renderHeader = () => {
    return (
      <KeyboardAvoidingView behavior="position">
        <View
          // contains entire header: search bar and filter queries
          style={{
            ...styles.headerContainer,
            backgroundColor: this.state.theme.translucentBackgroundColor,
            height:
              this.state.filterQuerySet.viewHeight() +
              this.state.nativeFooterHeight -
              searchBarHeight,
          }}>
          <BlurView
            style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              height: this.state.filterQuerySet.viewHeight() + 20, // magic number
            }}
            blurType={this.state.theme.name}
            blurAmount={10}
            reducedTransparencyFallbackColor={
              this.state.theme.translucentBackgroundColor
            }
          />
          <View style={styles.filterQuerySetContainer}>
            {!this.state.query && (
              <View style={styles.defaultTextContainer}>
                <Text
                  style={{
                    color: this.state.theme.foregroundColor,
                  }}>
                  Tap the
                </Text>
                <Icon
                  name={this.currentSearchMode().icon}
                  type="ionicon"
                  color={this.state.theme.foregroundColor}
                  size={16}
                  style={styles.defaultTextIcon}
                />
                <Text
                  style={{
                    color: this.state.theme.foregroundColor,
                  }}>
                  icon to switch between search modes.
                </Text>
              </View>
            )}

            {this.state.filterQuerySet.filterQueries.map(
              (filterQuery: FilterQuery, i: number) => (
                <View
                  key={`filterQuery_${i}`}
                  style={{
                    ...styles.filterQueryContainer,
                  }}>
                  {this.state.searchModeIndex == 1 && filterQuery.query && (
                    <Chip
                      title={filterQuery.displayFieldName()}
                      key={`$filter_query_{i}_field`}
                      type="outline"
                      buttonStyle={{
                        backgroundColor: filterQuery.validField()
                          ? this.state.theme.chipYesBackgroundColor
                          : this.state.theme.chipNoBackgroundColor,
                        borderColor: filterQuery.validField()
                          ? this.state.theme.chipYesBorderColor
                          : this.state.theme.chipNoBorderColor,
                        ...styles.chipButton,
                      }}
                      titleStyle={{
                        color: filterQuery.validField()
                          ? this.state.theme.chipYesTextColor
                          : this.state.theme.chipNoTextColor,
                        ...styles.chipTitle,
                      }}
                      containerStyle={styles.chipContainer}></Chip>
                  )}

                  {this.state.searchModeIndex == 1 &&
                    (filterQuery.comparator ||
                      filterQuery.partiallyValidComparator()) &&
                    !(
                      filterQuery.usingDefaultComparator() &&
                      filterQuery.comparator.name == 'includes'
                    ) && (
                      <Chip
                        title={filterQuery.displayComparatorName()}
                        key={`filter_query_${i}_comparator`}
                        type="outline"
                        buttonStyle={{
                          backgroundColor: filterQuery.validComparator()
                            ? this.state.theme.chipYesBackgroundColor
                            : this.state.theme.chipNoBackgroundColor,
                          borderColor: filterQuery.validComparator()
                            ? this.state.theme.chipYesBorderColor
                            : this.state.theme.chipNoBorderColor,
                          ...styles.chipButton,
                        }}
                        titleStyle={{
                          color: filterQuery.validComparator()
                            ? this.state.theme.chipYesTextColor
                            : this.state.theme.chipNoTextColor,
                          ...styles.chipTitle,
                        }}
                        containerStyle={styles.chipContainer}></Chip>
                    )}

                  {this.state.searchModeIndex == 1 && filterQuery.value && (
                    <Chip
                      title={filterQuery.rawValue}
                      key={'value'}
                      type="outline"
                      buttonStyle={{
                        backgroundColor:
                          filterQuery.validValue() &&
                          filterQuery.length(this.state.allCards) > 0
                            ? this.state.theme.chipYesBackgroundColor
                            : this.state.theme.chipNoBackgroundColor,
                        borderColor:
                          filterQuery.validValue() &&
                          filterQuery.length(this.state.allCards) > 0
                            ? this.state.theme.chipYesBorderColor
                            : this.state.theme.chipNoBorderColor,
                        ...styles.chipButton,
                      }}
                      titleStyle={{
                        color:
                          filterQuery.validValue() &&
                          filterQuery.length(this.state.allCards) > 0
                            ? this.state.theme.chipYesTextColor
                            : this.state.theme.chipNoTextColor,
                        ...styles.chipTitle,
                      }}
                      containerStyle={styles.chipContainer}></Chip>
                  )}

                  {this.state.query != '' &&
                    this.state.searchModeIndex == 0 && (
                      <Chip
                        title={this.state.query}
                        key={'value'}
                        type="outline"
                        buttonStyle={{
                          backgroundColor:
                            this.state.theme.chipYesBackgroundColor,
                          borderColor: this.state.theme.chipYesBorderColor,
                          ...styles.chipButton,
                        }}
                        titleStyle={{
                          color: this.state.theme.chipYesTextColor,
                          ...styles.chipTitle,
                        }}
                        containerStyle={styles.chipContainer}
                      />
                    )}

                  <Text
                    style={{
                      color: this.state.theme.foregroundColor,
                      ...styles.resultsCount,
                    }}>
                    {this.state.query
                      ? `(${
                          // filterQuery.execute(this.state.allCards).length
                          this.state.data.length
                        } results)`
                      : ''}
                  </Text>
                </View>
              ),
            )}
            {this.state.query && this.state.filterQuerySet.length() > 1 && (
              <Text
                style={{
                  color: this.state.theme.foregroundColor,
                  backgroundColor: 'transparent',
                  ...styles.combinedResultsCount,
                }}>
                {`(combined ${this.state.data.length} results)`}
              </Text>
            )}
          </View>

          <SearchBar
            placeholder={`Search by ${this.currentSearchMode().label}`}
            round
            onChangeText={text => this.searchRouter(text)}
            autoCorrect={false}
            value={this.state.query}
            containerStyle={{
              ...styles.searchBarContainer,
              bottom: this.state.nativeFooterHeight,
              height: this.state.nativeFooterHeight, // for symmetry
            }}
            inputContainerStyle={{
              backgroundColor: this.state.theme.secondaryBackgroundColor,
            }}
            searchIcon={
              <Icon
                name={this.currentSearchMode().icon}
                type="ionicon"
                color={this.state.theme.iconColor}
                onPress={() => {
                  this.setState({query: null});
                  this.searchRouter('');
                  this.setState({
                    searchModeIndex: (this.state.searchModeIndex + 1) % 2,
                  });
                }}></Icon>
            }></SearchBar>
        </View>
      </KeyboardAvoidingView>
    );
  };

  renderEmptyState = () => {
    return (
      <>
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
      </>
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
            this.state.query ? (
              <View style={styles.defaultTextContainer}>
                <Text
                  style={{
                    color: this.state.theme.foregroundColor,
                    ...styles.emptyListText,
                  }}>
                  No results found
                </Text>
              </View>
            ) : (
              this.renderEmptyState()
            )
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
        {this.renderHeader()}
      </>
    );
  }
}

export default SearchableCardList;
