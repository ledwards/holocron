import React, {useContext} from 'react';
import {View} from 'react-native';
import {Icon} from 'react-native-elements';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {BlurView} from '@react-native-community/blur';

import CardsScreen from '../cards/CardsScreen';
import DecklistsScreen from '../decklists/DecklistsScreen';
import RulesScreen from '../rules/RulesScreen';

import styles from '../../styles/TabNavigation';
import ThemeContext from '../../contexts/ThemeContext';
import {Theme} from '../../types/interfaces';
import Card from '../../models/Card';
import ExpansionSet from '../../models/ExpansionSet';
import Decklist from '../../models/Decklist';

const Tab = createBottomTabNavigator();

interface TabNavigationProps {
  allCards: Card[];
  expansionSets: ExpansionSet[];
  allDecklists: Decklist[];
}

function TabNavigation(_props: TabNavigationProps) {
  const iconSize = 24;
  const themeContext = useContext(ThemeContext);
  const theme: Theme | null = themeContext || {
    name: 'dark',
    backgroundColor: '#000000',
    foregroundColor: '#FFFFFF',
    dividerColor: '#444444',
    translucentBackgroundColor: 'rgba(0,0,0,0.5)',
  };

  return (
    <Tab.Navigator
      initialRouteName="Cards"
      screenOptions={{
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        headerShown: false,
        tabBarStyle: {
          ...styles.tabBarStyle,
        },
        tabBarItemStyle: styles.tabBarItemStyle,
      }}>
      <Tab.Screen
        name="Cards"
        children={() => (
          <View
            style={{
              flex: 1,
              backgroundColor: theme?.backgroundColor,
            }}>
            <CardsScreen />
          </View>
        )}
        options={{
          tabBarLabel: 'Search',
          tabBarButtonTestID: 'tab-cards',
          headerShown: true,
          headerTransparent: true,
          headerTitle: 'Card Search',
          headerTitleStyle: {
            color: theme?.foregroundColor,
            fontWeight: '600',
            fontSize: 17,
          },
          headerBackground: () => (
            <BlurView
              style={styles.headerBackground}
              blurType={theme?.name === 'dark' ? 'dark' : 'light'}
              blurAmount={16}
              reducedTransparencyFallbackColor={theme?.translucentBackgroundColor}
            />
          ),
          tabBarBackground: () => null,
          tabBarIcon: () => (
            <Icon
              name={'list-outline'}
              type="ionicon"
              color={theme?.foregroundColor}
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
              backgroundColor: theme?.backgroundColor,
            }}>
            <DecklistsScreen />
          </View>
        )}
        options={{
          tabBarLabel: 'Decklists',
          tabBarButtonTestID: 'tab-decklists',
          tabBarBackground: () => null,
          tabBarIcon: () => (
            <Icon
              name={'file-tray-full-outline'}
              type="ionicon"
              color={theme?.foregroundColor}
              size={iconSize}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Rules"
        children={() => (
          <View
            style={{
              flex: 1,
              backgroundColor: theme?.backgroundColor,
            }}>
            <RulesScreen />
          </View>
        )}
        options={{
          tabBarLabel: 'Rules',
          tabBarButtonTestID: 'tab-rules',
          tabBarBackground: () => null,
          tabBarIcon: () => (
            <Icon
              name={'book-outline'}
              type="ionicon"
              color={theme?.foregroundColor}
              size={iconSize}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default TabNavigation;
