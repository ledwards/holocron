import Card from './Card';
import FilterQuery from './FilterQuery';

class FilterQuerySet {
  query: string;
  filterQueries: FilterQuery[];
  cards?: Card[];

  /**
   * @param query clauses joined by "and", e.g. "side = dark and power > 5"
   * @param cards when given, used to read clauses typed without spaces
   *   ("sidedarkandpower>5"); see FilterQuery for the single-clause rules.
   */
  private queries = new Map<string, FilterQuery>();
  private splits = new Map<string, string[]>();

  constructor(query: string, cards?: Card[]) {
    this.query = query.trim();
    this.cards = cards;
    this.filterQueries = this.parseQuery();
  }

  private clauseQuery(clause: string): FilterQuery {
    let query = this.queries.get(clause);
    if (!query) {
      query = new FilterQuery(clause, this.cards);
      this.queries.set(clause, query);
    }
    return query;
  }

  parseQuery(): FilterQuery[] {
    // "and" between spaces always joins clauses. "and" inside a word never
    // does ("commander", "landspeed"); see splitCompactAnd for "and" typed
    // without spaces.
    const clauses = this.query
      .toLowerCase()
      .split(/\s+and\s+/)
      .flatMap(clause => this.splitCompactAnd(clause));

    return clauses.map(clause => this.clauseQuery(clause));
  }

  /**
   * "setcpremiereandsidedark" is two clauses, "titlecoarseandrough" is one.
   * Split at an "and" only when the left side is a complete clause, the right
   * side starts with a field spelled with at least two letters (one-letter
   * aliases begin too many ordinary words), and — when cards are known — both
   * sides find cards. Otherwise the "and" is part of the value.
   */
  splitCompactAnd(clause: string): string[] {
    const known = this.splits.get(clause);
    if (known) {
      return known;
    }
    const split = this.splitCompactAndUncached(clause);
    this.splits.set(clause, split);
    return split;
  }

  private splitCompactAndUncached(clause: string): string[] {
    const andAt = /and/g;
    let match: RegExpExecArray | null;

    while ((match = andAt.exec(clause)) !== null) {
      const left = clause.slice(0, match.index).trim();
      const right = clause.slice(match.index + 3).trim();
      if (!left || !right) {
        continue;
      }

      const rightClauses = this.splitCompactAnd(right);
      const leftQuery = this.clauseQuery(left);
      const rightQueries = rightClauses.map(c => this.clauseQuery(c));
      const isClause = (q: FilterQuery) =>
        q.valid() && (!this.cards || q.execute(this.cards).length > 0);
      const splits =
        isClause(leftQuery) &&
        rightQueries.every(isClause) &&
        (rightQueries[0].rawField?.length || 0) >= 2;

      if (splits) {
        return [left, ...rightClauses];
      }
    }

    return [clause];
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
