import {PureComponent} from 'react';
import {Animated, Easing, Dimensions} from 'react-native';
import FastImage from 'react-native-fast-image';
import {ListItem} from 'react-native-elements';

import styles from '../styles/CardListItemStyles';

class CardListItem extends PureComponent {
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

  toggleExpanded = () => {
    const needsToExpand = !this.state.expanded;
    const needsToFlip =
      this.props.item.twoSided &&
      this.state.expanded &&
      !this.state.showingBack;
    const needsToCollapse =
      (this.props.item.twoSided &&
        this.state.expanded &&
        this.state.showingBack) ||
      (!this.props.item.twoSided && this.state.expanded);

    this.props.scrollToIndex(this.props.index);

    const t = 300;
    const easing = Easing.elastic(0);

    if (needsToExpand || needsToCollapse) {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(this.state.heightAnim, {
            toValue: this.state.expanded
              ? this.state.minHeight
              : this.state.maxHeight,
            duration: t,
            useNativeDriver: false,
            easing: easing,
          }),
          Animated.timing(this.state.widthAnim, {
            toValue: this.state.expanded
              ? this.state.minWidth
              : this.state.maxWidth,
            duration: t,
            useNativeDriver: false,
            easing: easing,
          }),
          Animated.timing(this.state.containerHeightAnim, {
            toValue: this.state.expanded
              ? this.state.minHeight / 2
              : this.state.maxHeight,
            duration: t,
            useNativeDriver: false,
            easing: easing,
          }),
          Animated.timing(this.state.labelOpacityAnim, {
            toValue: this.state.expanded ? 1.0 : 0.0,
            duration: t,
            useNativeDriver: false,
            easing: easing,
          }),
        ]),
      ])
        // We scroll a second time, because items at the bottom of the list require it
        .start(() => this.props.scrollToIndex(this.props.index));
    }

    this.setState({
      showingBack: needsToFlip,
      expanded: !needsToCollapse,
    });
  };

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
          onPress={this.toggleExpanded}
          containerStyle={{
            ...styles.cardListItemContainer,
            ...(this.props.item.side == 'Dark'
              ? styles.cardListItemContainerDarkSide
              : styles.cardListItemContainerLightSide),
            borderTopWidth: this.props.index == 0 ? 2 : 0,
            borderColor: this.state.theme.separatorColor,
          }}>
          <Animated.View
            style={{
              ...styles.cardListItem,
              height: this.state.heightAnim,
              width: this.state.widthAnim,
              ...(!this.state.expanded
                ? {
                    ...styles.cardListItemExpanded,
                    top: 0 + this.props.item.offsetY,
                  }
                : styles.cardListItemCollapsed),
            }}>
            <FastImage
              source={{
                uri: this.state.showingBack
                  ? this.props.item.displayBackImageUrl
                  : this.props.item.displayImageUrl,
              }}
              alpha={FastImage.resizeMode.cover}
              style={{
                ...styles.cardListItemImage,
                ...(!this.state.expanded
                  ? styles.cardListItemImageExpanded
                  : styles.cardListItemCollapsed),
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
                  ...styles.cardListItemTitle,
                  ...(this.props.item.displayTitle.includes('\n')
                    ? styles.cardListItemTitleLong
                    : styles.cardListItemTitleShort),
                  ...(this.props.item.side == 'Light'
                    ? styles.cardListItemTitleLight
                    : styles.cardListItemTitleDark),
                }}>
                {`${this.props.item.displayTitle}`}
              </ListItem.Title>
              <ListItem.Subtitle
                style={{
                  ...styles.cardListItemSubtitle,
                  ...(this.props.item.side == 'Light'
                    ? styles.cardListItemSubtitleLight
                    : styles.cardListItemSubtitleDark),
                }}>
                {`${this.props.item.displayExpansionSet} • ${this.props.item.type} • ${this.props.item.rarity}`}
              </ListItem.Subtitle>
            </ListItem.Content>
          </Animated.View>
        </ListItem>
      </Animated.View>
    );
  }
}

export default CardListItem;
