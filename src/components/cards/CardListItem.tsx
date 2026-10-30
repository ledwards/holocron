import React, {useState, useContext, useEffect} from 'react';
import {Animated, Easing, useWindowDimensions, Keyboard, Text, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import {ListItem} from 'react-native-elements';
import {BlurView} from '@react-native-community/blur';

import styles from '../../styles/CardListItemStyles';
import ThemeContext from '../../contexts/ThemeContext';
import {usePaneInsets} from '../../contexts/PaneInsetsContext';
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
  /** Told when the row opens or closes inline (only rows without onPress). */
  onExpandedChange?: (expanded: boolean) => void;
  testID?: string;
  flatListRef?: Animated.FlatList<any> | undefined;
  theme?: Theme;
}

const CardListItem = (props: CardListItemProps) => {
  const window = useWindowDimensions();
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);
  // Rows run full-bleed under the iPhone Duo strip; the art and title are
  // sized and placed within the part of the row the strip leaves clear.
  const insets = usePaneInsets();
  const windowWidth = Math.max(0, (measuredWidth || window.width) - insets.left - insets.right);
  const fillPercent = 0.55;

  const startingHeight = props.item.sideways
    ? ((windowWidth / props.item.aspectRatio) * fillPercent) / 2.5
    : (windowWidth * props.item.aspectRatio * fillPercent) / 2.5;

  // Geometry is derived from the measured width on every render, not kept in
  // state: when iPhone Duo opens, every row is re-measured at once, and a
  // setState per row from an effect chained past React's nested-update limit.
  const minHeight = startingHeight;
  const maxHeight = windowWidth * props.item.aspectRatio;
  const minWidth = windowWidth * fillPercent;
  const maxWidth = windowWidth;

  interface CardListItemState {
    expanded: boolean;
    showingBack: boolean;
    heightAnim: Animated.Value;
    widthAnim: Animated.Value;
    containerHeightAnim: Animated.Value;
    labelOpacityAnim: Animated.Value;
  }

  const [state, setState] = useState<CardListItemState>({
    expanded: false,
    showingBack: false,
    heightAnim: new Animated.Value(minHeight),
    widthAnim: new Animated.Value(minWidth),
    containerHeightAnim: new Animated.Value(minHeight / 2),
    labelOpacityAnim: new Animated.Value(1.0),
  });

  // Preserve the original crop geometry, sized to the actual list pane.
  useEffect(() => {
    state.heightAnim.setValue(state.expanded ? maxHeight : minHeight);
    state.widthAnim.setValue(state.expanded ? maxWidth : minWidth);
    state.containerHeightAnim.setValue(state.expanded ? maxHeight : minHeight / 2);
  }, [minHeight, maxHeight, minWidth, maxWidth]);

  // Rows open inline only on a compact screen. When the screen widens into
  // side-by-side panes (iPhone Duo opening) the card moves to the detail pane,
  // so an open row folds back into the list as the phone opens.
  const opensDetail = !!props.onPress;
  useEffect(() => {
    if (!opensDetail || !state.expanded) return;
    // Set, not animated: the system already animates the change of display,
    // and the width re-measure that follows would cut an animation short.
    state.heightAnim.setValue(minHeight);
    state.widthAnim.setValue(minWidth);
    state.containerHeightAnim.setValue(minHeight / 2);
    state.labelOpacityAnim.setValue(1);
    setState(previous => ({...previous, expanded: false, showingBack: false}));
  }, [opensDetail]);

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
            toValue: state.expanded ? minHeight : maxHeight,
            duration: t,
            useNativeDriver: false,
            easing: easing,
          }),
          Animated.timing(state.widthAnim, {
            toValue: state.expanded ? minWidth : maxWidth,
            duration: t,
            useNativeDriver: false,
            easing: easing,
          }),
          Animated.timing(state.containerHeightAnim, {
            toValue: state.expanded ? minHeight / 2 : maxHeight,
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
    props.onExpandedChange?.(!needsToCollapse);
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
              : {...styles.cardListItemCollapsed, right: insets.right}),
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
            marginLeft: insets.left,
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
              height: minHeight,
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
