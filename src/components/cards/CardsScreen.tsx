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
  <View
    style={{
      flex: 1,
    }}>
    <StatusBar barStyle={props.theme.statusBarStyle} />
    <View
      style={{
        flex: 1,
        backgroundColor: props.theme.backgroundColor,
      }}>
      {props.allCards && props.allCards.length > 0 && (
        <>
          <SearchableCardList cards={props.allCards} theme={props.theme} />
          <BlurView
            style={{
              position: 'absolute',
              top: 0,
              width: '100%',
              height: layout.nativeHeaderHeight(),
            }}
            blurType={props.theme.name}
            blurAmount={10}
            reducedTransparencyFallbackColor={
              props.theme.translucentBackgroundColor
            }
          />
        </>
      )}
    </View>
  </View>
);

export default CardsScreen;
