import React, { Component } from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet, Animated } from 'react-native';
import { SearchBar, Icon, Chip } from 'react-native-elements';
import CardListItem from './CardListItem'

import Card from '../models/Card'
import FilterQuery from '../models/FilterQuery'

import darkCards from '../../data/Dark.json';
import lightCards from '../../data/Light.json';

const lightColor = 'rgba(219, 227, 232, 1.0)';
const darkColor = 'rgba(43, 47, 51, 1.0)';
const grayColor = 'rgba(58, 62, 66, 1.0)';
const blackColor = 'rgba(0, 0, 0, 1.0)';
const whiteColor = 'rgba(255, 255, 255, 1.0)';

class SearchableCardList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      error: null,
      allCards: [],
      data: [],
      searchModeIndex: 0,
      query: null,
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
      description: 'Search all cards by title. Try: \n\ncomlink \n\n farm \n\n chimaera'
    },
    1: {
      label: 'natural language query',
      icon: 'color-filter-outline',
      description: 'Search all cards with English language queries. Try: \n\n lore contains ISB \n\n power > 5 \n\n icons include pilot',
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

    if (filterQuery.valid()) {
      const newData = filterQuery.execute(this.state.allCards);

      this.setState({
        data: newData,
        expandedCard: newData[0],
      });
    }

    return filterQuery.valid();
  }

  searchFilterFunction = text => {
    const newData = this.state.allCards.filter(card => {
      const textData = text.replaceAll(/[^a-zA-Z0-9 -]/g, '');
      const itemData = `${card.sortTitle} ${card.abbreviationTitle || ' '}`
        .replaceAll(/[^a-zA-Z0-9 -]/g, '')
        .toLowerCase()
        .trim();

      // Allow for partial matches
      const textDataList = textData.split(' ');
      const itemDataList = itemData.split(' ');

      const matches = textDataList.filter((w: string) => itemData.indexOf(w) > -1);

      return matches.length === textDataList.length;
    });

    this.setState({
      data: newData,
    });
  };

  partialFieldName() {
    return this.state.query.split(' ')[0];
  }

  partialComparatorName() {
    if (this.state.filterQuery.fieldValid()) {
      return this.state.query.replace(this.state.filterQuery.field.name, '');
    } else {
      return this.state.query.split(' ')[1];
    }
  }

  partialValue() {
    if (this.state.filterQuery.fieldValid() && this.state.filterQuery.comparatorValid()) {
      return this.state.query.replace(this.state.filterQuery.field.name, '').replace(this.state.filterQuery.comparator.name, '').trim();
    } else {
      return '';
    }
  }

  renderHeader = () => {
    return (
      <View style={{
        height: 100,
        backgroundColor: blackColor,
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
          justifyContent: 'center'
        }}>
          {this.state.searchModeIndex == 1 && this.state.query &&
            <Chip
              title={this.state.filterQuery.validField() ? this.state.filterQuery.field.name : this.partialFieldName()}
              key={'field'}
              type='outline'
              buttonStyle={this.state.filterQuery.validField() ? styles.chipButtonWithMatch : styles.chipButton}
              titleStyle={this.state.filterQuery.validField() ? styles.chipTitleWithMatch : styles.chipTitle}
              containerStyle={styles.chipContainer}>
            </Chip>}

          {this.state.searchModeIndex == 1 && this.state.filterQuery.comparator &&
            <Chip
              title={this.state.filterQuery.validComparator() ? this.state.filterQuery.comparator.name : this.partialComparatorName}
              key={'comparator'}
              type='outline'
              buttonStyle={this.state.filterQuery.validComparator() ? styles.chipButtonWithMatch : styles.chipButton}
              titleStyle={this.state.filterQuery.validComparator() ? styles.chipTitleWithMatch : styles.chipTitle}
              containerStyle={styles.chipContainer}>
            </Chip>}

          {this.state.searchModeIndex == 1 && this.state.filterQuery.value &&
            <Chip
              title={this.state.filterQuery.validValue() ? this.state.filterQuery.value : this.partialValue()}
              key={'value'}
              type='outline'
              buttonStyle={styles.chipButtonWithMatch}
              titleStyle={styles.chipTitleWithMatch}
              containerStyle={styles.chipContainer}>
            </Chip>}

          {this.state.searchModeIndex == 0 &&
            <Chip
              title={this.state.query}
              key={'value'}
              type='outline'
              buttonStyle={styles.chipButtonWithMatch}
              titleStyle={styles.chipTitleWithMatch}
              containerStyle={styles.chipContainer}>
            </Chip>}

          <Text style={{ fontSize: 14, color: 'white', alignSelf: 'center', marginLeft: 5 }}>
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
              <CardListItem item={item} index={index} flatListRef={this.state.flatListRef} />
            }
            keyExtractor={item => item.id}
            ItemSeparatorComponent={this.renderSeparator}
            keyboardShouldPersistTaps='handled'

            // Performance settings
            initialNumToRender={10} // Reduce initial render amount
            removeClippedSubviews={true} // Unmount components when outside of window
            maxToRenderPerBatch={10} // Reduce number in each render batch
            updateCellsBatchingPeriod={100} // Increase time between renders
            windowSize={10} // Reduce the window size
          /> || <>
            <Text style={{ color: 'white', padding: 18, textAlign: 'center' }}>
              {this.currentSearchMode().description}
            </Text>
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', width: '100%', marginTop: 40 }}>
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
    padding: 4,
    margin: 4,
  },
  chipButtonWithMatch: {
    borderColor: 'transparent',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 0,
    margin: 0,
    backgroundColor: 'transparent',
  },
  chipContainer: {
    marginHorizontal: 0,
  },
  chipTitle:
  {
    color: 'red',
    fontSize: 10,
  },
  chipTitleWithMatch:
  {
    color: 'white',
    fontSize: 14,
  },
});

export default SearchableCardList;
