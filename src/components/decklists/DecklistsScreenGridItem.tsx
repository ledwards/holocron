import {
  View,
  Animated,
  Easing,
  Keyboard,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import React, {useRef, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';

import styles from '../../styles/DecklistsScreenGridViewStyles';

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

const DecklistsScreenGridItem = ({item, decklist, index}) => {
  const navigation = useNavigation();

  const windowWidth = Dimensions.get('window').width;
  const cardsPerRow = 4;
  const cardWidth = windowWidth / cardsPerRow;
  const cardHeight = cardWidth / decklist.aspectRatio;
  const cardMinWidth = cardWidth;
  const cardMaxWidth = windowWidth;
  const cardMinHeight = cardHeight;
  const cardMaxHeight = windowWidth / decklist.aspectRatio;

  const minScale = cardIsSideways(item) ? cardHeight / cardWidth : 1;
  const maxScale = (minScale * cardMaxHeight) / cardMinHeight;

  const initialRelativeLeft = 0;
  const maxRelativeLeft = -1 * (((index % cardsPerRow) - 1.5) * cardWidth);

  const [state, setState] = React.useState({
    expanded: false,
    showingBack: false,
  });

  const scale = useRef(new Animated.Value(minScale)).current;
  const relativeLeft = useRef(new Animated.Value(0)).current;

  navigation.setOptions({
    title: decklist.displaySubtitle,
  });

  item.twoSided = item.backImageUrl != null;

  const toggleExpanded = (item: any) => {
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
      }

      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, {
            toValue: needsToExpand ? maxScale : minScale,
            duration: 250,
            useNativeDriver: false,
          }),
          Animated.timing(relativeLeft, {
            toValue: needsToExpand ? 1 : 0,
            duration: 250,
            useNativeDriver: false,
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

  return (
    <>
      <View
        style={{
          ...styles.decklistGridInner,
          display: state.expanded ? 'none' : 'block',
          flex: `${(1 / cardsPerRow) * 100}%`,
          transform: [{scale: minScale}],
        }}>
        <TouchableOpacity onPress={() => toggleExpanded(item)}>
          <FastImage
            source={{uri: item.imageUrl}}
            style={{
              ...styles.decklistGridImage,
              width: cardMinWidth,
              height: cardMinHeight,
              transform: cardIsSideways(item) ? [{rotate: '270deg'}] : [],
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
            transform: [{scale: scaleAnim}],
          }}>
          <TouchableOpacity onPress={() => toggleExpanded(item)}>
            <FastImage
              source={{uri: item.imageUrl}}
              style={{
                ...styles.decklistGridImage,
                width: cardWidth,
                height: cardHeight,
                transform: cardIsSideways(item) ? [{rotate: '270deg'}] : [],
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
