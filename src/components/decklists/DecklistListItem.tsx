import {PureComponent} from 'react';
import {Animated, Easing, Dimensions, Keyboard} from 'react-native';
import FastImage from 'react-native-fast-image';
import {ListItem} from 'react-native-elements';

import styles from '../../styles/DecklistListItemStyles';

class DecklistListItem extends PureComponent {
  constructor(props) {
    super(props);

    const windowWidth = Dimensions.get('window').width;
    const fillPercent = 0.55;

    const startingHeight = this.props.item.sideways
      ? ((windowWidth / this.props.item.aspectRatio) * fillPercent) / 2.5
      : (windowWidth * this.props.item.aspectRatio * fillPercent) / 2.5;

    this.state = {
      expanded: false,
      showingBack: false,
      screenWidth: windowWidth,
      heightAnim: new Animated.Value(startingHeight),
      widthAnim: new Animated.Value(windowWidth * fillPercent),
      containerHeightAnim: new Animated.Value(startingHeight / 2),
      labelOpacityAnim: new Animated.Value(1.0),
      minHeight: startingHeight,
      maxHeight: windowWidth * this.props.item.aspectRatio,
      minWidth: windowWidth * fillPercent,
      maxWidth: windowWidth,
      posY: 0,
      theme: this.props.theme,
    };
  }

  componentDidMount() {
    this.setState({
      theme: this.props.theme,
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.theme.name != this.props.theme.name) {
      this.setState({
        theme: this.props.theme,
      });
    }
  }

  render() {
    return (
      <Animated.View
        style={{
          height: this.state.containerHeightAnim,
        }}>
        <ListItem
          id={this.props.index}
          style={{marginLeft: -15}}
          button
          containerStyle={{
            ...styles.decklistListItemContainer,
            ...(this.props.item.side == 'Dark'
              ? styles.decklistListItemContainerDarkSide
              : styles.decklistListItemContainerLightSide),
          }}>
          <Animated.View
            style={{
              ...styles.decklistListItem,
              height: this.state.heightAnim,
              width: this.state.widthAnim,
              ...(!this.state.expanded
                ? {
                    ...styles.decklistListItemExpanded,
                    top: 0 + this.props.item.offsetY,
                  }
                : styles.decklistListItemCollapsed),
            }}>
            <FastImage
              source={{
                uri: this.props.item.imageUrl,
              }}
              alpha={FastImage.resizeMode.cover}
              style={{
                ...styles.decklistListItemImage,
                ...(!this.state.expanded
                  ? styles.decklistListItemImageExpanded
                  : styles.decklistListItemCollapsed),
              }}
            />
          </Animated.View>
          <Animated.View
            style={{
              opacity: this.state.labelOpacityAnim,
            }}>
            <ListItem.Content>
              <ListItem.Title
                style={{
                  ...styles.decklistListItemTitle,
                  ...styles.decklistListItemTitleShort,
                  ...(this.props.item.side == 'Light'
                    ? styles.decklistListItemTitleLight
                    : styles.decklistListItemTitleDark),
                }}>
                {`${this.props.item.displayTitle}`}
              </ListItem.Title>
              <ListItem.Subtitle
                style={{
                  ...styles.decklistListItemSubtitle,
                  ...(this.props.item.side == 'Light'
                    ? styles.decklistListItemSubtitleLight
                    : styles.decklistListItemSubtitleDark),
                }}>
                {this.props.item.displaySubtitle}
              </ListItem.Subtitle>
            </ListItem.Content>
          </Animated.View>
        </ListItem>
      </Animated.View>
    );
  }
}

export default DecklistListItem;
