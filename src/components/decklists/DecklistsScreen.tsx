import React, {useState, useEffect, useContext} from 'react';
import {LogBox} from 'react-native';
import {Icon} from 'react-native-elements';
import {BlurView} from '@react-native-community/blur';

import DecklistsScreenHome from './DecklistsScreenHome';
import DecklistsScreenListView from './DecklistsScreenListView';
import DecklistsScreenGridView from './DecklistsScreenGridView';
import DecklistsScreenTextView from './DecklistsScreenTextView';
import {createStackNavigator} from '@react-navigation/stack';

import ThemeContext from '../../contexts/ThemeContext';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const Stack = createStackNavigator();

const DecklistsScreen = props => {
  const [displayMode, setDisplayMode] = useState(0);
  const theme = useContext(ThemeContext);

  const displayModes = {
    0: {
      index: 0,
      label: 'grid',
      icon: 'grid-outline',
      view: DecklistsScreenGridView,
    },
    1: {
      index: 1,
      label: 'list',
      icon: 'list-outline',
      view: DecklistsScreenListView,
    },
    2: {
      index: 2,
      label: 'text',
      icon: 'document-text-outline',
      view: DecklistsScreenTextView,
    },
  };

  const toggleDisplayMode = () => {
    setDisplayMode((displayMode + 1) % 3);
  };

  const currentDisplayMode = () => displayModes[displayMode];
  const nextDisplayMode = () => displayModes[(displayMode + 1) % 3];

  return (
    <>
      <Stack.Navigator>
        <Stack.Screen
          name="Tournament Decklists"
          component={DecklistsScreenHome}
          options={{headerShown: false}}></Stack.Screen>
        <Stack.Screen
          name="View Decklist"
          component={currentDisplayMode().view}
          options={() => ({
            headerShown: true,
            headerStyle: {},
            headerTintColor: theme.foregroundColor,
            headerTitleStyle: {},
            headerRight: () => (
              <Icon
                name={nextDisplayMode().icon}
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
