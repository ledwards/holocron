import {Text, View, ScrollView} from 'react-native';
// import DecklistsScreenGridItem from './DecklistsScreenGridItem';
import DecklistsScreenGridItem from './DecklistsScreenGridItem';
import React, {PureComponent} from 'react';

import styles from '../../styles/DecklistsScreenGridViewStyles';

// TODO: translucent bottom bar

const cardsPerRow = 4;

class DecklistsScreenView extends PureComponent {
  constructor(props) {
    super(props);

    this.props.navigation.setOptions({
      title: props.route.params.decklist.displaySubtitle,
    });

    this.state = {
      activeIndex: null,
      theme: this.props.route.params.theme,
    };
  }

  componentDidMount() {
    this.setState({
      ...this.state,
      theme: this.props.route.params.theme,
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.route.params.theme.name != this.props.route.params.theme.name
    ) {
      this.setState({
        ...this.state,
        theme: this.props.route.params.theme,
      });
    }
  }

  render() {
    const decklist = this.props.route.params.decklist;
    let items: any[] = [];
    this.props.route.params.decklist.cards.forEach(card => {
      for (let i = 0; i < card.quantity; i++) {
        items.push(card);
      }
    });

    return (
      <ScrollView
        contentContainerStyle={{
          alignContent: 'flex-start',
          alignItems: 'flex-start',
          alignSelf: 'flex-start',
          flex: 2,
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
        }}
        style={{}}>
        {items.map((item, index) => {
          return (
            <DecklistsScreenGridItem
              key={index}
              item={item}
              decklist={decklist}
              index={index}
            />
          );
        })}
      </ScrollView>
    );
  }
}
export default DecklistsScreenView;
