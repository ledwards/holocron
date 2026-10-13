import React, {useContext} from 'react';
import {PlatformPressable} from '@react-navigation/elements';
import {SafeAreaView} from 'react-native-safe-area-context';
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
  const iconSize = 28;
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
        // UIKit's vertical tab item remains top-aligned even without labels.
        tabBarIconStyle: {width: 32, height: 32},
        tabBarButton: props => <PlatformPressable {...props}
          style={[props.style, {justifyContent: 'center'}]} />,
        // The native keyboard covers this absolute bar. Avoid a second animated
        // translation, which can remain offscreen after a Duo geometry change.
        tabBarHideOnKeyboard: false,
        headerShown: false,
        tabBarStyle: {
          ...styles.tabBarStyle,
        },
        tabBarItemStyle: styles.tabBarItemStyle,
      }}>
      <Tab.Screen
        name="Cards"
        children={() => (
          <SafeAreaView
            edges={['left', 'right']}
            style={{
              flex: 1,
              backgroundColor: theme?.backgroundColor,
            }}>
            <CardsScreen />
          </SafeAreaView>
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
          <SafeAreaView
            edges={['left', 'right']}
            style={{
              flex: 1,
              backgroundColor: theme?.backgroundColor,
            }}>
            <DecklistsScreen />
          </SafeAreaView>
        )}
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: 'Decklists',
          headerTitleStyle: {color: theme?.foregroundColor, fontSize: 17, fontWeight: '600'},
          headerBackground: () => <BlurView style={styles.headerBackground} blurType={theme?.name === 'dark' ? 'dark' : 'light'} blurAmount={16} />,
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
          <SafeAreaView
            testID="rules-safe-area"
            edges={['top', 'left', 'right']}
            style={{
              flex: 1,
              backgroundColor: theme?.backgroundColor,
            }}>
            <RulesScreen />
          </SafeAreaView>
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
