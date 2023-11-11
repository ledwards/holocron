import React, {PureComponent} from 'react';
import {Animated, Easing, Dimensions} from 'react-native';
import FastImage from 'react-native-fast-image';

import {ListItem} from 'react-native-elements';

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
    };
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

    // TODO: native driver:
    // https://stackoverflow.com/questions/63976219/style-property-width-is-not-supported-by-native-animated-module-need-advice-f

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
    const lightColor = 'rgba(219, 227, 232, 1.0)';
    const darkColor = `rgba(43, 47, 51, 1.0)`;
    const alpha = '0.3';
    const lightAlphaColor = lightColor.replace('1.0', alpha);
    const darkAlphaColor = darkColor.replace('1.0', alpha);

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
            backgroundColor:
              this.props.item.side == 'Dark' ? darkColor : lightColor,
            overflow: 'hidden',
            height: '100%',
          }}>
          <Animated.View
            style={
              !this.state.expanded
                ? {
                    backgroundColor: 'black',
                    position: 'absolute',
                    top: 0 + this.props.item.offsetY,
                    right: -60,
                    width: this.state.widthAnim,
                    height: this.state.heightAnim,
                    overflow: 'hidden',
                  }
                : {
                    backgroundColor: 'black',
                    position: 'absolute',
                    right: 0,
                    height: this.state.heightAnim,
                    width: this.state.widthAnim,
                  }
            }>
            <FastImage
              source={{
                uri: this.state.showingBack
                  ? this.props.item.displayBackImageUrl
                  : this.props.item.displayImageUrl,
              }}
              resizeMode={FastImage.resizeMode.cover}
              style={
                !this.state.expanded
                  ? {
                      position: 'relative',
                      left: -30,
                      top: 0,
                      borderRadius: 14,
                      height: '100%',
                    }
                  : {
                      borderRadius: 14,
                      height: '100%',
                      left: 0,
                    }
              }
            />
          </Animated.View>
          <Animated.View
            style={{
              opacity: this.state.labelOpacityAnim,
            }}>
            <ListItem.Content style={{}}>
              <ListItem.Title
                style={{
                  backgroundColor:
                    this.props.item.side == 'Light'
                      ? lightAlphaColor
                      : darkAlphaColor,
                  color:
                    this.props.item.side == 'Light' ? darkColor : lightColor,
                  fontWeight: 'bold',
                  fontSize: this.props.item.displayTitle.includes('\n')
                    ? 10
                    : 16,
                }}>
                {`${this.props.item.displayTitle}`}
              </ListItem.Title>
              <ListItem.Subtitle
                style={{
                  backgroundColor:
                    this.props.item.side == 'Light'
                      ? lightAlphaColor
                      : darkAlphaColor,
                  color:
                    this.props.item.side == 'Light' ? darkColor : lightColor,
                  fontSize: this.props.item.displayTitle.includes('\n')
                    ? 8
                    : 12,
                }}>
                {`${this.props.item.displaySet} • ${this.props.item.type} • ${this.props.item.rarity}`}
              </ListItem.Subtitle>
            </ListItem.Content>
          </Animated.View>
        </ListItem>
      </Animated.View>
    );
  }
}

export default CardListItem;
