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

// List of cards that should be displayed sideways
const SIDEWAYS_CARDS = [
  'Executor',
  'Flagship Executor',
  'Finalizer',
  "Maul's Double-Bladed Lightsaber",
];

const isSideways = (card) => {
  return card.subType === 'Site' || SIDEWAYS_CARDS.includes(card.title);
};

const DecklistsScreenGridItem = ({
  item, 
  decklist, 
  index, 
  scrollViewRef, 
  windowWidth, 
  cardsPerRow, 
  isExpanded, 
  onCollapseAnimationComplete
}) => {
  const navigation = useNavigation();
  const cardSideways = isSideways(item);
  
  const [state, setState] = useState({
    expanded: false,
    showingBack: false,
  });
  
  // Watch for changes to isExpanded prop
  useEffect(() => {
    if (isExpanded && !state.expanded) {
      handleExpand();
    } else if (!isExpanded && state.expanded) {
      handleCollapse();
    }
  }, [isExpanded]);

  const windowHeight = Dimensions.get('window').height;
  const cardWidth = windowWidth / cardsPerRow;
  const aspectRatio = item.aspectRatio || decklist.aspectRatio || 0.7;
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

  const initialRelativeTop = 0;
  let maxRelativeTop = 0;

  const topHeaderHeight = layout.nativeHeaderTopHeight() == 0 ? 68 : 75;
  const rowNumber = Math.floor(index / cardsPerRow);

  switch (rowNumber) {
    case 0:
      maxRelativeTop = cardMinHeight + topHeaderHeight;
      if (cardSideways) {
        maxRelativeTop = maxRelativeTop - 0.42 * cardMinHeight;
      }
      break;
    case 1:
      maxRelativeTop = 0.25 * cardMinHeight + topHeaderHeight;
      if (cardSideways) {
        maxRelativeTop = maxRelativeTop - 0.19 * cardMinHeight;
      }
      break;
  }

  const relativeTop = useRef(new Animated.Value(0)).current;
  const [scrollView, setScrollView] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      title: decklist.displaySubtitle,
    });
    setScrollView(scrollViewRef.current);
  }, []);

  item.twoSided = item.backImageUrl != null;

  const handleExpand = () => {
    setState({
      expanded: true,
      showingBack: false,
    });

    const topOfCard =
      Math.floor(index / cardsPerRow) * cardMinHeight -
      (windowHeight - cardMaxHeight) / 2 -
      layout.tabBarHeight() -
      100;

    scrollView?.scrollTo({
      y: topOfCard,
      animated: true,
    });

    // Run expansion animation
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
    // Run collapse animation
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

  // Calculate rotation based on card type and deck side
  const rotationDegrees = cardSideways
    ? (decklist.side === 'Dark' ? '90deg' : '270deg')
    : '0deg';

  // For sideways cards, we need to adjust dimensions to ensure they fill properly after rotation
  const cardDimensions = cardSideways
    ? { width: cardHeight, height: cardWidth }
    : { width: '100%', height: '100%' };

  // Normal (non-expanded) view of the card
  const normalView = (
    <View
      style={{
        display: state.expanded ? 'none' : 'flex',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'visible',
      }}>
      <View
        style={{
          position: cardSideways ? 'absolute' : 'relative',
          width: cardDimensions.width,
          height: cardDimensions.height,
          transform: cardSideways ? [{ rotate: rotationDegrees }] : [],
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <FastImage
          source={{uri: item.imageUrl}}
          style={{
            width: '100%',
            height: '100%',
          }}
          resizeMode={FastImage.resizeMode.contain}
        />
      </View>
    </View>
  );

  // Expanded view of the card
  const expandedView = (
    <Animated.View
      collapsable={false}
      style={{
        display: state.expanded ? 'flex' : 'none',
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
        overflow: 'visible',
      }}>
      <Animated.View
        collapsable={false}
        style={{
          position: 'absolute',
          left: leftAnim,
          top: topAnim,
          width: cardWidth,
          height: cardHeight,
          transform: [{ scale: scaleAnim }],
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'visible',
        }}>
        <View
          style={{
            position: cardSideways ? 'absolute' : 'relative',
            width: cardDimensions.width,
            height: cardDimensions.height,
            transform: cardSideways ? [{ rotate: rotationDegrees }] : [],
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <FastImage
            source={{uri: item.imageUrl}}
            style={{
              width: '100%',
              height: '100%',
            }}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>
      </Animated.View>
    </Animated.View>
  );

  return (
    <>
      {normalView}
      {expandedView}
    </>
  );
};

export default DecklistsScreenGridItem;