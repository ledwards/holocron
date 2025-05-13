import Card from './Card';
import FilterQuery from './FilterQuery';

class FilterQuerySet {
  query: string;
  filterQueries: FilterQuery[];

  constructor(query: string) {
    this.query = query.trim();
    this.filterQueries = this.parseQuery();
  }

  parseQuery(): FilterQuery[] {
    const subQueries: string[] = this.query.toLowerCase().split('and');
    return subQueries.length < 1 && subQueries[0] === ''
      ? [new FilterQuery('')]
      : subQueries.map(sq => new FilterQuery(sq));
  }

  valid(): boolean {
    return this.filterQueries.map(fq => fq.valid()).every(e => e == true);
  }

  length(): number {
    return this.filterQueries.length;
  }

  // TODO: move this to a presenter
  viewHeight(): number {
    return 45 + 25 * this.length() + (this.length() > 1 ? 35 : 0);
  }

  execute(cards: Card[]): Card[] {
    if (!this.valid()) {
      return [];
    }

    const results: Card[][] = this.filterQueries.map(fq => fq.execute(cards));

    return results.reduce((result: Card[], currentArray: Card[]) =>
      result.filter((obj: Card) => currentArray.some((item: Card) => item.id === obj.id)),
    );
  }
}

export default FilterQuerySet;
