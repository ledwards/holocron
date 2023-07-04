/**
 * @format
 */

import React from 'react';
import { SafeAreaView, View, StatusBar } from 'react-native';
import SearchableCardList from './src/components/SearchableCardList';

const App = () => (
  <View style={{ flex: 1, backgroundColor: 'black' }}>
    <StatusBar hidden />
    <SearchableCardList />
  </View>
);

export default App;
