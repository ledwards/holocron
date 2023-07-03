import React, { PureComponent } from 'react';
import { View, Animated, Easing, Dimensions } from 'react-native';
import FastImage from 'react-native-fast-image'

import { ListItem } from 'react-native-elements';

class CardListItem extends PureComponent {
  constructor(props) {
    super(props);

    const windowWidth = Dimensions.get('window').width

    this.state = {
      expanded: false,
      showingBack: false,
      heightAnim: new Animated.Value(120),
      widthAnim: new Animated.Value(windowWidth * 0.60),
      minHeight: 120,
      maxHeight: this.props.item.sideways ? 275 : 550,
      minWidth: windowWidth * 0.60,
      maxWidth: windowWidth,
    }
  }

  toggleExpanded = () => {
    this.setState({
      showingBack: this.props.item.twoSided && this.state.expanded && !this.state.showingBack,
      expanded: (this.props.item.twoSided && this.state.expanded && this.state.showingBack)
        || (!this.props.item.twoSided && this.state.expanded) ? false : true,
    });

    // TODO: native driver:
    // https://stackoverflow.com/questions/63976219/style-property-width-is-not-supported-by-native-animated-module-need-advice-f
    Animated.sequence([
      Animated.parallel([
        Animated.timing(this.state.heightAnim, {
          toValue: this.state.expanded ? this.state.minHeight : this.state.maxHeight,
          duration: 250,
          useNativeDriver: false,
          easing: Easing.linear,
        }),
        Animated.timing(this.state.widthAnim, {
          toValue: this.state.expanded ? this.state.minWidth : this.state.maxWidth,
          duration: 250,
          useNativeDriver: false,
          easing: Easing.linear,
        }),
      ]),
    ])
      .start(() => {
        this.props.flatListRef.scrollToIndex({ index: this.props.index });
      });
  }

  render() {
    const lightColor = 'rgba(219, 227, 232, 1.0)';
    const darkColor = `rgba(43, 47, 51, 1.0)`;
    const alpha = '0.3';
    const lightAlphaColor = lightColor.replace('1.0', alpha);
    const darkAlphaColor = darkColor.replace('1.0', alpha);

    return (
      <ListItem
        id={this.props.index}
        style={{ marginLeft: -15 }}
        button
        onPress={this.toggleExpanded}
        containerStyle={{
          backgroundColor: this.props.item.side == 'Dark' ? darkColor : lightColor,
          overflow: 'hidden',
          height: this.state.expanded ? this.state.maxHeight : this.state.minHeight / 2,
        }}>

        <Animated.View
          style={!this.state.expanded ? {
            position: 'absolute',
            top: 0 + this.props.item.offsetY,
            right: -60, // TODO: scale?
            width: this.state.widthAnim,
            height: this.state.heightAnim,
            overflow: 'hidden',
          } : {
            position: 'absolute',
            // TODO: this anaimation begins at top of card instead of middle
            right: 0,
            height: this.state.heightAnim,
            width: this.state.widthAnim,
          }}>
          <FastImage
            source={{
              uri: this.state.showingBack ?
                this.props.item.displayBackImageUrl :
                this.props.item.displayImageUrl
            }}
            resizeMode={FastImage.resizeMode.cover}
            style={!this.state.expanded ? {
              position: 'relative',
              left: -30,
              top: 0,
              height: '100%',
            } : {
              height: '100%',
              left: 0,
            }}
          />
        </Animated.View>

        <ListItem.Content style={{
          opacity: !this.state.expanded ? 1.0 : 0
        }}>
          <ListItem.Title style={{
            backgroundColor: this.props.item.side == 'Light' ? lightAlphaColor : darkAlphaColor,
            color: this.props.item.side == 'Light' ? darkColor : lightColor,
            fontWeight: 'bold',
            fontSize: this.props.item.displayTitle.includes('\n') ? 10 : 16
          }}>
            {`${this.props.item.displayTitle}`}
          </ListItem.Title>
          <ListItem.Subtitle style={{
            backgroundColor: this.props.item.side == 'Light' ? lightAlphaColor : darkAlphaColor,
            color: this.props.item.side == 'Light' ? darkColor : lightColor,
            fontSize: this.props.item.displayTitle.includes('\n') ? 8 : 12
          }}
          >
            {`${this.props.item.displaySet} • ${this.props.item.type} • ${parseInt(this.props.item.setNumber) < 200 ? this.props.item.rarity : 'V'}`}
          </ListItem.Subtitle>
        </ListItem.Content>

      </ListItem >
    );
  }
}

export default CardListItem;
