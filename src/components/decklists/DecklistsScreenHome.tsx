import {View} from 'react-native';
import SearchableDecklistList from './SearchableDecklistList';
import {useNavigation} from '@react-navigation/native';

import {LogBox} from 'react-native';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

// TODO: 3rd option, cardlist

const DecklistsScreenHome = ({route}) => {
  const navigation = useNavigation();

  return (
    <View>
      <>
        {route.params.allDecklists && route.params.allDecklists.length > 0 && (
          <SearchableDecklistList
            allDecklists={route.params.allDecklists}
            data={route.params.allDecklists}
            theme={route.params.theme}
            navigation={navigation}
          />
        )}
      </>
    </View>
  );
};

export default DecklistsScreenHome;
