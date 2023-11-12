import Card from './Card';
import FilterQuery from './FilterQuery';

class FilterQuerySet {
  query: string;
  filterQueries: FilterQuery[];

  constructor(query: string) {
    this.query = query.trim();
    this.filterQueries = this.parseQuery();
  }

  parseQuery() {
    const subQueries = this.query.toLowerCase().split('and');
    return subQueries.length < 1 && subQueries[0] === ''
      ? [new FilterQuery('')]
      : subQueries.map(sq => new FilterQuery(sq));
  }

  valid() {
    return this.filterQueries.map(fq => fq.valid()).every(e => e == true);
  }

  length() {
    return this.filterQueries.length;
  }

  viewHeight() {
    return 75 + 25 * this.length() + (this.length() > 1 ? 35 : 0);
  }

  execute(cards: Card[]) {
    if (!this.valid()) {
      return [];
    }

    const results = this.filterQueries.map(fq => fq.execute(cards));

    return results.reduce((result, currentArray) =>
      result.filter(obj => currentArray.some(item => item.id === obj.id)),
    );
  }
}

export default FilterQuerySet;
