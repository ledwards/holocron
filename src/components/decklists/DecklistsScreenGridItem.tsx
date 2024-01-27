import {
  View,
  Animated,
  Easing,
  Keyboard,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import React, {useRef, useState, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';

import styles from '../../styles/DecklistsScreenGridViewStyles';
import layout from '../../constants/layout';

// TODO: translucent bottom bar

// TODO: DecklistCard class
const SIDEWAYS_CARDS = [
  'Executor',
  'Flagship Executor',
  'Finalizer',
  "Maul's Double-Bladed Lightsaber",
];

const cardIsSideways = (card: any) => {
  return card.subType == 'Site' || SIDEWAYS_CARDS.includes(card.title);
};

const DecklistsScreenGridItem = ({item, decklist, index, scrollViewRef}) => {
  const navigation = useNavigation();

  const [state, setState] = React.useState({
    expanded: false,
    showingBack: false,
  });

  const windowHeight = Dimensions.get('window').height;
  const windowWidth = Dimensions.get('window').width;
  const cardsPerRow = 4;
  const cardWidth = windowWidth / cardsPerRow;
  const cardHeight = cardWidth / decklist.aspectRatio;
  const cardMinWidth = cardWidth;
  const cardMaxWidth = windowWidth;
  const cardMinHeight = cardHeight;
  const cardMaxHeight = windowWidth / decklist.aspectRatio;

  const minScale = cardIsSideways(item) ? cardHeight / cardWidth : 1;
  const maxScale = cardMaxHeight / cardMinHeight;
  const scale = useRef(new Animated.Value(minScale)).current;

  const initialRelativeLeft = 0;
  const maxRelativeLeft =
    (-1 * (((index % cardsPerRow) - 1.5) * cardWidth)) / minScale;
  const relativeLeft = useRef(new Animated.Value(0)).current;

  const initialRelativeTop = 0;
  let maxRelativeTop = 0;

  const topHeaderHeight = layout.nativeHeaderTopHeight() == 0 ? 68 : 75;
  const rowNumber = Math.floor(index / cardsPerRow);

  switch (rowNumber) {
    case 0:
      maxRelativeTop = cardMinHeight + topHeaderHeight;
      if (cardIsSideways(item)) {
        maxRelativeTop = maxRelativeTop - 0.42 * cardMinHeight;
      }
      break;
    case 1:
      maxRelativeTop = 0.25 * cardMinHeight + topHeaderHeight;
      if (cardIsSideways(item)) {
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

  const toggleExpanded = (event, item, index) => {
    Keyboard.dismiss();
    const needsToExpand = !state.expanded;
    const needsToFlip = item.twoSided && state.expanded && !state.showingBack;
    const needsToCollapse =
      (item.twoSided && state.expanded && state.showingBack) ||
      (!item.twoSided && state.expanded);

    if (needsToExpand || needsToCollapse) {
      // things to do before the animation
      if (needsToExpand) {
        setState({
          expanded: needsToExpand,
          showingBack: needsToFlip,
        });

        const topOfCard =
          Math.floor(index / cardsPerRow) * cardMinHeight -
          (windowHeight - cardMaxHeight) / 2 -
          layout.tabBarHeight() -
          100;

        scrollView.scrollTo({
          y: topOfCard,
          animated: true,
        });
      }

      const t = 200;
      const easingOut = Easing.ease;
      const easingIn = Easing.ease;

      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, {
            toValue: needsToExpand ? maxScale : minScale,
            duration: t,
            useNativeDriver: false,
            easing: needsToExpand ? easingOut : easingIn,
          }),
          Animated.timing(relativeLeft, {
            toValue: needsToExpand ? 1 : 0,
            duration: t,
            useNativeDriver: false,
            easing: needsToExpand ? easingOut : easingIn,
          }),
          Animated.timing(relativeTop, {
            toValue: needsToExpand ? 1 : 0,
            duration: t,
            useNativeDriver: false,
            easing: needsToExpand ? easingOut : easingIn,
          }),
        ]),
      ]).start(() => {
        // things to do after the animation
        if (needsToCollapse) {
          setState({
            expanded: needsToExpand,
            showingBack: needsToFlip,
          });
        }
      });
    }
  };

  let scaleAnim = scale.interpolate({
    inputRange: [minScale, maxScale],
    outputRange: [minScale, maxScale],
  });

  let leftAnim = relativeLeft.interpolate({
    inputRange: [0, 1],
    outputRange: [initialRelativeLeft, maxRelativeLeft],
  });

  let topAnim = relativeTop.interpolate({
    inputRange: [0, 1],
    outputRange: [initialRelativeTop, maxRelativeTop],
  });

  return (
    <>
      <View
        style={{
          ...styles.decklistGridInner,
          display: state.expanded ? 'none' : 'block',
          flex: `${(1 / cardsPerRow) * 100}%`,
          transform: [{scale: minScale}],
        }}>
        <TouchableOpacity
          onPress={event => toggleExpanded(event, item, index)}
          activeOpacity={1}>
          <FastImage
            source={{uri: item.imageUrl}}
            style={{
              ...styles.decklistGridImage,
              width: cardMinWidth,
              height: cardMinHeight,
              transform: cardIsSideways(item)
                ? [{rotate: decklist.side == 'Dark' ? '90deg' : '270deg'}]
                : [],
            }}
            resizeMode={FastImage.resizeMode.contain}
          />
        </TouchableOpacity>
      </View>

      <Animated.View
        style={{
          display: state.expanded ? 'block' : 'none',
          zIndex: state.expanded ? 1 : 0,
          transform: [{scale: minScale}],
        }}>
        <Animated.View
          style={{
            position: 'relative',
            zIndex: state.expanded ? 1 : 0,
            left: leftAnim,
            top: topAnim,
            transform: [{scale: scaleAnim}],
          }}>
          <TouchableOpacity
            onPress={event => toggleExpanded(event, item, index)}
            activeOpacity={1}>
            <FastImage
              source={{uri: item.imageUrl}}
              style={{
                ...styles.decklistGridImage,
                width: cardWidth,
                height: cardHeight,
                transform: cardIsSideways(item)
                  ? [{rotate: decklist.side == 'Dark' ? '90deg' : '270deg'}]
                  : [],
              }}
              resizeMode={FastImage.resizeMode.contain}
            />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </>
  );
};
export default DecklistsScreenGridItem;
