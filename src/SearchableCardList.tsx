import React, { Component } from 'react';
import { View, FlatList, ActivityIndicator, Modal, Pressable } from 'react-native';
import { SearchBar } from 'react-native-elements';
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
    };

    this.currentCards = [];
  }

  componentDidMount() {
    this.loadAllCards();
  }

  loadAllCards = () => {
    this.setState({ loading: true });

    const allCards = [...darkCards.cards, ...lightCards.cards]
      .map(c => new Card(c))
      .filter(c => !c.title.includes('(AI)'))
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
      const itemData = `${card.sortTitle.toLowerCase()}`;
      const textData = text.toLowerCase();

      return itemData.indexOf(textData) > -1;
    });
    this.setState({
      data: newData,
    });
  };

  renderHeader = () => {
    return (
      <SearchBar
        placeholder="Search"
        darkTheme
        round
        onChangeText={text => this.searchFilterFunction(text)}
        autoCorrect={false}
        value={this.state.value}
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
            <Pressable style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}
              onPress={() => this.setState({ modalVisible: !this.state.modalVisible })}>
              <FastImage
                source={{ uri: this.state.currentCard ? this.state.currentCard.imageUrl : '' }}
                style={{
                  width: '100%',
                  aspectRatio: this.state.currentCard && this.state.currentCard.sideways ? 1.3937 : 0.7136,
                  borderRadius: 15,
                }}
              />
            </Pressable>
          </View>
        </Modal>
      </View>
    );
  }
}

export default SearchableCardList;
