import React, {useContext} from 'react';
import {View} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import useBottomClearance from '../../lib/useBottomClearance';
import DeviceLayoutContext from '../../contexts/DeviceLayoutContext';

import styles from '../../styles/CardSearchFooterStyles'; // TODO: Rename to DecklistSearchFooterStyles
import ThemeContext from '../../contexts/ThemeContext';
import {Theme} from '../../types/interfaces';

type DecklistEmptyFooterProps = {
  nativeFooterHeight: number;
  tabBarHeight: number;
};

const DecklistEmptyFooter = (props: DecklistEmptyFooterProps) => {
  const theme = useContext<Theme | null>(ThemeContext);
  const {placement} = useContext(DeviceLayoutContext);
  const bottomGlassPadding = useBottomClearance(58) + 2;

  // The glass backs the bottom tab bar; beside iPhone Duo's vertical strip
  // there is no bar to back.
  if (placement !== 'bottom') {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={{
        ...styles.glassDockContainer,
        position: 'absolute',
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
