import React, {useState, useContext, useEffect} from 'react';
import {Animated, Easing, useWindowDimensions, Keyboard, Text, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import {ListItem} from 'react-native-elements';
import {BlurView} from '@react-native-community/blur';

import styles from '../../styles/CardListItemStyles';
import ThemeContext from '../../contexts/ThemeContext';
import { CardSide } from '../../types/enums';
import { Theme, ScrollToIndexFunction } from '../../types/interfaces';

export interface CardListItemProps {
  item: {
    sideways: boolean;
    aspectRatio: number;
    displayImageUrl: string;
    displayBackImageUrl: string;
    displayTitle: string;
    displayExpansionSet: string;
    type: string;
    rarity: string;
    side: CardSide;
    twoSided: boolean;
    offsetY: number;
  };
  index: number;
  scrollToIndex: ScrollToIndexFunction;
  quantity?: number;
  onPress?: () => void;
  testID?: string;
  flatListRef?: Animated.FlatList<any> | undefined;
  theme?: Theme;
}

const CardListItem = (props: CardListItemProps) => {
  const window = useWindowDimensions();
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);
  const windowWidth = measuredWidth || window.width;
  const fillPercent = 0.55;

  const startingHeight = props.item.sideways
    ? ((windowWidth / props.item.aspectRatio) * fillPercent) / 2.5
    : (windowWidth * props.item.aspectRatio * fillPercent) / 2.5;

  interface CardListItemState {
    expanded: boolean;
    showingBack: boolean;
    screenWidth: number;
    heightAnim: Animated.Value;
    widthAnim: Animated.Value;
    containerHeightAnim: Animated.Value;
    labelOpacityAnim: Animated.Value;
    minHeight: number;
    maxHeight: number;
    minWidth: number;
    maxWidth: number;
    posY: number;
  }

  const [state, setState] = useState<CardListItemState>({
    expanded: false,
    showingBack: false,
    screenWidth: windowWidth,
    heightAnim: new Animated.Value(startingHeight),
    widthAnim: new Animated.Value(windowWidth * fillPercent),
    containerHeightAnim: new Animated.Value(startingHeight / 2),
    labelOpacityAnim: new Animated.Value(1.0),
    minHeight: startingHeight,
    maxHeight: windowWidth * props.item.aspectRatio,
    minWidth: windowWidth * fillPercent,
    maxWidth: windowWidth,
    posY: 0,
  });

  // Preserve the original crop geometry, sized to the actual list pane.
  useEffect(() => {
    const maxHeight = windowWidth * props.item.aspectRatio;
    state.heightAnim.setValue(state.expanded ? maxHeight : startingHeight);
    state.widthAnim.setValue(state.expanded ? windowWidth : windowWidth * fillPercent);
    state.containerHeightAnim.setValue(state.expanded ? maxHeight : startingHeight / 2);
    setState(previous => ({...previous, screenWidth: windowWidth,
      minHeight: startingHeight, maxHeight, minWidth: windowWidth * fillPercent,
      maxWidth: windowWidth}));
  }, [windowWidth, startingHeight, props.item.aspectRatio]);

  // Use context to get theme if not provided as prop
  const theme = props.theme || useContext(ThemeContext) || {
    name: 'dark',
    backgroundColor: '#000000',
    foregroundColor: '#FFFFFF',
    dividerColor: '#444444',
    translucentBackgroundColor: 'rgba(0,0,0,0.5)'
  };

  const toggleExpanded = (): void => {
    Keyboard.dismiss();
    const needsToExpand = !state.expanded;
    const needsToFlip =
      props.item.twoSided && state.expanded && !state.showingBack;
    const needsToCollapse =
      (props.item.twoSided && state.expanded && state.showingBack) ||
      (!props.item.twoSided && state.expanded);

    props.scrollToIndex(props.index);

    const t = 300;
    const easing = Easing.elastic(0);

    if (needsToExpand || needsToCollapse) {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(state.heightAnim, {
            toValue: state.expanded ? state.minHeight : state.maxHeight,
            duration: t,
            useNativeDriver: false,
            easing: easing,
          }),
          Animated.timing(state.widthAnim, {
            toValue: state.expanded ? state.minWidth : state.maxWidth,
            duration: t,
            useNativeDriver: false,
            easing: easing,
          }),
          Animated.timing(state.containerHeightAnim, {
            toValue: state.expanded ? state.minHeight / 2 : state.maxHeight,
            duration: t,
            useNativeDriver: false,
            easing: easing,
          }),
          Animated.timing(state.labelOpacityAnim, {
            toValue: state.expanded ? 1.0 : 0.0,
            duration: t,
            useNativeDriver: false,
            easing: easing,
          }),
        ]),
      ])
        // We scroll a second time, because items at the bottom of the list require it
        .start(() => props.scrollToIndex(props.index));
    }

    setState({
      ...state,
      showingBack: needsToFlip,
      expanded: !needsToCollapse,
    });
  };

  return (
    <Animated.View
      // Size the row from its pane, never from its own art: the art is sized
      // from this width, so letting it feed back re-measured forever.
      onLayout={event => {
        const width = Math.round(event.nativeEvent.layout.width);
        setMeasuredWidth(previous => previous === width ? previous : width);
      }}
      style={{
        alignSelf: 'stretch',
        height: state.containerHeightAnim,
      }}>
      <ListItem
        testID={props.testID || `card-item-${props.index}`}
        accessibilityLabel={props.item.displayTitle || `card-item-${props.index}`}
        style={{marginLeft: -15}}
        onPress={props.onPress || toggleExpanded}
        containerStyle={{
          ...styles.cardListItemContainer,
          ...(props.item.side === CardSide.Dark
            ? styles.cardListItemContainerDarkSide
            : styles.cardListItemContainerLightSide),
        }}>
        <Animated.View
          style={{
            ...styles.cardListItem,
            height: state.heightAnim,
            width: state.widthAnim,
            ...(!state.expanded
              ? {
                  ...styles.cardListItemExpanded,
                  top: 0 + props.item.offsetY,
                }
              : styles.cardListItemCollapsed),
          }}>
          <FastImage
            source={{
              uri: state.showingBack
                ? props.item.displayBackImageUrl
                : props.item.displayImageUrl,
            }}
            resizeMode={FastImage.resizeMode.cover}
            style={{
              ...styles.cardListItemImage,
              ...(!state.expanded
                ? styles.cardListItemImageExpanded
                : styles.cardListItemCollapsed),
            }}
          />
        </Animated.View>
        <Animated.View
          style={{
            opacity: state.labelOpacityAnim,
          }}>
          <ListItem.Content>
            <ListItem.Title
              style={{
                ...styles.cardListItemTitle,
                ...(props.item.displayTitle.includes('\n')
                  ? styles.cardListItemTitleLong
                  : styles.cardListItemTitleShort),
                ...(props.item.side === CardSide.Light
                  ? styles.cardListItemTitleLight
                  : styles.cardListItemTitleDark),
              }}>
              {`${props.item.displayTitle}`}
            </ListItem.Title>
            <ListItem.Subtitle
              style={{
                ...styles.cardListItemSubtitle,
                ...(props.item.side === CardSide.Light
                  ? styles.cardListItemSubtitleLight
                  : styles.cardListItemSubtitleDark),
              }}>
              {`${props.item.displayExpansionSet} • ${props.item.type} • ${props.item.rarity}`}
            </ListItem.Subtitle>
          </ListItem.Content>
        </Animated.View>
        {props.quantity && (
          <View
            style={{
              ...styles.cardListItemQuantityContainer,
              height: state.minHeight,
              opacity: state.expanded ? 0 : 1,
            }}>
            <BlurView
              style={styles.cardListItemQuantityBlur}
              blurType={theme.name === 'dark' ? 'dark' : 'light'}
              blurAmount={5}
              reducedTransparencyFallbackColor={
                theme.translucentBackgroundColor
              }
            />
            <Text
              style={{
                ...styles.cardListItemQuantityText,
                color: theme.foregroundColor,
              }}>
              {props.quantity}
            </Text>
          </View>
        )}
      </ListItem>
    </Animated.View>
  );
};

export default React.memo(CardListItem);
