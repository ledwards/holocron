import {View, KeyboardAvoidingView} from 'react-native';
import {SearchBar, Icon, Text} from 'react-native-elements';
import {BlurView} from '@react-native-community/blur';

import QueryStatusBar from './QueryStatusBar';
import Card from '../models/Card';
import FilterQuerySet from '../models/FilterQuerySet';

// import styles from '../styles/SearchableCardListStyles';
import styles from '../styles/CardSearchFooterStyles';

type CardSearchFooterProps = {
  theme: any;
  query: string;
  filterQuerySet: FilterQuerySet;
  nativeFooterHeight: number;
  searchBarHeight: number;
  searchMode: any;
  allCards: Card[];
  data: Card[];
  searchCallback: (query: string) => void;
  toggleSearchMode: () => void;
};

const magicNumber = 20;

const renderSwitchModeHint = (theme: any, searchMode: any) => (
  <View style={styles.defaultTextContainer}>
    <Text
      style={{
        color: theme.foregroundColor,
      }}>
      Tap the
    </Text>
    <Icon
      name={searchMode.icon}
      type="ionicon"
      color={theme.foregroundColor}
      size={16}
      style={styles.defaultTextIcon}
    />
    <Text
      style={{
        color: theme.foregroundColor,
      }}>
      icon to switch between search modes.
    </Text>
  </View>
);

const CardSearchFooter = (props: CardSearchFooterProps) => (
  <KeyboardAvoidingView behavior="position">
    <View
      style={{
        ...styles.footerContainer,
        backgroundColor: props.theme.translucentBackgroundColor,
        height:
          props.filterQuerySet.viewHeight() +
          props.nativeFooterHeight -
          props.searchBarHeight,
      }}>
      <BlurView
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          height: props.filterQuerySet.viewHeight() + magicNumber,
        }}
        blurType={props.theme.name}
        blurAmount={10}
        reducedTransparencyFallbackColor={
          props.theme.translucentBackgroundColor
        }
      />
      <View style={styles.filterQuerySetContainer}>
        {!props.query && renderSwitchModeHint(props.theme, props.searchMode)}
        <QueryStatusBar
          theme={props.theme}
          query={props.query}
          filterQuerySet={props.filterQuerySet}
          searchMode={props.searchMode}
          allCards={props.allCards}
          data={props.data}
        />
      </View>

      <SearchBar
        placeholder={`Search by ${props.searchMode.label}`}
        round
        onChangeText={text => props.searchCallback(text)}
        autoCorrect={false}
        value={props.query}
        containerStyle={{
          ...styles.searchBarContainer,
          bottom: props.nativeFooterHeight,
          height: props.nativeFooterHeight, // for symmetry
        }}
        inputContainerStyle={{
          backgroundColor: props.theme.secondaryBackgroundColor,
        }}
        searchIcon={
          <Icon
            name={props.searchMode.icon}
            type="ionicon"
            color={props.theme.iconColor}
            onPress={props.toggleSearchMode}
          />
        }
      />
    </View>
  </KeyboardAvoidingView>
);

export default CardSearchFooter;
