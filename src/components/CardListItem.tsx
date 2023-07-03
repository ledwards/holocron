import React, { PureComponent } from 'react';
import { View } from 'react-native';
import FastImage from 'react-native-fast-image'

import { ListItem } from 'react-native-elements';

class CardListItem extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      expanded: false,
      showingBack: false,
    }
  }

  toggleExpanded = () => {
    this.setState({
      showingBack: this.props.item.twoSided && this.state.expanded && !this.state.showingBack,
      expanded: (this.props.item.twoSided && this.state.expanded && this.state.showingBack)
        || (!this.props.item.twoSided && this.state.expanded) ? false : true,
    });

    this.props.flatListRef.scrollToIndex({ animated: true, index: this.props.index });

    // TODO: Animate the change?
    // TODO: ScrollTo this location
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
        style={this.props.expanded ? {
          marginLeft: -15,
        } : {
          marginLeft: 0
        }}
        button
        onPress={this.toggleExpanded}
        containerStyle={!this.state.expanded ? {
          backgroundColor: this.props.item.side == 'Dark' ? darkColor : lightColor,
          overflow: 'hidden'
        } : {
          backgroundColor: 'black',
          width: '100%',
        }}>
        <View style={!this.state.expanded ? {
          position: 'absolute',
          top: 0 + this.props.item.offsetY,
          right: -60,
          width: '60%',
          height: 120 + this.props.item.offsetHeight,
          overflow: 'hidden'
        } : {
          height: '100%',
          width: '100%',
        }}>
          <FastImage
            source={{
              uri: this.state.showingBack ?
                this.props.item.displayBackImageUrl :
                this.props.item.displayImageUrl
            }}
            style={!this.state.expanded ? {
              position: 'relative',
              left: -30,
              top: 0,
              width: '100%',
              height: '100%',
            } : {
              height: this.props.item.sideways ? 275 : 550,
              borderRadius: 10,
            }}
          />
        </View>

        <ListItem.Content style={{}}>
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
