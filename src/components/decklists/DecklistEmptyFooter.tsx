import React, {useContext} from 'react';
import {View} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';

import styles from '../../styles/CardSearchFooterStyles'; // TODO: Rename to DecklistSearchFooterStyles
import ThemeContext from '../../contexts/ThemeContext';
import {Theme} from '../../types/interfaces';

type DecklistEmptyFooterProps = {
  nativeFooterHeight: number;
  tabBarHeight: number;
};

const DecklistEmptyFooter = (props: DecklistEmptyFooterProps) => {
  const theme = useContext<Theme | null>(ThemeContext);
  const tabBarHeight = useBottomTabBarHeight();
  const bottomGlassPadding = Math.max(tabBarHeight, 58) + 2;

  return (
    <View
      pointerEvents="none"
      style={{
        ...styles.glassDockContainer,
        bottom: 0,
      }}>
      <BlurView
        style={styles.glassDockBlur}
        blurType={theme?.name === 'dark' ? 'dark' : 'light'}
        blurAmount={18}
        reducedTransparencyFallbackColor={theme?.translucentBackgroundColor}
      />
      <View style={{height: bottomGlassPadding}} />
    </View>
  );
};

export default DecklistEmptyFooter;
