import {Icon} from 'react-native-elements';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import SearchScreen from './SearchScreen';
import styles from '../styles/TabNavigation';
import layout from '../constants/layout';

const Tab = createBottomTabNavigator();

type TabNavigationProps = {
  theme: any;
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
        component={SearchScreen}
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
    </Tab.Navigator>
  );
}

export default TabNavigation;
