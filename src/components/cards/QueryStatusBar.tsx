import React, {useContext} from 'react';
import {View, Text} from 'react-native';
import SearchBarChip from './SearchBarChip';

import FilterQuerySet from '../../models/FilterQuerySet';
import FilterQuery from '../../models/FilterQuery';
import Card from '../../models/Card';

import styles from '../../styles/QueryStatusBarStyles';
import ThemeContext from '../../contexts/ThemeContext';
import AllCardsContext from '../../contexts/AllCardsContext';
import { SearchMode, Theme } from '../../types/interfaces';

interface QueryStatusBarProps {
  query: string;
  filterQuerySet: FilterQuerySet;
  searchMode: SearchMode;
  data: Card[];
}

const QueryStatusBar = (props: QueryStatusBarProps) => {
  const themeContext = useContext(ThemeContext);
  const theme: Theme = themeContext || {
    name: 'dark',
    backgroundColor: '#000000',
    foregroundColor: '#FFFFFF',
    dividerColor: '#444444',
    translucentBackgroundColor: 'rgba(0,0,0,0.5)'
  };
  
  const allCardsContext = useContext(AllCardsContext);
  const allCards: Card[] = allCardsContext || [];

  return (
    <>
      {props.filterQuerySet.filterQueries.map(
        (filterQuery: FilterQuery, i: number) => (
          <View key={`filterQuery-${i}`} style={styles.filterQueryContainer}>
            {props.searchMode.index === 1 && filterQuery.query && (
              <SearchBarChip
                title={filterQuery.displayFieldName()}
                colorConditional={filterQuery.validField()}
              />
            )}

            {props.searchMode.index === 1 &&
              (filterQuery.comparator ||
                filterQuery.partiallyValidComparator()) &&
              !(
                filterQuery.usingDefaultComparator() &&
                filterQuery.comparator?.name === 'includes'
              ) && (
                <SearchBarChip
                  title={filterQuery.displayComparatorName() || ''}
                  colorConditional={filterQuery.validComparator()}
                />
              )}

            {props.searchMode.index === 1 && filterQuery.value && (
              <SearchBarChip
                title={filterQuery.rawValue || ''}
                colorConditional={
                  filterQuery.validValue() && filterQuery.length(allCards) > 0
                }
              />
            )}

            {props.query !== '' && props.searchMode.index === 0 && (
              <SearchBarChip title={props.query} colorConditional={true} />
            )}

            <Text
              style={{
                color: theme.foregroundColor,
                ...styles.resultsCount,
              }}>
              {props.query
                ? `(${
                    filterQuery.valid() && filterQuery.filter
                      ? filterQuery.execute(allCards).length
                      : props.data.length
                  } results)`
                : ''}
            </Text>
          </View>
        ),
      )}
      {props.query && props.filterQuerySet.length() > 1 && (
        <Text
          style={{
            color: theme.foregroundColor,
            ...styles.combinedResultsCount,
          }}>
          {`(combined ${props.data.length} results)`}
        </Text>
      )}
    </>
  );
};

export default QueryStatusBar;