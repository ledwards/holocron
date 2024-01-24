import React, {useState} from 'react';
import {Icon} from 'react-native-elements';

import DecklistsScreenHome from './DecklistsScreenHome';
import DecklistsScreenListView from './DecklistsScreenListView';
import DecklistsScreenGridView from './DecklistsScreenGridView';
import {createStackNavigator} from '@react-navigation/stack';

type DecklistScreenProps = {
  allDecklists: any;
  theme: any;
};

const Stack = createStackNavigator();

const DecklistsScreen = (props: DecklistScreenProps) => {
  const [displayMode, setDisplayMode] = useState(0);

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
    <Stack.Navigator>
      <Stack.Screen
        name="Tournament Decklists"
        component={DecklistsScreenHome}
        options={{headerShown: false}}
        initialParams={{
          allDecklists: props.allDecklists,
          theme: props.theme,
        }}></Stack.Screen>
      <Stack.Screen
        name="View"
        component={
          displayMode == 0 ? DecklistsScreenListView : DecklistsScreenGridView
        }
        options={({route}) => ({
          headerShown: true,
          headerStyle: {
            backgroundColor: props.theme.backgroundColor,
          },
          headerTintColor: props.theme.foregroundColor,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerRight: () => (
            <Icon
              name={displayModes[displayMode].icon}
              type="ionicon"
              color={props.theme.foregroundColor}
              size={24}
              style={{marginRight: 10}}
              onPress={() => toggleDisplayMode()}
            />
          ),
        })}
        initialParams={{
          theme: props.theme,
        }}></Stack.Screen>
    </Stack.Navigator>
  );
};

export default DecklistsScreen;
