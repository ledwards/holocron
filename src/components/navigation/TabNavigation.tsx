import React, {useContext} from 'react';
import {View} from 'react-native';
import {Icon} from 'react-native-elements';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import CardsScreen from '../cards/CardsScreen';
import DecklistsScreen from '../decklists/DecklistsScreen';

import styles from '../../styles/TabNavigation';
import layout from '../../constants/layout';
import ThemeContext from '../../contexts/ThemeContext';
import { Theme, RootStackParamList } from '../../types/interfaces';
import Card from '../../models/Card';
import ExpansionSet from '../../models/ExpansionSet';
import Decklist from '../../models/Decklist';

const Tab = createBottomTabNavigator<RootStackParamList>();

interface TabNavigationProps {
  allCards: Card[];
  expansionSets: ExpansionSet[];
  allDecklists: Decklist[];
}

function TabNavigation(props: TabNavigationProps) {
  const iconSize = 24;
  const theme = useContext<Theme>(ThemeContext);

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
            <CardsScreen />
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
            <DecklistsScreen />
          </View>
        )}
        options={{
          tabBarLabel: 'Decklists',
          tabBarIcon: () => (
            <Icon
              name={'file-tray-full-outline'}
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
