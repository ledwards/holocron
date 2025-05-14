import React, {useContext} from 'react';
import {useNavigation} from '@react-navigation/native';
import {View} from 'react-native';
import {LogBox} from 'react-native';
import SearchableDecklistList from './SearchableDecklistList';
import AllDecklistsContext from '../../contexts/AllDecklistsContext';
import {Decklist} from '../../types/interfaces';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const DecklistsScreenHome = ({route}: {route?: any}) => {
  const navigation = useNavigation();
  const allDecklists = useContext(AllDecklistsContext);

  return (
    <View>
      <>
        {[...(allDecklists || [])].sort(
          (x: any, y: any) => Date.parse(y.timestamp || '') - Date.parse(x.timestamp || ''),
        ) &&
          allDecklists.length > 0 && (
            <SearchableDecklistList
              nativeHeaderHeight={0}
              nativeFooterHeight={0}
              navigation={navigation}
            />
          )}
      </>
    </View>
  );
};

export default DecklistsScreenHome;
