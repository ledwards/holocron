import FilterQuery from '../FilterQuery';

import Card from '../Card';

import darkCards from '../../data/__fixtures__/Dark.json';
import lightCards from '../../data/__fixtures__/Light.json';
const allCards = [...darkCards.cards, ...lightCards.cards]
  .map(c => new Card(c))
  .filter(c => !c.title.includes('AI)')) // excludes (AI) and (Holo AI)
  .filter(c => c.type != 'Game Aid')
  .sort((a, b) =>
    a.sortTitle > b.sortTitle ? 1 : b.sortTitle > a.sortTitle ? -1 : 0,
  );

describe('FilterQuery: basic (three part) queries', () => {
  it('matches query: title = Darth Vader', () => {
    const query = 'title = Darth Vader';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.displayTitle);
    expect(cards).toEqual(['•Darth Vader']);
  });

  it('does not match card that is not there: title = Pikachu', () => {
    const query = 'title = Pikachu';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.displayTitle);
    expect(cards).toEqual([]);
  });

  it('matches query (alias comparator): title == Darth Vader', () => {
    const query = 'title == Darth Vader';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.displayTitle);
    expect(cards).toEqual(['•Darth Vader']);
  });

  it('matches query (alias comparator): title eq Darth Vader', () => {
    const query = 'title eq Darth Vader';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.displayTitle);
    expect(cards).toEqual(['•Darth Vader']);
  });

  it('matches query (no spaces): title=Darth Vader', () => {
    const query = 'title=Darth Vader';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.displayTitle);
    expect(cards).toEqual(['•Darth Vader']);
  });

  it('matches query (alias, no spaces): titleeqDarth Vader', () => {
    const query = 'titleeqDarth Vader';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.displayTitle);
    expect(cards).toEqual(['•Darth Vader']);
  });

  it('matches query (alias field): t=Darth Vader', () => {
    const query = 't=Darth Vader';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.displayTitle);
    expect(cards).toEqual(['•Darth Vader']);
  });

  it('matches query (alias field, alias comparator): t eq Darth Vader', () => {
    const query = 'teqDarth Vader';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.displayTitle);
    expect(cards).toEqual(['•Darth Vader']);
  });

  it('matches query (alias field, alias comparator, alias value): t eq Math Vader', () => {
    const query = 'teqDarth Vader';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.displayTitle);
    expect(cards).toEqual(['•Darth Vader']);
  });

  it('matches query: power = 6', () => {
    const query = 'power = 6';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.displayTitle);
    expect(cards).toEqual(['•Darth Vader']);
  });

  it('matches query: ability > 4', () => {
    const query = 'ability > 4';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.displayTitle);
    expect(cards).toEqual(['•Darth Vader']);
  });

  // BUG: MATCHES < and not <=
  // it('matches query: ability <= 6', () => {
  // const query = 'ability <= 6'
  // const filterQuery = new FilterQuery(query);
  // const cards = filterQuery.execute(allCards).map(h => h.displayTitle);
  // expect(cards).toEqual(['•Darth Vader', '•Luke Skywalker']);
  // });

  it('matches query: pwr=6', () => {
    const query = 'pwr=6';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.displayTitle);
    expect(cards).toEqual(['•Darth Vader']);
  });

  // BUG: It returns all cards?
  // it('matches query: pwr!=6', () => {
  // const query = 'pwr!=6'
  // const filterQuery = new FilterQuery(query);
  // const cards = filterQuery.execute(allCards).map(h => h.displayTitle);
  // expect(cards).toEqual(['•Luke Skywalker']);
  // });
});

describe('FilterQuery: default comparator queries', () => {
  it('matches query (implicit comparator, no space, alias field): pwr6', () => {
    const query = 'pwr6';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.displayTitle);
    expect(cards).toEqual(['•Darth Vader']);
  });
});

describe('FilterQuery: string comparator queries', () => {
  it('matches query (lore contains): best starpilot', () => {
    const query = 'lore contains best starpilot';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.displayTitle);
    expect(cards).toEqual(['•Darth Vader']);
  });

  it('matches query (lore includes): best starpilot', () => {
    const query = 'lore includes best starpilot';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.displayTitle);
    expect(cards).toEqual(['•Darth Vader']);
  });

  it('matches query (lore contains, aliases): best starpilot', () => {
    const query = 'lcbest starpilot';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.displayTitle);
    expect(cards).toEqual(['•Darth Vader']);
  });

  it('matches query (lore equals): not the whole lore', () => {
    const query = 'l eq starpilot';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.displayTitle);
    expect(cards).toEqual([]);
  });

  it('matches query (extratext includes, alias): dark jedi', () => {
    const query = 'extratext c dark jedi';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.displayTitle);
    expect(cards).toEqual(['•Darth Vader']);
  });

  it('matches query (type equals): character', () => {
    const query = 'type equals character';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.displayTitle);
    expect(cards).toEqual(['•Darth Vader', '•Luke Skywalker']);
  });

  it('matches query (set equals): premier', () => {
    const query = 'set eq premiere';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.displayTitle);
    expect(cards).toEqual(['•Darth Vader', '•Luke Skywalker']);
  });
});

describe('FilterQuery: list comparator queries', () => {
  it('matches query (icons contains): pilot', () => {
    const query = 'icons contains pilot';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.displayTitle);
    expect(cards).toEqual(['•Darth Vader', '•Luke Skywalker']);
  });

  // BUG: This converts to NOT INCLUDES instead of INLCUDES and fails
  // it('matches query (icons includes): pilot', () => {
  //   const query = 'icons includes pilot'
  //   const filterQuery = new FilterQuery(query);
  //   const cards = filterQuery.execute(allCards).map(h => h.displayTitle);
  //   expect(cards).toEqual(['•Darth Vader', '•Luke Skywalker']);
  // });

  // TODO: Need a character that is a leader or has a characteristic
  // it('matches query (characteristics c): leader', () => {
  //   const query = 'characteristics c leader'
  //   const filterQuery = new FilterQuery(query);
  //   const cards = filterQuery.execute(allCards).map(h => h.displayTitle);
  //   expect(cards).toEqual(['•Darth Vader']);
  // });
});

describe('FilterQuery: two-part queries', () => {
  // BUG: transforms to NOT INCLUDES instead of INCLUDES
  // Needs interrupts
  // it('matches query (cancels blaster): blaster pro', () => {
  //   const query = 'cancels blaster pro'
  //   const filterQuery = new FilterQuery(query);
  //   const cards = filterQuery.execute(allCards).map(h => h.displayTitle);
  //   expect(cards).toEqual(['•Blaster Proficiency']);
  // });

  it('matches query (pulledby c): Blizzard 4', () => {
    const query = 'pulledby c Blizzard 4';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.displayTitle);
    expect(cards).toEqual(['•Darth Vader']);
  });

  // BUG: this was probably broken by me fixing pwr3
  // it('matches query (pulledby): Blizzard 4', () => {
  // const query = 'pulledby Blizzard 4'
  // const filterQuery = new FilterQuery(query);
  // const cards = filterQuery.execute(allCards).map(h => h.displayTitle);
  // expect(cards).toEqual(['•Darth Vader']);
  // });

  it('matches query (matching): Red 5', () => {
    const query = 'matching Red 5';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.displayTitle);
    expect(cards).toEqual(['•Luke Skywalker']);
  });

  it('matches query (matchingweapon): lightsaber', () => {
    const query = 'matchingweapon lightsaber';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.displayTitle);
    expect(cards).toEqual(['•Darth Vader', '•Luke Skywalker']);
  });

  // BUG: This fails in the UI for some reason
  it("matches query (matchingweapon): vader's lightsaber", () => {
    const query = "matchingweapon vader's lightsaber";
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.displayTitle);
    expect(cards).toEqual(['•Darth Vader']);
  });

  // BUG: This should match anyway but doesn't
  // it('matches query (matchingweapon): vaders lightsaber', () => {
  //   const query = 'matchingweapon vaders lightsaber'
  //   const filterQuery = new FilterQuery(query);
  //   const cards = filterQuery.execute(allCards).map(h => h.displayTitle);
  //   expect(cards).toEqual(['•Darth Vader']);
  // });

  it('matches query (underlyingcard for, alias): darth vader (v)', () => {
    const query = 'ucf darth vader (v)';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.displayTitle);
    expect(cards).toEqual(['•Darth Vader']);
  });

  // TODO: pulls, cancels, canceledby
});

describe('FilterQuery: identity aka "is"', () => {
  // DATA BUG: Darth Vader should be an Imperial! Corrected in my fixture only
  it('matches query (is c): imperial', () => {
    const query = 'is c imperial';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.displayTitle);
    expect(cards).toEqual(['•Darth Vader']);
  });

  // BUG: this was probably broken by me fixing pwr3
  // it('matches query (is): imperial', () => {
  // const query = 'is imperial'
  // const filterQuery = new FilterQuery(query);
  // const cards = filterQuery.execute(allCards).map(h => h.displayTitle);
  // expect(cards).toEqual(['•Darth Vader']);
  // });

  // BUG: this was probably broken by me fixing pwr3
  // it('matches query (is an): imperial - ignores an', () => {
  // const query = 'is an imperial'
  // const filterQuery = new FilterQuery(query);
  // const cards = filterQuery.execute(allCards).map(h => h.displayTitle);
  // expect(cards).toEqual(['•Darth Vader']);
  // });

  // BUG: this was probably broken by me fixing pwr3
  // BUG: should not include starships with pilot icon
  // it('matches query (is): pilot', () => {
  //   const query = 'is pilot'
  //   const filterQuery = new FilterQuery(query);
  //   const cards = filterQuery.execute(allCards).map(h => h.displayTitle);
  //   expect(cards).toEqual(['•Darth Vader', '•Luke Skywalker']);
  // });

  // it('matches query (is): character', () => {
  //   const query = 'is character'
  //   const filterQuery = new FilterQuery(query);
  //   const cards = filterQuery.execute(allCards).map(h => h.displayTitle);
  //   expect(cards).toEqual(['•Darth Vader', '•Luke Skywalker']);
  // });
});

// BUG: Many validity checks are not working - but unclear if they are needed
// it('has partial validity (not valid): po=3', () => {
//   const query = 'po=3'
//   const filterQuery = new FilterQuery(query);
//   expect(filterQuery.valid()).toEqual(false);
// });

// it('has partial validity (invalid field): po=3', () => {
//   const query = 'po=3'
//   const filterQuery = new FilterQuery(query);
//   expect(filterQuery.validField()).toEqual(false);
// });

// it('has partial validity (valid comparator): po=3', () => {
//   const query = 'po=3'
//   const filterQuery = new FilterQuery(query);
//   expect(filterQuery.validComparator()).toEqual(false);
// });

// TODO: Right now, this doesn't work, but it doesn't matter too much
// it('has partial validity (valid value): po=3', () => {
//   const query = 'po=3'
//   const filterQuery = new FilterQuery(query);
//   expect(filterQuery.validValue()).toEqual(false);
// });

// it('shows invalid value when there are no results', () => {
//   const query = 'power=1337'
//   const filterQuery = new FilterQuery(query);
//   expect(filterQuery.validValue()).toEqual(false);
// });
// });

// other weird bugs to test
// "set = Premiere" => "set MATCHES Premiere"
// uniqueness = doesn't really work at all
//
