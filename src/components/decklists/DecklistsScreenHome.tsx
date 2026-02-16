import React, {useContext} from 'react';
import {useNavigation} from '@react-navigation/native';
import {View, Text} from 'react-native';
import {LogBox} from 'react-native';
import SearchableDecklistList from './SearchableDecklistList';
import AllDecklistsContext from '../../contexts/AllDecklistsContext';
import ThemeContext from '../../contexts/ThemeContext';
import {Theme} from '../../types/interfaces';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const DecklistsScreenHome = () => {
  const navigation = useNavigation();
  const allDecklists = useContext(AllDecklistsContext) || [];
  const theme = useContext<Theme | null>(ThemeContext);

  return (
    <View style={{flex: 1, backgroundColor: theme?.backgroundColor}}>
      <>
        {[...allDecklists].sort(
          (x: any, y: any) =>
            Date.parse(y.timestamp || '') - Date.parse(x.timestamp || ''),
        ) &&
          allDecklists.length > 0 && (
            <SearchableDecklistList
              nativeHeaderHeight={0}
              nativeFooterHeight={0}
              navigation={navigation}
            />
          )}
        {allDecklists.length === 0 && (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 24,
            }}>
            <Text style={{color: theme?.foregroundColor, textAlign: 'center'}}>
              No decklists are available yet.
            </Text>
          </View>
        )}
      </>
    </View>
  );
};

export default DecklistsScreenHome;
