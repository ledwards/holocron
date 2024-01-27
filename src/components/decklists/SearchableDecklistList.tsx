import {Component} from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

import DecklistListItem from './DecklistListItem';
import DecklistSearchFooter from './DecklistSearchFooter';
import DecklistPresenter from '../../presenters/DecklistPresenter';

import styles from '../../styles/SearchableDecklistListStyles';
import layout from '../../constants/layout';

class SearchableDecklistList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      error: null,
      allDecklists: [], // all decklists, doesn't change
      data: [], // currently filtered decklists
      query: '',
      flatListRef: null,
      theme: this.props.theme,
      nativeHeaderHeight: this.props.nativeHeaderHeight,
      nativeFooterHeight: this.props.nativeFooterHeight,
    };
  }

  componentDidMount() {
    this.setState({
      data: this.props.allDecklists,
      allDecklists: this.props.allDecklists,
      theme: this.props.theme,
      error: null,
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.theme.name != this.props.theme.name) {
      this.setState({
        theme: this.props.theme,
      });
    }
  }

  searchHandler = (text: string) => {
    const query = text.toLowerCase();

    this.setState({
      query: query,
    });

    this.searchFilterFunction(query);
  };

  searchFilterFunction = (text: string) => {
    const newData = this.state.allDecklists
      .filter(decklist => {
        const textData = text;
        const itemData = decklist.searchData();

        // Allow for unorderd word matches
        const textDataList = textData.split(' ');
        const matches = textDataList.filter(
          (w: string) => itemData.indexOf(w) > -1,
        );

        return matches.length === textDataList.length;
      })
      .reverse();

    this.setState({
      data: newData,
    });
  };

  NoResultsListComponent = () => (
    <View style={styles.listEmptyContainer}>
      <Text
        style={{
          color: this.state.theme.foregroundColor,
          ...styles.emptyListText,
        }}>
        No results found
      </Text>
    </View>
  );

  SeparatorComponent = () => {
    return (
      <View
        style={{
          backgroundColor: this.state.theme.dividerColor,
          ...styles.separator,
        }}
      />
    );
  };

  render() {
    if (this.state.loading) {
      return (
        <View style={styles.loading}>
          <ActivityIndicator />
        </View>
      );
    }

    return (
      <>
        <Animated.FlatList
          ref={ref => {
            this.state.flatListRef = ref;
          }}
          contentContainerStyle={{
            ...styles.flatListContentContainer,
            minHeight: Dimensions.get('window').height,
          }}
          data={this.state.data}
          renderItem={({item, index}) => (
            <TouchableOpacity
              onPress={() => {
                this.props.navigation.navigate('View Decklist', {
                  theme: this.state.theme,
                  allCards: this.props.allCards,
                  decklist: new DecklistPresenter(item),
                });
              }}
              activeOpacity={1}>
              <DecklistListItem
                theme={this.state.theme}
                item={new DecklistPresenter(item)}
                index={index}
                flatListRef={this.state.flatListRef}
                scrollToIndex={(i: number) =>
                  this.state.flatListRef.scrollToIndex({
                    animated: true,
                    index: i,
                    viewOffset: layout.nativeHeaderHeight(),
                  })
                }
              />
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => this.NoResultsListComponent()}
          ListHeaderComponent={() => <></>}
          ListHeaderComponentStyle={{
            backgroundColor: this.state.theme.backgroundColor,
            borderColor: this.state.theme.dividerColor,
            borderBottomWidth:
              this.state.query && this.state.data.length > 0 ? 2 : 0,
            height: layout.nativeHeaderHeight(),
          }}
          ListFooterComponent={() => <></>}
          ListFooterComponentStyle={{
            flexGrow: 1, // important!
            backgroundColor: this.state.theme.backgroundColor,
            height: layout.footerHeight(layout.tabBarHeight(), null),
            // height: 800,
            borderTopWidth:
              this.state.query && this.state.data.length > 0 ? 2 : 0,
            borderColor: this.state.theme.dividerColor,
          }}
          keyExtractor={(item, index) => `${index}_${item.id}`}
          ItemSeparatorComponent={this.SeparatorComponent}
          keyboardShouldPersistTaps="handled"
          //
          // Performance settings:
          initialNumToRender={10} // Reduce initial render amount
          removeClippedSubviews={true} // Unmount components when outside of window
          maxToRenderPerBatch={10} // Reduce number in each render batch
          updateCellsBatchingPeriod={100} // Increase time between renders
          windowSize={10} // Reduce the window size
        />
        <DecklistSearchFooter
          query={this.state.query}
          nativeFooterHeight={layout.nativeFooterHeight()}
          searchBarHeight={layout.searchBarHeight()}
          tabBarHeight={layout.tabBarHeight()}
          allDecklists={this.state.allDecklists}
          data={this.state.data}
          searchCallback={this.searchHandler}
        />
      </>
    );
  }
}

export default SearchableDecklistList;
