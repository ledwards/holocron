import React, { Component } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Animated } from 'react-native';
import { SearchBar, Icon, Chip } from 'react-native-elements';
import CardListItem from './CardListItem'

import Card from '../models/Card'
import FilterQuery from '../models/FilterQuery'

import alias from '../constants/aliases';

import darkCards from '../../data/Dark.json';
import lightCards from '../../data/Light.json';

const lightColor = 'rgba(219, 227, 232, 1.0)';
const darkColor = 'rgba(43, 47, 51, 1.0)';
const grayColor = 'rgba(58, 62, 66, 1.0)';
const blackColor = 'rgba(0, 0, 0, 1.0)';
const translucentBlackColor = 'rgba(0, 0, 0, 0.1)';
const whiteColor = 'rgba(255, 255, 255, 1.0)';
const terminalGreen = 'rgba(74, 246, 38, 1.0)';

class SearchableCardList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      error: null,
      allCards: [],
      data: [],
      searchModeIndex: 0,
      query: '',
      filterQuery: new FilterQuery(''),
      flatListRef: null,
    };
  }

  componentDidMount() {
    this.loadAllCards();
  }

  readonly searchModes = {
    0: {
      label: 'title',
      icon: 'search-outline',
      description: 'Search all cards by title. e.g.: \n\n\n quick draw \n\n farm \n\n chimaera \n\n destroyer \n\n dvdlots \n\n hdadtj'
    },
    1: {
      label: 'natural language query',
      icon: 'color-filter-outline',
      description: `Search all cards with natural language. e.g.: \n\n\n gametext contains bad feeling (gt c bfhi) \n\n lore matches isb (l m isb) \n\n power = 9 (p 9) \n\n pulls falcon \n\n pulled by sos \n\n is a leader \n\n subtype contains starting \n\n icons includes pilot \n\n\n Also try shortcuts e.g. \n\n gt c ychf`,
    },
  };

  currentSearchMode() {
    return this.searchModes[this.state.searchModeIndex] || 0;
  }

  loadAllCards = () => {
    this.setState({ loading: true });

    const allCards = [...darkCards.cards, ...lightCards.cards]
      .map(c => new Card(c))
      .filter(c => !c.title.includes('AI)')) // excludes (AI) and (Holo AI)
      .filter(c => c.type != 'Game Aid')
      .sort((a, b) => (a.sortTitle > b.sortTitle) ? 1 : ((b.sortTitle > a.sortTitle) ? -1 : 0))

    this.setState({
      data: allCards,
      error: null,
      loading: false,
    });

    this.state.allCards = allCards;
  };

  renderSeparator = () => {
    return (
      <View style={{ height: 2, backgroundColor: blackColor }} />
    );
  };

  searchRouter = text => {
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
  }

  queryFilterFunction = (text) => {
    const filterQuery = new FilterQuery(text);

    this.setState({
      query: text,
      filterQuery: filterQuery,
    });

    console.log('text entry: ', text)
    console.log('---')
    console.log('field: ', filterQuery.field?.name)
    console.log('rawField', filterQuery.rawField)
    console.log('comparator: ', filterQuery.comparator?.name)
    console.log('rawComparator', filterQuery.rawComparator)
    console.log('value: ', filterQuery.value)
    console.log('rawValue: ', filterQuery.rawValue)
    console.log('filter: ', typeof filterQuery.filter)
    console.log('valid?: ', filterQuery.valid())
    console.log('\n')

    if (filterQuery.valid()) {
      const newData = filterQuery.execute(this.state.allCards);

      this.setState({
        data: newData,
      });
    } else {
      this.setState({
        data: [],
      });
    }

    return filterQuery.valid();
  }

  searchFilterFunction = text => {
    const newData = this.state.allCards.filter(card => {
      const textData = alias(text);
      const itemData = `${card.sortTitle} ${card.abbr || ' '}`
        .replaceAll(/[^a-zA-Z0-9 -]/g, '')
        .toLowerCase()
        .trim();

      // Allow for unorderd word matches
      const textDataList = textData.split(' ');
      const itemDataList = itemData.split(' ');

      const matches = textDataList.filter((w: string) => itemDataList.indexOf(w) > -1);

      return matches.length === textDataList.length;
    });

    this.setState({
      data: newData,
    });
  };

  renderHeader = () => {
    return (
      <View style={{
        height: 100,
        borderBottomColor: this.state.query === null || this.state.query == '' ? 'transparent' : blackColor,
        borderBottomWidth: 2,
      }}>
        <SearchBar
          placeholder={`Search by ${this.currentSearchMode().label}`}
          round
          onChangeText={text => this.searchRouter(text)}
          autoCorrect={false}
          value={this.state.query}
          style={{ fontSize: 16 }}
          searchIcon={
            <Icon
              name={this.currentSearchMode().icon}
              type='ionicon'
              color={lightColor}
              onPress={() => {
                this.setState({ query: null });
                this.searchRouter('');
                this.setState({ searchModeIndex: (this.state.searchModeIndex + 1) % 2 });
              }}
            />
          }
        />
        <View style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'center',
        }}>
          {this.state.searchModeIndex == 1 && this.state.query &&
            <Chip
              title={this.state.filterQuery.displayFieldName()}
              key={'field'}
              type='outline'
              buttonStyle={this.state.filterQuery.validField() ? styles.chipButtonWithMatch : styles.chipButton}
              titleStyle={this.state.filterQuery.validField() ? styles.chipTitleWithMatch : styles.chipTitle}
              containerStyle={styles.chipContainer}>
            </Chip>}

          {this.state.searchModeIndex == 1 && (this.state.filterQuery.comparator || this.state.filterQuery.partiallyValidComparator()) && !(this.state.filterQuery.usingDefaultComparator() && this.state.filterQuery.comparator.name == 'includes') &&
            <Chip
              title={this.state.filterQuery.displayComparatorName()}
              key={'comparator'}
              type='outline'
              buttonStyle={this.state.filterQuery.validComparator() ? styles.chipButtonWithMatch : styles.chipButton}
              titleStyle={this.state.filterQuery.validComparator() ? styles.chipTitleWithMatch : styles.chipTitle}
              containerStyle={styles.chipContainer}>
            </Chip>}

          {this.state.searchModeIndex == 1 && this.state.filterQuery.value &&
            <Chip
              title={this.state.filterQuery.rawValue}
              key={'value'}
              type='outline'
              buttonStyle={this.state.filterQuery.validValue() && this.state.data.length > 0 ? styles.chipButtonWithMatch : styles.chipButton}
              titleStyle={this.state.filterQuery.validValue() && this.state.data.length > 0 ? styles.chipTitleWithMatch : styles.chipTitle}
              containerStyle={styles.chipContainer}>
            </Chip>}

          {this.state.query != '' && this.state.searchModeIndex == 0 &&
            <Chip
              title={this.state.query}
              key={'value'}
              type='outline'
              buttonStyle={styles.chipButtonWithMatch}
              titleStyle={styles.chipTitleWithMatch}
              containerStyle={styles.chipContainer}>
            </Chip>}

          <Text style={{ fontSize: 14, color: whiteColor, alignSelf: 'center', marginLeft: 5 }}>
            {this.state.query ? `(${this.state.data.length} results)` : ''}
          </Text>
        </View>
      </View>
    );
  };

  render() {
    if (this.state.loading) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator />
        </View>
      );
    }

    return (
      <View style={{ flex: 1, overflow: 'hidden', backgroundColor: blackColor }}>
        {this.renderHeader()}
        {this.state.query &&
          <Animated.FlatList
            ref={(ref) => { this.state.flatListRef = ref; }}
            data={this.state.data}
            renderItem={({ item, index }) =>
              <CardListItem item={item} index={index} flatListRef={this.state.flatListRef} scrollToIndex={(i: number) => this.state.flatListRef.scrollToIndex({ animated: true, index: i })} />
            }
            keyExtractor={item => item.id}
            ItemSeparatorComponent={this.renderSeparator}
            keyboardShouldPersistTaps='never'

            // Performance settings
            initialNumToRender={10} // Reduce initial render amount
            removeClippedSubviews={true} // Unmount components when outside of window
            maxToRenderPerBatch={10} // Reduce number in each render batch
            updateCellsBatchingPeriod={100} // Increase time between renders
            windowSize={10} // Reduce the window size
          /> || <>
            <View style={{ alignSelf: 'flex-start', flexDirection: 'row', justifyContent: 'center', width: '100%', marginTop: 0 }}>
              <Text style={{ color: 'white', }}>
                Tap the
              </Text>
              <Icon
                name={this.currentSearchMode().icon}
                type='ionicon'
                color='white'
                size={16}
                style={{ marginLeft: 5, marginRight: 5 }}
              />
              <Text style={{ color: 'white', }}>
                icon to switch between search modes. {'\n\n\n'}
              </Text>
            </View>
            <Text style={{ color: 'white', padding: 18, textAlign: 'center', marginBottom: 40 }}>
              {this.currentSearchMode().description}
            </Text>
          </>
        }
      </View >
    );
  }
}

const styles = StyleSheet.create({
  chipButton: {
    borderColor: 'red',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 0,
    marginTop: 6,
    marginHorizontal: 2,
  },
  chipButtonWithMatch: {
    borderColor: terminalGreen,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 0,
    marginTop: 6,
    marginHorizontal: 2,
  },
  chipContainer: {
    marginHorizontal: 0,
  },
  chipTitle:
  {
    color: 'red',
    fontSize: 14,
  },
  chipTitleWithMatch:
  {
    color: terminalGreen,
    fontSize: 14,
  },
});

export default SearchableCardList;
