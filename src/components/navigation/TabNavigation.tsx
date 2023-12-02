import {Icon} from 'react-native-elements';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import SearchScreen from './SearchScreen';
import TournamentDecklistsScreen from './TournamentDecklistsScreen';
import styles from '../styles/TabNavigation';
import layout from '../constants/layout';

const Tab = createBottomTabNavigator();

type TabNavigationProps = {
  theme: any;
  allCards: any;
  expansionSets: any;
};

function TabNavigation(props: TabNavigationProps) {
  const iconSize = 24;

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
          <SearchScreen
            allCards={props.allCards}
            expansionSets={props.expansionSets}
            theme={props.theme}
          />
        )}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: () => (
            <Icon
              name={'search-outline'}
              type="ionicon"
              color={props.theme.foregroundColor}
              size={iconSize}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Decklists"
        children={() => (
          <TournamentDecklistsScreen
            allCards={props.allCards}
            expansionSets={props.expansionSets}
            theme={props.theme}
          />
        )}
        options={{
          tabBarLabel: 'Decklists',
          tabBarIcon: () => (
            <Icon
              name={'trophy-outline'}
              type="ionicon"
              color={props.theme.foregroundColor}
              size={iconSize}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default TabNavigation;
