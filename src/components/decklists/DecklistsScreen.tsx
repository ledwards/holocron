import React, {useState, useContext} from 'react';
import {LogBox} from 'react-native';
import {Icon} from 'react-native-elements';
import {BlurView} from '@react-native-community/blur';

import DecklistsScreenHome from './DecklistsScreenHome';
import DecklistsScreenListView from './DecklistsScreenListView';
import DecklistsScreenGridView from './DecklistsScreenGridView';
import DecklistsScreenTextView from './DecklistsScreenTextView';
import {createStackNavigator} from '@react-navigation/stack';

import ThemeContext from '../../contexts/ThemeContext';
import {Theme} from '../../types/interfaces';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const Stack = createStackNavigator();

interface DisplayMode {
  index: number;
  label: string;
  icon: string;
  view: React.ComponentType<any>;
}

interface DecklistsScreenProps {
  // No specific props needed currently, but defining the interface for future use
}

const DecklistsScreen = (props: DecklistsScreenProps) => {
  const [displayMode, setDisplayMode] = useState<number>(0);
  const theme = useContext<Theme | null>(ThemeContext);

  const displayModes: Record<number, DisplayMode> = {
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

  const toggleDisplayMode = (): void => {
    setDisplayMode((displayMode + 1) % 3);
  };

  const currentDisplayMode = (): DisplayMode => displayModes[displayMode];
  const nextDisplayMode = (): DisplayMode => displayModes[(displayMode + 1) % 3];

  return (
    <>
      {/* @ts-ignore */}
      <Stack.Navigator initialRouteName="Tournament Decklists">
        <Stack.Screen
          name="Tournament Decklists"
          component={DecklistsScreenHome}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="View Decklist"
          component={currentDisplayMode().view}
          options={() => ({
            headerShown: true,
            headerStyle: {},
            headerTintColor: theme?.foregroundColor,
            headerTitleStyle: {},
            headerRight: () => (
              <Icon
                name={nextDisplayMode().icon}
                type="ionicon"
                color={theme?.foregroundColor}
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
                blurType={theme?.name as any}
                blurAmount={10}
                reducedTransparencyFallbackColor={
                  theme?.translucentBackgroundColor || 'rgba(0,0,0,0.7)'
                }
              />
            ),
          })}
        />
      </Stack.Navigator>
    </>
  );
};

export default DecklistsScreen;