import {View} from 'react-native';
import {Icon} from 'react-native-elements';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import CardsScreen from '../cards/CardsScreen';
import DecklistsScreen from '../decklists/DecklistsScreen';
import styles from '../../styles/TabNavigation';
import layout from '../../constants/layout';

const Tab = createBottomTabNavigator();

type TabNavigationProps = {
  theme: any;
  allCards: any;
  expansionSets: any;
  allDecklists: any;
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
          <View
            style={{
              flex: 1,
              backgroundColor: props.theme.backgroundColor,
            }}>
            <CardsScreen
              allCards={props.allCards}
              expansionSets={props.expansionSets}
              theme={props.theme}
            />
          </View>
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
          <View
            style={{
              flex: 1,
              backgroundColor: props.theme.backgroundColor,
            }}>
            <DecklistsScreen
              allCards={props.allCards}
              expansionSets={props.expansionSets}
              allDecklists={props.allDecklists}
              theme={props.theme}
            />
          </View>
        )}
        options={{
          tabBarLabel: 'Decklists',
          tabBarIcon: () => (
            <Icon
              // name={'file-tray-full-outline'}
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
