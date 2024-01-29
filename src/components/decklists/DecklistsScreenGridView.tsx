import React, {createRef} from 'react';
import {ScrollView} from 'react-native';
import DecklistsScreenGridItem from './DecklistsScreenGridItem';
import DecklistEmptyFooter from './DecklistEmptyFooter';

import layout from '../../constants/layout';
import styles from '../../styles/DecklistsScreenGridViewStyles';

const DecklistsScreenGridView = props => {
  props.navigation.setOptions({
    title: props.route.params.decklist.displaySubtitle,
  });

  const scrollViewRef = createRef();

  const decklist = props.route.params.decklist;

  let items = [];
  props.route.params.decklist.cards.forEach(card => {
    for (let i = 0; i < card.quantity; i++) {
      items.push(card);
    }
  });

  return (
    <>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{
          ...styles.scrollView,
          paddingBottom: layout.footerHeight() + 150,
        }}>
        {items.map((item, index) => {
          return (
            <DecklistsScreenGridItem
              key={index}
              item={item}
              decklist={decklist}
              index={index}
              scrollViewRef={scrollViewRef}
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
};

export default DecklistsScreenGridView;
