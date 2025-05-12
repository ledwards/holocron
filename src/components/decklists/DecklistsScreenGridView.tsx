import React, {createRef, useEffect, useState} from 'react';
import {ScrollView, View, Dimensions, StyleSheet, TouchableWithoutFeedback} from 'react-native';
import DecklistsScreenGridItem from './DecklistsScreenGridItem';
import DecklistEmptyFooter from './DecklistEmptyFooter';

import layout from '../../constants/layout';
import styles from '../../styles/DecklistsScreenGridViewStyles';

const DecklistsScreenGridView = props => {
  const scrollViewRef = createRef();
  const decklist = props.route.params.decklist;
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
  
  // Track which card is logically expanded
  const [expandedCardIndex, setExpandedCardIndex] = useState(-1);
  
  // Track which card should have high zIndex (including during collapse animation)
  const [visibleCardIndex, setVisibleCardIndex] = useState(-1);
  
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

  // Handle card tap at grid level
  const handleCardTap = (index) => {
    if (expandedCardIndex === index) {
      // Tapping the currently expanded card - collapse it
      setExpandedCardIndex(-1);
    } else if (expandedCardIndex === -1) {
      // No card is expanded - expand the tapped one
      setExpandedCardIndex(index);
      setVisibleCardIndex(index);
    } else {
      // Another card is expanded - just collapse it
      setExpandedCardIndex(-1);
    }
  };

  // Called when a card finishes its collapse animation
  const handleCollapseComplete = (index) => {
    if (visibleCardIndex === index) {
      // Only reset the visible index if it matches the card that just finished animating
      setVisibleCardIndex(-1);
    }
  };

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
          width: '100%',
          position: 'relative'
        }}>
          {items.map((item, index) => {
            const cardWidth = windowWidth / cardsPerRow;
            const aspectRatio = item.aspectRatio || decklist.aspectRatio || 0.7;
            const cardHeight = cardWidth / aspectRatio;
            
            return (
              <TouchableWithoutFeedback 
                key={index}
                onPress={() => handleCardTap(index)}
              >
                <View 
                  style={{
                    width: cardWidth,
                    height: cardHeight,
                    padding: 2,
                    position: 'relative',
                    zIndex: visibleCardIndex === index ? 10 : 0,
                    overflow: 'visible',
                  }}
                >
                  <DecklistsScreenGridItem
                    item={item}
                    decklist={decklist}
                    index={index}
                    scrollViewRef={scrollViewRef}
                    windowWidth={windowWidth}
                    cardsPerRow={cardsPerRow}
                    isExpanded={expandedCardIndex === index}
                    onCollapseAnimationComplete={handleCollapseComplete}
                  />
                </View>
              </TouchableWithoutFeedback>
            );
          })}
        </View>
      </ScrollView>
      <DecklistEmptyFooter
        nativeFooterHeight={layout.nativeFooterHeight()}
        tabBarHeight={layout.tabBarHeight()}
      />
      <View 
        style={StyleSheet.absoluteFill} 
        pointerEvents="none" 
        collapsable={false} 
      />
    </>
  );
};

export default DecklistsScreenGridView;