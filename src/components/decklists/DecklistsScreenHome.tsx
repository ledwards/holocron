import React, {useEffect, useState, useContext} from 'react';
import {useNavigation} from '@react-navigation/native';
import {View} from 'react-native';
import {LogBox} from 'react-native';
import SearchableDecklistList from './SearchableDecklistList';
import AllDecklistsContext from '../../contexts/AllDecklistsContext';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const DecklistsScreenHome = ({route}) => {
  const navigation = useNavigation();
  const allDecklists = useContext(AllDecklistsContext);

  return (
    <View>
      <>
        {allDecklists.sort(
          (x: string, y: string) => Date.parse(y) - Date.parse(x),
        ) &&
          allDecklists.length > 0 && (
            <SearchableDecklistList
              data={allDecklists}
              navigation={navigation}
            />
          )}
      </>
    </View>
  );
};

export default DecklistsScreenHome;
