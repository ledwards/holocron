import {useState} from 'react';
import {View, Dimensions} from 'react-native';
import FastImage from 'react-native-fast-image';
import {ListItem} from 'react-native-elements';

import styles from '../../styles/DecklistListItemStyles';
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
  const windowWidth = Dimensions.get('window').width;
  const fillPercent = 0.55;

  const height = props.item.sideways
    ? ((windowWidth / props.item.aspectRatio) * fillPercent) / 2.5
    : (windowWidth * props.item.aspectRatio * fillPercent) / 2.5;

  interface State {
    expanded: boolean;
    showingBack: boolean;
    screenWidth: number;
    containerHeight: number;
    labelOpacity: number;
    height: number;
    width: number;
    theme: Theme | null;
  }

  const [state] = useState<State>({
    expanded: false,
    showingBack: false,
    screenWidth: windowWidth,
    containerHeight: height / 2,
    labelOpacity: 1.0,
    height: height,
    width: windowWidth * fillPercent,
    theme: props.theme,
  });

  // State is already initialized with default values

  return (
    <View
      style={{
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
