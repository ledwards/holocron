import {View, Text} from 'react-native';
import SearchBarChip from './SearchBarChip';

import FilterQuerySet from '../models/FilterQuery';
import FilterQuery from '../models/FilterQuery';
import Card from '../models/Card';

import styles from '../styles/QueryStatusBarStyles';

type QueryStatusBarProps = {
  theme: any;
  query: string;
  filterQuerySet: FilterQuerySet;
  searchMode: any;
  allCards: Card[];
  data: Card[];
};

const QueryStatusBar = (props: QueryStatusBarProps) => (
  <>
    {props.filterQuerySet.filterQueries.map(
      (filterQuery: FilterQuery, i: number) => (
        <View
          key={`filterQuery-${i}`}
          style={{
            ...styles.filterQueryContainer,
          }}>
          {props.searchMode.index == 1 && filterQuery.query && (
            <SearchBarChip
              title={filterQuery.displayFieldName()}
              colorConditional={filterQuery.validField()}
              theme={props.theme}
            />
          )}

          {props.searchMode.index == 1 &&
            (filterQuery.comparator ||
              filterQuery.partiallyValidComparator()) &&
            !(
              filterQuery.usingDefaultComparator() &&
              filterQuery.comparator.name == 'includes'
            ) && (
              <SearchBarChip
                title={filterQuery.displayComparatorName()}
                colorConditional={filterQuery.validComparator()}
                theme={props.theme}
              />
            )}

          {props.searchMode.index == 1 && filterQuery.value && (
            <SearchBarChip
              title={filterQuery.rawValue}
              colorConditional={
                filterQuery.validValue() &&
                filterQuery.length(props.allCards) > 0
              }
              theme={props.theme}
            />
          )}

          {props.query != '' && props.searchMode.index == 0 && (
            <SearchBarChip
              title={props.query}
              colorConditional={true}
              theme={props.theme}
            />
          )}

          <Text
            style={{
              color: props.theme.foregroundColor,
              ...styles.resultsCount,
            }}>
            {props.query
              ? `(${
                  filterQuery.valid()
                    ? filterQuery.execute(props.allCards).length
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
          color: props.theme.foregroundColor,
          backgroundColor: 'transparent',
          ...styles.combinedResultsCount,
        }}>
        {`(combined ${props.data.length} results)`}
      </Text>
    )}
  </>
);

export default QueryStatusBar;
