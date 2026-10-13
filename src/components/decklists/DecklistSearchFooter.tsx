import React, {useContext, useEffect, useState} from 'react';
import {View, KeyboardAvoidingView, Platform} from 'react-native';
import {Text} from 'react-native-elements';
import SearchField from '../adaptive/SearchField';
import {BlurView} from '@react-native-community/blur';
import {useHeaderHeight} from '@react-navigation/elements';
import useSearchDockBottomPadding from '../../lib/useSearchDockBottomPadding';

import DecklistsQueryStatusBar from './DecklistsQueryStatusBar';
import styles from '../../styles/CardSearchFooterStyles';
import ThemeContext from '../../contexts/ThemeContext';
import Decklist from '../../models/Decklist';

interface DecklistSearchFooterProps {
  query: string;
  data: Decklist[];
  searchCallback: (text: string) => void;
}

const DecklistSearchFooter = (props: DecklistSearchFooterProps) => {
  const theme = useContext(ThemeContext);
  const [query, setQuery] = useState('');
  const [data, setData] = useState<Decklist[]>([]);
  const bottomGlassPadding = useSearchDockBottomPadding();
  const headerHeight = useHeaderHeight();

  useEffect(() => {
    setQuery(props.query);
    setData(props.data);
  }, [props.query, props.data]);

  const onChangeText = (text = '') => {
    setQuery(text);
    props.searchCallback(text);
  };


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'position' : undefined}
      keyboardVerticalOffset={headerHeight - bottomGlassPadding + 8}
      style={styles.overlayWrapper}
      pointerEvents="box-none">
      <View
        pointerEvents="box-none"
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
        <View
          pointerEvents="box-none"
          style={{
            ...styles.glassDockContent,
            paddingBottom: bottomGlassPadding,
          }}>
          <View style={{...styles.statusRowSlot, minHeight: 34}}>
            {!query ? (
              <View style={styles.modeCoachTip}>
                <Text style={{color: theme?.foregroundColor}}>
                  {`Searching ${data.length} decklists`}
                </Text>
              </View>
            ) : (
              <DecklistsQueryStatusBar query={query} data={data} />
            )}
          </View>
          <SearchField
            testID="decklists-search-input"
            placeholder="Search by tournament, player, or archetype"
            onChangeText={onChangeText}
            value={query}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default DecklistSearchFooter;
