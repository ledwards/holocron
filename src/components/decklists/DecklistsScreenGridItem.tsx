import {View, Animated, Easing, Dimensions} from 'react-native';
import React, {useRef, useState, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';

import styles from '../../styles/DecklistsScreenGridViewStyles';
import layout from '../../constants/layout';

// List of cards that should be displayed sideways
const SIDEWAYS_CARDS = [
  'Executor',
  'Flagship Executor',
  'Finalizer',
  "Maul's Double-Bladed Lightsaber",
];
//
// List of cards that have two sides
const TWO_SIDED_CARDS = ["Jabba's Prize", 'The Falcon, Junkyard Garbage'];

const isSideways = card => {
  return card.subType === 'Site' || SIDEWAYS_CARDS.includes(card.title);
};

const isTwoSided = card => {
  return card.type == 'Objective' || TWO_SIDED_CARDS.includes(card.title);
};

const DecklistsScreenGridItem = ({
  item,
  decklist,
  index,
  scrollViewRef,
  windowWidth,
  cardsPerRow,
  isExpanded,
  showingBackSide,
  onCollapseAnimationComplete,
}) => {
  const navigation = useNavigation();
  const cardSideways = isSideways(item);

  const [state, setState] = useState({
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

  // Remove decklist.aspectRatio fallback
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
  const maxRelativeLeft =
    (-1 * (((index % cardsPerRow) - 1.5) * cardWidth)) / minScale;
  const relativeLeft = useRef(new Animated.Value(0)).current;

  const initialRelativeTop = 0;
  const topHeaderHeight = layout.nativeHeaderTopHeight() == 0 ? 68 : 75;
  const rowNumber = Math.floor(index / cardsPerRow);

  // Standard target vertical position calculation - same for all cards
  let maxRelativeTop = 0;
  if (rowNumber === 0) {
    maxRelativeTop = cardMinHeight + topHeaderHeight;
  } else if (rowNumber === 1) {
    maxRelativeTop = 0.25 * cardMinHeight + topHeaderHeight;
  }

  const relativeTop = useRef(new Animated.Value(0)).current;
  const [scrollView, setScrollView] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      title: decklist.displaySubtitle,
    });
    setScrollView(scrollViewRef.current);
  }, []);

  // Use the defined isTwoSided function
  const cardIsTwoSided = isTwoSided(item);

  const handleExpand = () => {
    setState({
      expanded: true,
      showingBack: false,
    });

    // Standard scroll position calculation for all cards
    const topOfCard =
      Math.floor(index / cardsPerRow) * cardMinHeight -
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
    ]).start();
  };

  const handleCollapse = () => {
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

  const rotationDegrees = cardSideways
    ? decklist.side === 'Dark'
      ? '90deg'
      : '270deg'
    : '0deg';

  // For sideways cards, we need to adjust dimensions to ensure they fill properly after rotation
  // For normal cards, explicitly use cardWidth and cardHeight instead of percentages
  const cardDimensions = cardSideways
    ? {width: cardHeight, height: cardWidth}
    : {width: cardWidth, height: cardHeight};

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
          overflow: 'visible',
        }}>
        <View
          style={{
            position: cardSideways ? 'absolute' : 'relative',
            width: cardDimensions.width,
            height: cardDimensions.height,
            transform: cardSideways ? [{rotate: rotationDegrees}] : [],
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <FastImage
            source={{
              uri:
                state.showingBack && cardIsTwoSided
                  ? item.imageBackUrl
                  : item.imageUrl,
            }}
            style={{
              ...styles.decklistGridImage,
              width: '100%',
              height: '100%',
            }}
            resizeMode={FastImage.resizeMode.contain}

          />
        </View>
      </View>

      {/* Expanded view */}
      <Animated.View
        collapsable={false}
        style={{
          ...styles.decklistExpandedOuterContainer,
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
          overflow: 'visible',
        }}>
        <Animated.View
          collapsable={false}
          style={{
            ...styles.decklistExpandedContainer,
            position: 'absolute',
            left: leftAnim,
            top: topAnim,
            width: cardWidth,
            height: cardHeight,
            transform: [{scale: scaleAnim}],
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'visible',
          }}>
          <View
            style={{
              position: cardSideways ? 'absolute' : 'relative',
              width: cardDimensions.width,
              height: cardDimensions.height,
              transform: cardSideways ? [{rotate: rotationDegrees}] : [],
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <FastImage
              source={{
                uri:
                  state.showingBack && cardIsTwoSided
                    ? item.imageBackUrl
                    : item.imageUrl,
              }}
              style={{
                ...styles.decklistGridImage,
                width: '100%',
                height: '100%',
              }}
              resizeMode={FastImage.resizeMode.contain}

            />
          </View>
        </Animated.View>
      </Animated.View>
    </>
  );
};

export default DecklistsScreenGridItem;
