import React, {useContext} from 'react';
import {View, KeyboardAvoidingView} from 'react-native';
import {Icon, Text, SearchBar as RNESearchBar} from 'react-native-elements';
import {BlurView} from '@react-native-community/blur';
import {BottomTabBarHeightContext} from '@react-navigation/bottom-tabs';

import QueryStatusBar from './QueryStatusBar';

import styles from '../../styles/CardSearchFooterStyles';
import layout from '../../constants/layout';
import ThemeContext from '../../contexts/ThemeContext';

// Coach tip component to display when no search is active
const ModeCoachTipComponent = ({theme, searchMode}) => (
  <View style={styles.modeCoachTip}>
    <Text
      style={{
        color: theme.foregroundColor,
      }}>
      Tap the
    </Text>
    <Icon
      name={searchMode.icon}
      type="ionicon"
      color={theme.foregroundColor}
      size={16}
      style={styles.defaultTextIcon}
    />
    <Text
      style={{
        color: theme.foregroundColor,
      }}>
      icon to switch between search modes.
    </Text>
  </View>
);

const CardSearchFooter = props => {
  // Get theme from context or provide default
  const themeContext = useContext(ThemeContext);
  const theme = themeContext || {
    name: 'dark',
    backgroundColor: '#000000',
    foregroundColor: '#FFFFFF',
    dividerColor: '#444444',
    secondaryBackgroundColor: '#333333',
    iconColor: '#CCCCCC',
    translucentBackgroundColor: 'rgba(0,0,0,0.5)',
  };

  return (
    <BottomTabBarHeightContext.Consumer>
      {tabBarHeight => {
        const tabHeight = tabBarHeight || 0;
        return (
          <KeyboardAvoidingView
            behavior="position"
            keyboardVerticalOffset={layout.keyboardVerticalOffset()}>
            <View
              style={{
                ...styles.footerContainer,
                height: layout.footerHeight(tabHeight, props.filterQuerySet),
              }}>
              <BlurView
                style={{
                  position: 'absolute',
                  bottom: 0,
                  height: layout.footerHeight(tabHeight, props.filterQuerySet),
                  width: '100%',
                }}
                blurType={theme.name === 'dark' ? 'dark' : 'light'}
                blurAmount={10}
                reducedTransparencyFallbackColor={
                  theme.translucentBackgroundColor
                }
              />
              <RNESearchBar
                platform="default"
                placeholder={`Search by ${props.searchMode.label}`}
                value={props.query}
                onChangeText={props.searchCallback}
                onClear={() => props.searchCallback('')}
                autoCorrect={false}
                round={true}
                containerStyle={{
                  ...styles.searchBarContainer,
                  position: 'absolute',
                  bottom: layout.searchBottomPosition(tabHeight),
                  height: layout.searchBarHeight(),
                }}
                inputContainerStyle={{
                  backgroundColor: theme.secondaryBackgroundColor,
                }}
                searchIcon={{
                  name: props.searchMode.icon,
                  type: 'ionicon',
                  color: theme.iconColor || theme.foregroundColor,
                  onPress: props.toggleSearchMode,
                }}
              />

              <View
                style={{
                  bottom: layout.statusBarBottomPosition(tabHeight),
                  ...styles.filterQuerySetContainer,
                }}>
                {!props.query ? (
                  <ModeCoachTipComponent
                    theme={theme}
                    searchMode={props.searchMode}
                  />
                ) : (
                  <QueryStatusBar
                    query={props.query}
                    filterQuerySet={props.filterQuerySet}
                    searchMode={props.searchMode}
                    data={props.data}
                  />
                )}
              </View>
            </View>
          </KeyboardAvoidingView>
        );
      }}
    </BottomTabBarHeightContext.Consumer>
  );
};

export default CardSearchFooter;
