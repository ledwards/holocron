import React, {useContext} from 'react';
import {View} from 'react-native';
import {Icon} from 'react-native-elements';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import CardsScreen from '../cards/CardsScreen';
import DecklistsScreen from '../decklists/DecklistsScreen';

import styles from '../../styles/TabNavigation';
import layout from '../../constants/layout';
import ThemeContext from '../../contexts/ThemeContext';

const Tab = createBottomTabNavigator();

type TabNavigationProps = {
  allCards: any;
  expansionSets: any;
  allDecklists: any;
};

function TabNavigation(props: TabNavigationProps) {
  const iconSize = 24;
  const theme = useContext(ThemeContext);

  return (
    <Tab.Navigator
      initialRouteName="Cards"
      screenOptions={{
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        keyboardHidesTabBar: true,
        headerShown: false,
        tabBarStyle: {
          ...styles.tabBarStyle,
          bottom: layout.nativeFooterHeight(),
          height: layout.tabBarHeight(),
        },
        tabBarItemStyle: styles.tabBarItemStyle,
      }}>
      <Tab.Screen
        name="Cards"
        children={() => (
          <View
            style={{
              flex: 1,
              backgroundColor: theme.backgroundColor,
            }}>
            <CardsScreen
              allCards={props.allCards}
              expansionSets={props.expansionSets}
            />
          </View>
        )}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: () => (
            <Icon
              name={'search-outline'}
              type="ionicon"
              color={theme.foregroundColor}
              size={iconSize}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Decklists"
        children={() => (
          <View
            style={{
              flex: 1,
              backgroundColor: theme.backgroundColor,
            }}>
            <DecklistsScreen
              allCards={props.allCards}
              expansionSets={props.expansionSets}
              allDecklists={props.allDecklists}
            />
          </View>
        )}
        options={{
          tabBarLabel: 'Decklists',
          tabBarIcon: () => (
            <Icon
              name={'trophy-outline'}
              type="ionicon"
              color={theme.foregroundColor}
              size={iconSize}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default TabNavigation;
