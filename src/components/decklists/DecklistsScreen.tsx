import React, {useState, useEffect, useContext} from 'react';
import {LogBox} from 'react-native';
import {Icon} from 'react-native-elements';
import {BlurView} from '@react-native-community/blur';

import DecklistsScreenHome from './DecklistsScreenHome';
import DecklistsScreenListView from './DecklistsScreenListView';
import DecklistsScreenGridView from './DecklistsScreenGridView';
import {createStackNavigator} from '@react-navigation/stack';

import ThemeContext from '../../contexts/ThemeContext';

import layout from '../../constants/layout';

type DecklistScreenProps = {
  allDecklists: any;
};

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const Stack = createStackNavigator();

const DecklistsScreen = (props: DecklistScreenProps) => {
  const [displayMode, setDisplayMode] = useState(0);
  const theme = useContext(ThemeContext);

  const displayModes = {
    0: {
      index: 0,
      label: 'list',
      icon: 'list-outline',
    },
    1: {
      index: 1,
      label: 'grid',
      icon: 'grid-outline',
    },
  };

  const toggleDisplayMode = () => {
    if (displayMode === 0) {
      setDisplayMode(1);
    } else {
      setDisplayMode(0);
    }
  };

  return (
    <>
      <Stack.Navigator
        screenOptions={
          {
            // headerTransparent: true,
          }
        }>
        <Stack.Screen
          name="Tournament Decklists"
          component={DecklistsScreenHome}
          options={{headerShown: false}}
          initialParams={{
            allDecklists: props.allDecklists,
          }}></Stack.Screen>
        <Stack.Screen
          name="View Decklist"
          component={
            displayMode == 0 ? DecklistsScreenListView : DecklistsScreenGridView
          }
          options={() => ({
            headerShown: true,
            headerStyle: {},
            headerTintColor: theme.foregroundColor,
            headerTitleStyle: {},
            headerRight: () => (
              <Icon
                name={displayModes[displayMode].icon}
                type="ionicon"
                color={theme.foregroundColor}
                size={24}
                style={{marginRight: 10}}
                onPress={() => toggleDisplayMode()}
              />
            ),
            headerBackground: () => (
              <BlurView
                style={{
                  position: 'absolute',
                  height: '100%',
                  width: '100%',
                }}
                blurType={theme.name}
                blurAmount={10}
                reducedTransparencyFallbackColor={
                  theme.translucentBackgroundColor
                }
              />
            ),
          })}></Stack.Screen>
      </Stack.Navigator>
    </>
  );
};

export default DecklistsScreen;
