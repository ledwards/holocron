import React, { Component } from 'react';
import { View, FlatList, ActivityIndicator, Modal, Pressable, Text } from 'react-native';
import { SearchBar, Icon } from 'react-native-elements';
import FastImage from 'react-native-fast-image'
import CardListItem from './components/CardListItem'

import Card from './models/Card'
import darkCards from '../data/Dark.json';
import lightCards from '../data/Light.json';

class SearchableCardList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      data: [],
      error: null,
      modalVisible: false,
      currentCard: null,
      searchMode: 0,
      value: null,
    };

    this.currentCards = [];
  }

  componentDidMount() {
    this.loadAllCards();
  }

  readonly searchModes = {
    0: 'title',
    1: 'gametext',
    2: 'lore',
    3: 'title, gametext, or lore',
  };

  loadAllCards = () => {
    this.setState({ loading: true });

    const allCards = [...darkCards.cards, ...lightCards.cards]
      .map(c => new Card(c))
      .filter(c => !c.title.includes('(AI)'))
      .filter(c => c.type != 'Game Aid')
      .sort((a, b) => (a.sortTitle > b.sortTitle) ? 1 : ((b.sortTitle > a.sortTitle) ? -1 : 0))

    this.setState({
      data: allCards,
      error: null,
      loading: false,
    });
    this.currentCards = allCards;
  };

  renderSeparator = () => {
    return (
      <View style={{ height: 1, backgroundColor: '#000000' }} />
    );
  };

  searchFilterFunction = text => {
    this.setState({
      value: text,
    });

    const newData = this.currentCards.filter(card => {
      const textData = text.toLowerCase();
      let itemData;

      switch (this.state.searchMode) {
        case 0:
          itemData = card.sortTitle;
          break;
        case 1:
          itemData = card.gametext;
          break;
        case 2:
          itemData = card.lore;
          break;
        case 3:
          itemData = `${card.sortTitle} ${card.gametext} ${card.lore}`;
          break;
      }
      itemData = itemData.toLowerCase();

      return itemData.indexOf(textData) > -1;
    });
    this.setState({
      data: newData,
    });
  };

  renderHeader = () => {
    return (
      <SearchBar
        placeholder={`Search by ${this.searchModes[this.state.searchMode]}`}
        darkTheme
        round
        onChangeText={text => this.searchFilterFunction(text)}
        autoCorrect={false}
        value={this.state.value}
        searchIcon={
          <Icon
            name='search-outline'
            type='ionicon'
            onPress={() => {
              this.setState({ value: null });
              this.searchFilterFunction('');
              this.setState({ searchMode: (this.state.searchMode + 1) % 4 });
            }}
          />
        }
      />
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

    const toggleModalForCard = (card) => {
      return () => this.setState({ modalVisible: !this.state.modalVisible, currentCard: card });
    }

    return (
      <View style={{ flex: 1, overflow: 'hidden', backgroundColor: 'black' }}>
        <FlatList
          data={this.state.data}
          renderItem={({ item }) =>
            <CardListItem item={item} callback={toggleModalForCard(item)} />
          }
          keyExtractor={item => item.id}
          ItemSeparatorComponent={this.renderSeparator}
          ListHeaderComponent={this.renderHeader}

          // Performance settings
          initialNumToRender={10} // Reduce initial render amount
          removeClippedSubviews={true} // Unmount components when outside of window
          maxToRenderPerBatch={10} // Reduce number in each render batch
          updateCellsBatchingPeriod={100} // Increase time between renders
          windowSize={10} // Reduce the window size
        />
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

export default SearchableCardList;
