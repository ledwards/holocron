import {useState} from 'react';
import {View, useWindowDimensions} from 'react-native';
import FastImage from 'react-native-fast-image';
import {ListItem} from 'react-native-elements';

import styles from '../../styles/DecklistListItemStyles';
import {usePaneInsets} from '../../contexts/PaneInsetsContext';
import {Theme} from '../../types/interfaces';

interface DecklistItem {
  sideways: boolean;
  aspectRatio: number;
  imageUrl: string;
  side: string;
  offsetY: number;
  displayTitle: string;
  displaySubtitle: string;
}

interface DecklistListItemProps {
  item: DecklistItem;
  index: number;
  theme: Theme | null;
}

const DecklistListItem = (props: DecklistListItemProps) => {
  const window = useWindowDimensions();
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);
  // Full-bleed under the iPhone Duo strip; sized and labelled within the clear part.
  const insets = usePaneInsets();
  const windowWidth = Math.max(0, (measuredWidth || window.width) - insets.left - insets.right);
  const fillPercent = 0.55;

  const height = props.item.sideways
    ? ((windowWidth / props.item.aspectRatio) * fillPercent) / 2.5
    : (windowWidth * props.item.aspectRatio * fillPercent) / 2.5;

  const state = {
    expanded: false,
    containerHeight: height / 2,
    labelOpacity: 1,
    height,
    width: windowWidth * fillPercent,
  };

  return (
    <View
      onLayout={event => {
        const width = Math.round(event.nativeEvent.layout.width);
        setMeasuredWidth(previous => previous === width ? previous : width);
      }}
      style={{
        alignSelf: 'stretch',
        height: state.containerHeight,
      }}>
      <ListItem
        Component={View}
        style={{marginLeft: -15}}
        onPress={() => { /* No action needed */ }}
        containerStyle={{
          ...styles.decklistListItemContainer,
          ...(props.item.side == 'Dark'
            ? styles.decklistListItemContainerDarkSide
            : styles.decklistListItemContainerLightSide),
        }}>
        <View
          style={{
            ...styles.decklistListItem,
            height: state.height,
            width: state.width,
            ...(!state.expanded
              ? {
                  ...styles.decklistListItemExpanded,
                  top: 0 + props.item.offsetY,
                }
              : styles.decklistListItemCollapsed),
          }}>
          <FastImage
            source={{
              uri: props.item.imageUrl,
            }}
            resizeMode={FastImage.resizeMode.cover}
            style={{
              ...styles.decklistListItemImage,
              ...(!state.expanded
                ? styles.decklistListItemImageExpanded
                : styles.decklistListItemCollapsed),
            }}
          />
        </View>
        <View
          style={{
            marginLeft: insets.left,
            opacity: state.labelOpacity,
          }}>
          <ListItem.Content>
            <ListItem.Title
              style={{
                ...styles.decklistListItemTitle,
                ...styles.decklistListItemTitleShort,
                ...(props.item.side == 'Light'
                  ? styles.decklistListItemTitleLight
                  : styles.decklistListItemTitleDark),
              }}>
              {`${props.item.displayTitle}`}
            </ListItem.Title>
            <ListItem.Subtitle
              style={{
                ...styles.decklistListItemSubtitle,
                ...(props.item.side == 'Light'
                  ? styles.decklistListItemSubtitleLight
                  : styles.decklistListItemSubtitleDark),
              }}>
              {props.item.displaySubtitle}
            </ListItem.Subtitle>
          </ListItem.Content>
        </View>
      </ListItem>
    </View>
  );
};

export default DecklistListItem;
