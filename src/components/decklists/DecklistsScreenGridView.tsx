import React, {createRef, useEffect, useState} from 'react';
import {ScrollView, View, Dimensions, StyleSheet, TouchableWithoutFeedback} from 'react-native';
import DecklistsScreenGridItem from './DecklistsScreenGridItem';
import DecklistEmptyFooter from './DecklistEmptyFooter';

import layout from '../../constants/layout';
import styles from '../../styles/DecklistsScreenGridViewStyles';
import {Decklist} from '../../types/interfaces';

// List of cards that have two sides
const TWO_SIDED_CARDS = ["Jabba's Prize", 'The Falcon, Junkyard Garbage'];

interface CardType {
  title: string;
  type?: string;
  quantity: number;
  imageUrl: string;
  imageBackUrl?: string;
  aspectRatio?: number;
}

const isTwoSided = (card: CardType): boolean => {
  return (card.type === 'Objective') || (card.title && TWO_SIDED_CARDS.includes(card.title));
};

interface DecklistsScreenGridViewProps {
  route: {
    params: {
      decklist: Decklist;
    }
  };
  navigation: Record<string, unknown>;
}

const DecklistsScreenGridView = (props: DecklistsScreenGridViewProps) => {
  const scrollViewRef = createRef<ScrollView>();
  const decklist = props.route.params.decklist;
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
  
  // Track which card is logically expanded
  const [expandedCardIndex, setExpandedCardIndex] = useState(-1);
  
  // Track which card should have high zIndex (including during collapse animation)
  const [visibleCardIndex, setVisibleCardIndex] = useState(-1);
  
  // Track when a card is showing its back side
  const [showingBackSide, setShowingBackSide] = useState(false);
  
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
  const items: CardType[] = [];
  if (props.route.params.decklist && props.route.params.decklist.cards) {
    props.route.params.decklist.cards.forEach((card: CardType) => {
      for (let i = 0; i < card.quantity; i++) {
        items.push(card);
      }
    });
  }

  // Handle card tap at grid level
  const handleCardTap = (index: number): void => {
    const card = items[index];
    const cardIsTwoSided = isTwoSided(card);
    
    if (expandedCardIndex === index) {
      // Tapping the currently expanded card
      if (cardIsTwoSided && !showingBackSide) {
        // If card is two-sided and showing front, flip it to show back
        setShowingBackSide(true);
      } else {
        // If card is not two-sided or already showing back, collapse it
        setExpandedCardIndex(-1);
        setShowingBackSide(false);
      }
    } else if (expandedCardIndex === -1) {
      // No card is expanded - expand the tapped one
      setExpandedCardIndex(index);
      setVisibleCardIndex(index);
      setShowingBackSide(false);
    } else {
      // Another card is expanded - just collapse it
      setExpandedCardIndex(-1);
      setShowingBackSide(false);
    }
  };

  // Called when a card finishes its collapse animation
  const handleCollapseComplete = (index: number): void => {
    if (visibleCardIndex === index) {
      // Only reset the visible index if it matches the card that just finished animating
      setVisibleCardIndex(-1);
      setShowingBackSide(false);
    }
  };

  return (
    <>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{
          ...styles.scrollView,
          paddingBottom: layout.footerHeight(0, undefined) + 150,
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
            const aspectRatio = item.aspectRatio || 0.7;
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
                    padding: 1,
                    position: 'relative',
                    zIndex: visibleCardIndex === index ? 10 : 0,
                    overflow: 'visible',
                    justifyContent: 'center',
                    alignItems: 'center',
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
                    showingBackSide={expandedCardIndex === index && showingBackSide}
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
