import {View, StatusBar} from 'react-native';
import {BlurView} from '@react-native-community/blur';

import SearchableCardList from './SearchableCardList';

import layout from '../../constants/layout';

type SearchScreenProps = {
  allCards: any;
  expansionSets: any;
  theme: any;
};

const CardsScreen = (props: SearchScreenProps) => (
  <>
    {props.allCards && props.allCards.length > 0 && (
      <SearchableCardList cards={props.allCards} theme={props.theme} />
    )}
  </>
);

export default CardsScreen;
