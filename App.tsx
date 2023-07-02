/**
 * @format
 */

import React from 'react';
import { SafeAreaView } from 'react-native';
import SearchableCardList from './src/components/SearchableCardList';

const App = () => (
  <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
    <SearchableCardList />
  </SafeAreaView>
);

export default App;
