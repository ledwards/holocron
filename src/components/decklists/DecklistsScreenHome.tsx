import React, {useEffect, useState, useContext} from 'react';
import {View} from 'react-native';
import {LogBox} from 'react-native';
import SearchableDecklistList from './SearchableDecklistList';
import {useNavigation} from '@react-navigation/native';

import ThemeContext from '../../contexts/ThemeContext';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const DecklistsScreenHome = ({route}) => {
  const navigation = useNavigation();
  const theme = useContext(ThemeContext);

  return (
    <View>
      <>
        {route.params.allDecklists && route.params.allDecklists.length > 0 && (
          <SearchableDecklistList
            allDecklists={route.params.allDecklists}
            data={route.params.allDecklists}
            theme={theme}
            navigation={navigation}
          />
        )}
      </>
    </View>
  );
};

export default DecklistsScreenHome;
