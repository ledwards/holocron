import {useState, useEffect} from 'react';
import {View, Dimensions, Keyboard} from 'react-native';
import FastImage from 'react-native-fast-image';
import {ListItem} from 'react-native-elements';

import styles from '../../styles/DecklistListItemStyles';

const DecklistListItem = props => {
  const windowWidth = Dimensions.get('window').width;
  const fillPercent = 0.55;

  const height = props.item.sideways
    ? ((windowWidth / props.item.aspectRatio) * fillPercent) / 2.5
    : (windowWidth * props.item.aspectRatio * fillPercent) / 2.5;

  const [state, setState] = useState({});

  useEffect(() => {
    setState({
      expanded: false,
      showingBack: false,
      screenWidth: windowWidth,
      containerHeight: height / 2,
      labelOpacity: 1.0,
      height: height,
      width: windowWidth * fillPercent,
      theme: props.theme,
    });
  }, []);

  return (
    <View
      style={{
        height: state.containerHeight,
      }}>
      <ListItem
        id={props.index}
        style={{marginLeft: -15}}
        button
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
            alpha={FastImage.resizeMode.cover}
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
