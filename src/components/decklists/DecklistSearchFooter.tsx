import {View, KeyboardAvoidingView} from 'react-native';
import {SearchBar, Icon, Text} from 'react-native-elements';
import {BlurView} from '@react-native-community/blur';
import {BottomTabBarHeightContext} from '@react-navigation/bottom-tabs';

import Decklist from '../../models/Decklist';
import DecklistsQueryStatusBar from './DecklistsQueryStatusBar';

import styles from '../../styles/CardSearchFooterStyles'; // TODO: Rename to DecklistSearchFooterStyles
import layout from '../../constants/layout';

type DecklistSearchFooterProps = {
  theme: any;
  query: string;
  nativeFooterHeight: number;
  searchBarHeight: number;
  allDecklists: Decklist[];
  data: Decklist[];
  searchCallback: (query: string) => void;
};

const DecklistSearchFooter = (props: DecklistSearchFooterProps) => (
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
            blurType={props.theme.name}
            blurAmount={10}
            reducedTransparencyFallbackColor={
              props.theme.translucentBackgroundColor
            }
          />
          <SearchBar
            placeholder="Search by tournament, player, or archetype"
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
              backgroundColor: props.theme.secondaryBackgroundColor,
            }}
            searchIcon={
              <Icon
                name="search"
                type="ionicon"
                color={props.theme.iconColor}
              />
            }
          />

          <View
            style={{
              bottom: layout.statusBarBottomPosition(tabBarHeight),
              ...styles.filterQuerySetContainer,
            }}>
            <DecklistsQueryStatusBar
              theme={props.theme}
              query={props.query}
              allDecklists={props.allDecklists}
              data={props.data}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    )}
  </BottomTabBarHeightContext.Consumer>
);

export default DecklistSearchFooter;
