import React, {createRef, useEffect, useState} from 'react';
import {ScrollView, View, Dimensions} from 'react-native';
import DecklistsScreenGridItem from './DecklistsScreenGridItem';
import DecklistEmptyFooter from './DecklistEmptyFooter';

import layout from '../../constants/layout';
import styles from '../../styles/DecklistsScreenGridViewStyles';

const DecklistsScreenGridView = props => {
  const scrollViewRef = createRef();
  const decklist = props.route.params.decklist;
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
  const cardsPerRow = 4;

  // Handle screen rotation/dimension changes
  useEffect(() => {
    const dimensionsHandler = Dimensions.addEventListener('change', () => {
      setWindowWidth(Dimensions.get('window').width);
    });

    return () => {
      dimensionsHandler?.remove();
    };
  }, []);

  // Flatten card list to include duplicates based on quantity
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
        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'flex-start',
          width: '100%'
        }}>
          {items.map((item, index) => {
            return (
              <View 
                key={index} 
                style={{
                  width: windowWidth / cardsPerRow,
                  height: windowWidth / cardsPerRow / (item.aspectRatio || decklist.aspectRatio || 0.7),
                  padding: 2,
                }}
              >
                <DecklistsScreenGridItem
                  item={item}
                  decklist={decklist}
                  index={index}
                  scrollViewRef={scrollViewRef}
                  windowWidth={windowWidth}
                  cardsPerRow={cardsPerRow}
                />
              </View>
            );
          })}
        </View>
      </ScrollView>
      <DecklistEmptyFooter
        nativeFooterHeight={layout.nativeFooterHeight()}
        tabBarHeight={layout.tabBarHeight()}
      />
    </>
  );
};

export default DecklistsScreenGridView;
