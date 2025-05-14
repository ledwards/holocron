import React, {useContext} from 'react';
import {View} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {BottomTabBarHeightContext} from '@react-navigation/bottom-tabs';

import styles from '../../styles/CardSearchFooterStyles'; // TODO: Rename to DecklistSearchFooterStyles
import layout from '../../constants/layout';
import ThemeContext from '../../contexts/ThemeContext';
import {Theme} from '../../types/interfaces';

type DecklistEmptyFooterProps = {
  nativeFooterHeight: number;
  tabBarHeight: number;
};

const DecklistEmptyFooter = (props: DecklistEmptyFooterProps) => {
  const theme = useContext<Theme | null>(ThemeContext);

  return (
    <BottomTabBarHeightContext.Consumer>
      {tabBarHeight => (
        <View
          style={{
            ...styles.footerContainer,
            height: (tabBarHeight || 0) + layout.nativeFooterHeight() + 10,
          }}>
          <BlurView
            style={{
              position: 'absolute',
              bottom: 0,
              height: (tabBarHeight || 0) + layout.nativeFooterHeight() + 10,
              width: '100%',
            }}
            blurType={theme?.name as any}
            blurAmount={10}
            reducedTransparencyFallbackColor={theme?.translucentBackgroundColor}
          />
        </View>
      )}
    </BottomTabBarHeightContext.Consumer>
  );
};

export default DecklistEmptyFooter;
