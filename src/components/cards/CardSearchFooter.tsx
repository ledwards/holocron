import {useContext} from 'react';
import {View, KeyboardAvoidingView} from 'react-native';
import {SearchBar, Icon, Text} from 'react-native-elements';
import {BlurView} from '@react-native-community/blur';
import {BottomTabBarHeightContext} from '@react-navigation/bottom-tabs';

import QueryStatusBar from './QueryStatusBar';
import Card from '../../models/Card';
import FilterQuerySet from '../../models/FilterQuerySet';

import styles from '../../styles/CardSearchFooterStyles';
import layout from '../../constants/layout';
import ThemeContext from '../../contexts/ThemeContext';

type CardSearchFooterProps = {
  query: string;
  filterQuerySet: FilterQuerySet;
  nativeFooterHeight: number;
  searchBarHeight: number;
  searchMode: any;
  allCards: Card[];
  data: Card[];
  searchCallback: (query: string) => void;
  toggleSearchMode: () => void;
};

// TODO: Try putting ThemeContext.Consumer here too

const modeCoachTipComponent = (theme: any, searchMode: any) => (
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

const CardSearchFooter = (props: CardSearchFooterProps) => {
  const theme = useContext(ThemeContext);

  return (
    <BottomTabBarHeightContext.Consumer>
      {tabBarHeight => (
        <KeyboardAvoidingView
          behavior="position"
          keyboardVerticalOffset={layout.keyboardVerticalOffset()}>
          <View
            style={{
              ...styles.footerContainer,
              height: layout.footerHeight(tabBarHeight, props.filterQuerySet),
            }}>
            <BlurView
              style={{
                position: 'absolute',
                bottom: 0,
                height: layout.footerHeight(tabBarHeight, props.filterQuerySet),
                width: '100%',
              }}
              blurType={theme.name}
              blurAmount={10}
              reducedTransparencyFallbackColor={
                theme.translucentBackgroundColor
              }
            />
            <SearchBar
              placeholder={`Search by ${props.searchMode.label}`}
              round
              onChangeText={text => props.searchCallback(text)}
              autoCorrect={false}
              value={props.query}
              containerStyle={{
                ...styles.searchBarContainer,
                position: 'absolute',
                bottom: layout.searchBottomPosition(tabBarHeight),
                height: layout.searchBarHeight(),
              }}
              inputContainerStyle={{
                backgroundColor: theme.secondaryBackgroundColor,
              }}
              searchIcon={
                <Icon
                  name={props.searchMode.icon}
                  type="ionicon"
                  color={theme.iconColor}
                  onPress={() => props.toggleSearchMode()}
                />
              }
            />

            <View
              style={{
                bottom: layout.statusBarBottomPosition(tabBarHeight),
                ...styles.filterQuerySetContainer,
              }}>
              {!props.query ? (
                modeCoachTipComponent(theme, props.searchMode)
              ) : (
                <QueryStatusBar
                  query={props.query}
                  filterQuerySet={props.filterQuerySet}
                  searchMode={props.searchMode}
                  allCards={props.allCards}
                  data={props.data}
                />
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </BottomTabBarHeightContext.Consumer>
  );
};

export default CardSearchFooter;
