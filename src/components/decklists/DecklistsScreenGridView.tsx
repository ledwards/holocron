import React, {PureComponent, useRef, createRef} from 'react';
import {Text, View, ScrollView} from 'react-native';
// import {useHeaderHeight} from '@react-navigation/elements';
import DecklistsScreenGridItem from './DecklistsScreenGridItem';
import DecklistEmptyFooter from './DecklistEmptyFooter';

import layout from '../../constants/layout';
import styles from '../../styles/DecklistsScreenGridViewStyles';

class DecklistsScreenGridView extends PureComponent {
  constructor(props) {
    super(props);

    this.props.navigation.setOptions({
      title: props.route.params.decklist.displaySubtitle,
    });

    this.scrollViewRef = createRef();
    // this.headerHeight = useHeaderHeight();

    this.state = {
      activeIndex: null,
    };
  }

  render() {
    const decklist = this.props.route.params.decklist;

    let items = [];
    this.props.route.params.decklist.cards.forEach(card => {
      for (let i = 0; i < card.quantity; i++) {
        items.push(card);
      }
    });

    return (
      <>
        <ScrollView
          ref={this.scrollViewRef}
          contentContainerStyle={{
            alignContent: 'flex-start',
            alignItems: 'flex-start',
            alignSelf: 'flex-start',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            backgroundColor: 'transparent',
            paddingBottom: layout.footerHeight() + 150,
            // paddingTop: layout.nativeHeaderHeight,
            // paddingTop: this.headerHeight,
          }}>
          {items.map((item, index) => {
            return (
              <DecklistsScreenGridItem
                key={index}
                item={item}
                decklist={decklist}
                index={index}
                scrollViewRef={this.scrollViewRef}
              />
            );
          })}
        </ScrollView>
        <DecklistEmptyFooter
          nativeFooterHeight={layout.nativeFooterHeight()}
          tabBarHeight={layout.tabBarHeight()}
        />
      </>
    );
  }
}
export default DecklistsScreenGridView;
