import React, { Component } from 'react';
import { View, FlatList, ActivityIndicator, Modal, Pressable, Text, StyleSheet } from 'react-native';
import { SearchBar, Icon, Chip } from 'react-native-elements';
import FastImage from 'react-native-fast-image'
import CardListItem from './components/CardListItem'

import Card from './models/Card'
import FilterQuery from './models/FilterQuery'

import darkCards from '../data/Dark.json';
import lightCards from '../data/Light.json';

class SearchableCardList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      error: null,
      allCards: [],
      data: [],
      modalVisible: false,
      currentCard: null,
      searchMode: 0,
      query: null,
      filterQuery: new FilterQuery(''),
    };
  }

  componentDidMount() {
    this.loadAllCards();
  }

  readonly searchModes = {
    0: 'title',
    1: 'natural language query',
  };

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
      <View style={{ height: 2, backgroundColor: '#000000' }} />
    );
  };

  searchRouter = text => {
    text = text.toLowerCase();

    this.setState({
      query: text,
    });

    switch (this.state.searchMode) {
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
      });
    }

    return filterQuery.valid();
  }

  searchFilterFunction = text => {
    const newData = this.state.allCards.filter(card => {
      const textData = text;
      const itemData = card.sortTitle;

      return itemData.indexOf(textData) > -1;
    });

    this.setState({
      data: newData,
    });
  };

  partialFieldName() {
    return this.state.query.split(' ')[0];
  }

  partialComparatorName() {
    // look through entire valid list maybe?
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
    const lightColor = 'rgba(219, 227, 232, 1.0)';
    const darkColor = 'rgba(43, 47, 51, 1.0)';

    return (
      <View style={{ height: 100 }}>
        <SearchBar
          placeholder={`Search by ${this.searchModes[this.state.searchMode]}`}
          darkTheme
          round
          onChangeText={text => this.searchRouter(text)}
          autoCorrect={false}
          value={this.state.query}
          style={{ fontSize: 16 }}
          searchIcon={
            <Icon
              name={this.state.searchMode == 0 ? 'search-outline' : 'color-filter-outline'}
              type='ionicon'
              color={lightColor}
              onPress={() => {
                this.setState({ query: null });
                this.searchRouter('');
                this.setState({ searchMode: (this.state.searchMode + 1) % 2 });
              }}
            />
          }
        />
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}>
          {this.state.searchMode == 1 && this.state.query &&
            <Chip
              title={this.state.filterQuery.validField() ? this.state.filterQuery.field.name : this.partialFieldName()}
              key={'field'}
              type='outline'
              buttonStyle={this.state.filterQuery.validField() ? styles.chipButtonWithMatch : styles.chipButton}
              titleStyle={this.state.filterQuery.validField() ? styles.chipTitleWithMatch : styles.chipTitle}
              containerStyle={styles.chipContainer}>
            </Chip>}
          {this.state.searchMode == 1 && this.state.filterQuery.comparator &&
            <Chip
              title={this.state.filterQuery.validComparator() ? this.state.filterQuery.comparator.name : this.partialComparatorName}
              key={'comparator'}
              type='outline'
              buttonStyle={this.state.filterQuery.validComparator() ? styles.chipButtonWithMatch : styles.chipButton}
              titleStyle={this.state.filterQuery.validComparator() ? styles.chipTitleWithMatch : styles.chipTitle}
              containerStyle={styles.chipContainer}>
            </Chip>}
          {this.state.searchMode == 1 && this.state.filterQuery.value &&
            <Chip
              title={this.state.filterQuery.validValue() ? this.state.filterQuery.value : this.partialValue()}
              key={'value'}
              type='outline'
              buttonStyle={styles.chipButtonWithMatch}
              titleStyle={styles.chipTitleWithMatch}
              containerStyle={styles.chipContainer}>
            </Chip>}
          {this.state.searchMode == 0 &&
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

    // TODO: Overlay!
    const toggleModalForCard = (card) => {
      return () => this.setState({ modalVisible: !this.state.modalVisible, currentCard: card });
    }

    return (
      <View style={{ flex: 1, overflow: 'hidden', backgroundColor: 'black' }}>
        {this.renderHeader()}
        {this.state.query &&
          <FlatList
            data={this.state.data}
            renderItem={({ item }) =>
              <CardListItem item={item} callback={toggleModalForCard(item)} />
            }
            keyExtractor={item => item.id}
            ItemSeparatorComponent={this.renderSeparator}

            // Performance settings
            initialNumToRender={10} // Reduce initial render amount
            removeClippedSubviews={true} // Unmount components when outside of window
            maxToRenderPerBatch={10} // Reduce number in each render batch
            updateCellsBatchingPeriod={100} // Increase time between renders
            windowSize={10} // Reduce the window size
          /> ||
          <Text style={{ color: '#ffffff', padding: 18, textAlign: 'center' }}>
            Search by title, or by natural language query. Try:
            {'\n\n'}{'\n\n'}
            Title: {'\n\n'}
            comlink {'\n\n'} farm {'\n\n'} chimaera
            {'\n\n'} {'\n\n'}
            Natural language query: {'\n\n'}
            lore contains ISB {'\n\n'} power &gt; 5 {'\n\n'} icons include pilot
            {'\n\n'} {'\n\n'}
            Coming soon: {'\n\n'} is leader {'\n\n'} ability = 2 AND is imperial
          </Text>
        }
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.modalVisible}
          style={{ alignItems: 'center', elevation: 5 }}
          onRequestClose={() => { this.setState({ modalVisible: !this.state.modalVisible, currentCard: null }); }}>
          <View style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.80)',
          }}>
            <Pressable style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
              onPress={() => this.setState({ modalVisible: !this.state.modalVisible })}>
              {(this.state.currentCard && !this.state.currentCard.twoSided &&
                <FastImage
                  source={{ uri: this.state.currentCard.imageUrl }}
                  style={{
                    width: '100%',
                    aspectRatio: this.state.currentCard.sideways ? 1.3937 : 0.7136,
                    borderRadius: 15,
                  }}
                />) || (this.state.currentCard &&
                  <>
                    <FastImage
                      source={{ uri: this.state.currentCard.imageUrl }}
                      style={{
                        height: '49%',
                        aspectRatio: 0.7136,
                        borderRadius: 15,
                      }}
                    />
                    <FastImage
                      source={{ uri: this.state.currentCard.backImageUrl }}
                      style={{
                        height: '49%',
                        aspectRatio: 0.7136,
                        borderRadius: 15,
                      }}
                    />
                  </>
                )
              }
            </Pressable>
          </View>
        </Modal >
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
