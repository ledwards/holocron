import React, { PureComponent } from 'react';
import { View } from 'react-native';
import FastImage from 'react-native-fast-image'

import { ListItem } from 'react-native-elements';

class CardListItem extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const lightColor = 'rgba(219, 227, 232, 1.0)';
    const darkColor = `rgba(43, 47, 51, 1.0)`;
    const alpha = '0.3';
    const lightAlphaColor = lightColor.replace('1.0', alpha)
    const darkAlphaColor = darkColor.replace('1.0', alpha)

    return (
      <ListItem
        style={{ marginLeft: -15 }}
        button
        onPress={this.props.callback}
        containerStyle={{ backgroundColor: this.props.item.side == 'Dark' ? darkColor : lightColor, overflow: 'hidden' }}>
        <View style={{ position: 'absolute', top: 0 + this.props.item.offsetY, right: -60, width: '60%', height: 120 + this.props.item.offsetHeight, overflow: 'hidden' }}>
          <FastImage
            source={{ uri: this.props.item.displayImageUrl }}
            style={{
              position: 'relative',
              left: -30,
              top: 0,
              width: '100%',
              height: '100%',
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
            {`${this.props.item.set} • ${this.props.item.side} • ${this.props.item.rarity}`}
          </ListItem.Subtitle>
        </ListItem.Content>

      </ListItem >
    );
  }
}

export default CardListItem;
