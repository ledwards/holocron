import {
  View,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import React, {useRef, useState, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';

import styles from '../../styles/DecklistsScreenGridViewStyles';
import layout from '../../constants/layout';
import { CardSide } from '../../types/enums';

// List of cards that should be displayed sideways
const SIDEWAYS_CARDS = [
  'Executor',
  'Flagship Executor',
  'Finalizer',
  "Maul's Double-Bladed Lightsaber",
];

// List of cards that have two sides
const TWO_SIDED_CARDS = ["Jabba's Prize", 'The Falcon, Junkyard Garbage'];

interface CardItem {
  title: string;
  subType?: string;
  type?: string;
  aspectRatio?: number;
  imageUrl: string;
  imageBackUrl?: string;
}

interface DecklistItem {
  displaySubtitle: string;
  side: CardSide | string;
}

const isSideways = (card: CardItem): boolean => {
  return card.subType === 'Site' || SIDEWAYS_CARDS.includes(card.title);
};

const isTwoSided = (card: CardItem): boolean => {
  return card.type == 'Objective' || TWO_SIDED_CARDS.includes(card.title);
};

interface DecklistsScreenGridItemProps {
  item: CardItem;
  decklist: DecklistItem;
  index: number;
  scrollViewRef: React.RefObject<any>;
  windowWidth: number;
  cardsPerRow: number;
  isExpanded: boolean;
  showingBackSide: boolean;
  onCollapseAnimationComplete?: (index: number) => void;
}

const DecklistsScreenGridItem = ({
  item, 
  decklist, 
  index, 
  scrollViewRef, 
  windowWidth, 
  cardsPerRow, 
  isExpanded, 
  showingBackSide,
  onCollapseAnimationComplete
}: DecklistsScreenGridItemProps) => {
  const navigation = useNavigation<any>();
  const cardSideways = isSideways(item);
  const cardIsTwoSided = isTwoSided(item);
  
  interface ItemState {
    expanded: boolean;
    showingBack: boolean;
  }
  
  const [state, setState] = useState<ItemState>({
    expanded: false,
    showingBack: false,
  });
  
  useEffect(() => {
    if (isExpanded && !state.expanded) {
      handleExpand();
    } else if (!isExpanded && state.expanded) {
      handleCollapse();
    }
  }, [isExpanded]);

  // Sync back side state with parent component
  useEffect(() => {
    if (state.expanded) {
      setState(prevState => ({
        ...prevState,
        showingBack: showingBackSide,
      }));
    }
  }, [showingBackSide]);

  const windowHeight = Dimensions.get('window').height;
  const cardWidth = windowWidth / cardsPerRow;
  const aspectRatio = item.aspectRatio || 0.7;
  const cardHeight = cardWidth / aspectRatio;
  
  const cardMinWidth = cardWidth;
  const cardMaxWidth = windowWidth;
  const cardMinHeight = cardHeight;
  const cardMaxHeight = windowWidth / aspectRatio;

  const minScale = 1;
  const maxScale = cardMaxHeight / cardMinHeight;
  const scale = useRef(new Animated.Value(minScale)).current;

  const initialRelativeLeft = 0;
  const maxRelativeLeft = (-1 * (((index % cardsPerRow) - 1.5) * cardWidth)) / minScale;
  const relativeLeft = useRef(new Animated.Value(0)).current;
  
  // Animation value for rotation (0 = sideways, 1 = upright)
  const rotationValue = useRef(new Animated.Value(0)).current;

  const initialRelativeTop = 0;
  const topHeaderHeight = layout.nativeHeaderTopHeight() == 0 ? 68 : 75;
  const rowNumber = Math.floor(index / cardsPerRow);
  
  // Target vertical position calculation with special handling for sideways cards
  let maxRelativeTop = 0;
  if (rowNumber === 0) {
    maxRelativeTop = cardMinHeight + topHeaderHeight;
    // Shift sideways cards up by one grid height
    if (cardSideways) {
      maxRelativeTop -= cardHeight;
    }
  } else if (rowNumber === 1) {
    maxRelativeTop = 0.25 * cardMinHeight + topHeaderHeight;
    // Shift sideways cards up by half a grid height
    if (cardSideways) {
      maxRelativeTop -= cardHeight / 2;
    }
  }

  const relativeTop = useRef(new Animated.Value(0)).current;
  const [scrollView, setScrollView] = useState<any>(null);

  useEffect(() => {
    navigation.setOptions({
      title: decklist.displaySubtitle,
    });
    setScrollView(scrollViewRef.current);
  }, []);

  // Get image URL based on card side
  const imageUrl = state.showingBack && cardIsTwoSided
    ? item.imageBackUrl
    : item.imageUrl;

  const handleExpand = (): void => {
    setState({
      expanded: true,
      showingBack: false,
    });

    // Standard scroll position calculation for all cards
    const topOfCard = Math.floor(index / cardsPerRow) * cardMinHeight -
      (windowHeight - cardMaxHeight) / 2 -
      layout.tabBarHeight() -
      100;

    scrollView?.scrollTo({
      y: topOfCard,
      animated: true,
    });

    const t = 200;
    const easingOut = Easing.ease;

    Animated.parallel([
      Animated.timing(scale, {
        toValue: maxScale,
        duration: t,
        useNativeDriver: false,
        easing: easingOut,
      }),
      Animated.timing(relativeLeft, {
        toValue: 1,
        duration: t,
        useNativeDriver: false,
        easing: easingOut,
      }),
      Animated.timing(relativeTop, {
        toValue: 1,
        duration: t,
        useNativeDriver: false,
        easing: easingOut,
      }),
      // Add rotation animation for sideways cards
      Animated.timing(rotationValue, {
        toValue: cardSideways ? 1 : 0,
        duration: t,
        useNativeDriver: false,
        easing: easingOut,
      }),
    ]).start();
  };

  const handleCollapse = (): void => {
    const t = 200;
    const easingIn = Easing.ease;

    Animated.parallel([
      Animated.timing(scale, {
        toValue: minScale,
        duration: t,
        useNativeDriver: false,
        easing: easingIn,
      }),
      Animated.timing(relativeLeft, {
        toValue: 0,
        duration: t,
        useNativeDriver: false,
        easing: easingIn,
      }),
      Animated.timing(relativeTop, {
        toValue: 0,
        duration: t,
        useNativeDriver: false,
        easing: easingIn,
      }),
      // Return rotation to original state
      Animated.timing(rotationValue, {
        toValue: 0,
        duration: t,
        useNativeDriver: false,
        easing: easingIn,
      }),
    ]).start(() => {
      setState({
        expanded: false,
        showingBack: false,
      });
      
      if (onCollapseAnimationComplete) {
        onCollapseAnimationComplete(index);
      }
    });
  };

  const scaleAnim = scale.interpolate({
    inputRange: [minScale, maxScale],
    outputRange: [minScale, maxScale],
  });

  const leftAnim = relativeLeft.interpolate({
    inputRange: [0, 1],
    outputRange: [initialRelativeLeft, maxRelativeLeft],
  });

  const topAnim = relativeTop.interpolate({
    inputRange: [0, 1],
    outputRange: [initialRelativeTop, maxRelativeTop],
  });

  // Card rotation based on type and side
  const baseRotation = cardSideways
    ? decklist.side === 'Dark'
      ? '90deg'
      : '-90deg'
    : '0deg';
    
  // Animated rotation for sideways cards (rotate to upright when expanded)
  const rotationDegrees = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [baseRotation, '0deg'],
  });

  return (
    <>
      {/* Normal (non-expanded) card view */}
      <View
        style={{
          ...styles.decklistGridInner,
          display: state.expanded ? 'none' : 'flex',
          width: cardWidth,
          height: cardHeight,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View
          style={{
            width: cardSideways ? cardHeight : cardWidth,
            height: cardSideways ? cardWidth : cardHeight,
            transform: [{ rotate: baseRotation }],
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            borderRadius: styles.decklistGridImage.borderRadius,
          }}>
          <FastImage
            source={{ uri: imageUrl }}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: styles.decklistGridImage.borderRadius,
            }}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>
      </View>

      {/* Expanded view */}
      <Animated.View
        collapsable={false}
        style={{
          ...(styles as any).decklistExpandedOuterContainer,
          display: state.expanded ? 'flex' : 'none',
          position: 'absolute',
          width: '100%',
          height: '100%',
          zIndex: 1,
          transform: [{scale: minScale}],
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}>
        <Animated.View
          collapsable={false}
          style={{
            ...(styles as any).decklistExpandedContainer,
            position: 'absolute',
            left: leftAnim,
            top: topAnim,
            width: cardWidth,
            height: cardHeight,
            transform: [{ scale: scaleAnim }],
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Animated.View
            style={{
              width: cardWidth,
              height: cardHeight,
              transform: [{ rotate: rotationDegrees }],
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
              borderRadius: styles.decklistGridImage.borderRadius,
            }}>
            <FastImage
              source={{ uri: imageUrl }}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: styles.decklistGridImage.borderRadius,
              }}
              resizeMode={FastImage.resizeMode.contain}
            />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </>
  );
};

export default DecklistsScreenGridItem;