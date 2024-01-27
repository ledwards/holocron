import React, {useState, useEffect, useContext} from 'react';
import {View} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {BottomTabBarHeightContext} from '@react-navigation/bottom-tabs';

import styles from '../../styles/CardSearchFooterStyles'; // TODO: Rename to DecklistSearchFooterStyles
import layout from '../../constants/layout';
import ThemeContext from '../../contexts/ThemeContext';

type DecklistEmptyFooterProps = {
  nativeFooterHeight: number;
  tabBarHeight: number;
};

const DecklistEmptyFooter = (props: DecklistEmptyFooterProps) => {
  const theme = useContext(ThemeContext);

  return (
    <BottomTabBarHeightContext.Consumer>
      {tabBarHeight => (
        <View
          style={{
            ...styles.footerContainer,
            height: tabBarHeight + layout.nativeFooterHeight() + 10,
          }}>
          <BlurView
            style={{
              position: 'absolute',
              bottom: 0,
              height: tabBarHeight + layout.nativeFooterHeight() + 10,
              width: '100%',
            }}
            blurType={theme.name}
            blurAmount={10}
            reducedTransparencyFallbackColor={theme.translucentBackgroundColor}
          />
        </View>
      )}
    </BottomTabBarHeightContext.Consumer>
  );
};

export default DecklistEmptyFooter;
