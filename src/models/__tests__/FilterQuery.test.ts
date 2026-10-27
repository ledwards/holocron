import FilterQuery from '../FilterQuery';
import Card from '../Card';


// import fixtures
import darkCards from '../../data/__fixtures__/Dark.json';
import lightCards from '../../data/__fixtures__/Light.json';
import expansionSets from '../../data/__fixtures__/sets.json';
const allCards = [...darkCards.cards, ...lightCards.cards]
  .map(
    c => {
      // Cast to appropriate type for test environment
      // Provide a default expansion set if none is found
      const expansionSet = expansionSets.find(s => s.id === c.set) || {
        id: 'default',
        name: 'Default Set',
        abbr: 'DEF',
        gempName: 'Default'
      };

      return new Card(
        c as any,
        expansionSet,
      );
    },
  )
  .filter(c => !c.title.match(/\(.*AI.*\)/)) // excludes (AI) and (Holo AI 2), etc.
  .filter(c => c.type != 'Game Aid')
  .sort((a, b) =>
    a.sortTitle > b.sortTitle ? 1 : b.sortTitle > a.sortTitle ? -1 : 0,
  );

describe('FilterQuery: basic (three part) queries', () => {
  it('matches query: title = Hayes Hunter', () => {
    const query = 'title = Hayes Hunter';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.title);
    expect(cards).toEqual(['•Hayes Hunter']);
  });

  it('does not match card that is not there: title = Black Lotus', () => {
    const query = 'title = Black Lotus';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.title);
    expect(cards).toEqual([]);
  });

  it('matches query (alias comparator): title == Hayes Hunter', () => {
    const query = 'title == Hayes Hunter';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.title);
    expect(cards).toEqual(['•Hayes Hunter']);
  });

  it('matches query (alias comparator): title eq Hayes Hunter', () => {
    const query = 'title eq Hayes Hunter';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.title);
    expect(cards).toEqual(['•Hayes Hunter']);
  });

  it('matches query (no spaces): title=Hayes Hunter', () => {
    const query = 'title=Hayes Hunter';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.title);
    expect(cards).toEqual(['•Hayes Hunter']);
  });

  it('matches query (alias, no spaces): titleeqHayes Hunter', () => {
    const query = 'titleeqHayes Hunter';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.title);
    expect(cards).toEqual(['•Hayes Hunter']);
  });

  it('matches query (alias field): t=Hayes Hunter', () => {
    const query = 't=Hayes Hunter';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.title);
    expect(cards).toEqual(['•Hayes Hunter']);
  });

  it('matches query (alias field, alias comparator): t eq Hayes Hunter', () => {
    const query = 'teqHayes Hunter';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.title);
    expect(cards).toEqual(['•Hayes Hunter']);
  });

  it('matches query (alias field, alias comparator, alias value): t eq Math Hunter', () => {
    const query = 'teqHayes Hunter';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.title);
    expect(cards).toEqual(['•Hayes Hunter']);
  });

  it('matches query: power = 6', () => {
    const query = 'power = 6';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.title);
    expect(cards).toEqual(['•Hayes Hunter']);
  });

  it('matches query: ability > 4', () => {
    const query = 'ability > 4';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.title);
    expect(cards).toEqual(['•Hayes Hunter']);
  });

  // BUG: MATCHES < and not <=
  // it('matches query: ability <= 6', () => {
  // const query = 'ability <= 6'
  // const filterQuery = new FilterQuery(query);
  // const cards = filterQuery.execute(allCards).map(h => h.title);
  // expect(cards).toEqual(['•Hayes Hunter', '•Scott Lingrell']);
  // });

  it('matches query: pwr=6', () => {
    const query = 'pwr=6';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.title);
    expect(cards).toEqual(['•Hayes Hunter']);
  });

  // BUG: It returns all cards?
  // it('matches query: pwr!=6', () => {
  // const query = 'pwr!=6'
  // const filterQuery = new FilterQuery(query);
  // const cards = filterQuery.execute(allCards).map(h => h.title);
  // expect(cards).toEqual(['•Scott Lingrell']);
  // });
});

describe('FilterQuery: default comparator queries', () => {
  it('matches query (implicit comparator, no space, alias field): pwr6', () => {
    const query = 'pwr6';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.title);
    expect(cards).toEqual(['•Hayes Hunter']);
  });
});

describe('FilterQuery: string comparator queries', () => {
  it('matches query (lore contains): best starpilot', () => {
    const query = 'lore contains best starpilot';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.title);
    expect(cards).toEqual(['•Hayes Hunter']);
  });

  it('matches query (lore includes): best starpilot', () => {
    const query = 'lore includes best starpilot';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.title);
    expect(cards).toEqual(['•Hayes Hunter']);
  });

  it('matches query (lore contains, aliases): best starpilot', () => {
    const query = 'lcbest starpilot';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.title);
    expect(cards).toEqual(['•Hayes Hunter']);
  });

  it('matches query (lore equals): not the whole lore', () => {
    const query = 'l eq starpilot';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.title);
    expect(cards).toEqual([]);
  });

  it('matches query (extratext includes, alias): derek jeter', () => {
    const query = 'extratext c derek jeter';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.title);
    expect(cards).toEqual(['•Hayes Hunter']);
  });

  it('matches query (type equals): character', () => {
    const query = 'type equals character';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.title);
    expect(cards).toEqual(['•Hayes Hunter', '•Scott Lingrell']);
  });

  it('matches query (set equals): premiere', () => {
    const query = 'set eq premiere';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.title);
    expect(cards).toEqual(['•Hayes Hunter']);
  });

  it('matches query with value alias (set equals): P', () => {
    const query = 'set eq p';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.title);
    expect(cards).toEqual(['•Hayes Hunter']);
  });
});

// Regression (2026-10-27): "set c premiere", "side = dark", "icons c pilot"
// all returned 0 results in production because the value was rewritten into
// the title of the first card that CONTAINED it ("Alter (Premiere) (V)",
// "Dark Hours", ...). A value is only ever an alias for a field that holds card
// names or set names, and only when it matches an alias exactly.
describe('FilterQuery: typed values are taken literally', () => {
  const makeCard = (
    gempId: string,
    title: string,
    set: {id: string; name: string; abbr: string; gempName: string},
    front: Record<string, unknown> = {},
    side = 'Dark',
    abbr: string[] = [],
  ) =>
    new Card(
      {
        gempId,
        side,
        set: set.id,
        rarity: 'U',
        abbr,
        front: {
          title,
          type: 'Effect',
          subType: '',
          characteristics: [],
          icons: [],
          imageUrl: '',
          ...front,
        },
      } as any,
      set,
    );

  const premiere = {id: '1', name: 'Premiere', abbr: 'P', gempName: 'Premiere'};
  const virtual0 = {id: '200', name: 'Virtual Set 0', abbr: 'V0', gempName: 'Set 0'};
  const cards = [
    makeCard('200_115', 'Alter (Premiere) (V)', virtual0),
    makeCard('1_1', '•Dark Hours', premiere, {type: 'Interrupt'}),
    makeCard('1_2', '•Pilot Proficiency', premiere, {type: 'Interrupt'}),
    makeCard('1_3', '•Effective Repairs', premiere, {type: 'Interrupt'}),
    // "pilot" is also this card's nickname: an exact alias hit on a field that
    // does not hold card names must still leave the value alone.
    makeCard('1_4', '•Hayes Hunter', premiere, {type: 'Character', icons: ['Pilot']}, 'Light', ['pilot']),
  ];
  const titles = (query: string) =>
    new FilterQuery(query).execute(cards).map(c => c.title).sort();

  it('set c premiere matches the Premiere set, not a card titled "(Premiere)"', () => {
    expect(titles('set c premiere')).toEqual(
      ['•Dark Hours', '•Effective Repairs', '•Hayes Hunter', '•Pilot Proficiency'],
    );
  });

  it('side = dark is not rewritten into "Dark Hours"', () => {
    expect(titles('side = dark')).toEqual(
      ['Alter (Premiere) (V)', '•Dark Hours', '•Effective Repairs', '•Pilot Proficiency'],
    );
  });

  it('icons c pilot is not rewritten into "Pilot Proficiency" or into a nicknamed card', () => {
    expect(titles('icons c pilot')).toEqual(['•Hayes Hunter']);
  });

  it('title c pilot does resolve the nickname, because title holds card names', () => {
    expect(titles('title c pilot')).toEqual(['•Hayes Hunter']);
  });

  it('type c effect is not rewritten into "Effective Repairs"', () => {
    expect(titles('type c effect')).toEqual(['Alter (Premiere) (V)']);
  });

  it('execute does not mutate the parsed value shown in the status bar', () => {
    const filterQuery = new FilterQuery('set eq p');
    filterQuery.execute(cards);
    expect(filterQuery.value).toBe('p');
    expect(filterQuery.rawValue).toBe('p');
  });
});

describe('FilterQuery: list comparator queries', () => {
  it('matches query (icons contains): pilot', () => {
    const query = 'icons contains pilot';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.title);
    expect(cards).toEqual(['•Hayes Hunter', '•Scott Lingrell']);
  });

  // BUG: This converts to NOT INCLUDES instead of INLCUDES and fails
  // it('matches query (icons includes): pilot', () => {
  //   const query = 'icons includes pilot'
  //   const filterQuery = new FilterQuery(query);
  //   const cards = filterQuery.execute(allCards).map(h => h.title);
  //   expect(cards).toEqual(['•Hayes Hunter', '•Scott Lingrell']);
  // });

  // TODO: Need a character that is a leader or has a characteristic
  // it('matches query (characteristics c): leader', () => {
  //   const query = 'characteristics c leader'
  //   const filterQuery = new FilterQuery(query);
  //   const cards = filterQuery.execute(allCards).map(h => h.title);
  //   expect(cards).toEqual(['•Hayes Hunter']);
  // });
});

describe('FilterQuery: two-part queries', () => {
  // BUG: transforms to NOT INCLUDES instead of INCLUDES
  // Needs interrupts
  // it('matches query (cancels blaster): blaster pro', () => {
  //   const query = 'cancels blaster pro'
  //   const filterQuery = new FilterQuery(query);
  //   const cards = filterQuery.execute(allCards).map(h => h.title);
  //   expect(cards).toEqual(['•Blaster Proficiency']);
  // });

  it('matches query (pulledby c): Frozen 4', () => {
    const query = 'pulledby c Frozen 4';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.title);
    expect(cards).toEqual(['•Hayes Hunter']);
  });

  // BUG: this was probably broken by me fixing pwr3
  // it('matches query (pulledby): Frozen 4', () => {
  // const query = 'pulledby Frozen 4'
  // const filterQuery = new FilterQuery(query);
  // const cards = filterQuery.execute(allCards).map(h => h.title);
  // expect(cards).toEqual(['•Hayes Hunter']);
  // });

  it('matches query (matching): Purple 5', () => {
    const query = 'matching Purple 5';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.title);
    expect(cards).toEqual(['•Scott Lingrell']);
  });

  it('matches query (matchingweapon): laser sword', () => {
    const query = 'matchingweapon laser sword';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.title);
    expect(cards).toEqual(['•Hayes Hunter', '•Scott Lingrell']);
  });

  // BUG: This fails in the UI for some reason
  it("matches query (matchingweapon): Hunter's laser sword", () => {
    const query = "matchingweapon Hunter's laser sword";
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.title);
    expect(cards).toEqual(['•Hayes Hunter']);
  });

  // BUG: This should match anyway but doesn't
  // it('matches query (matchingweapon): Hunters laser sword', () => {
  //   const query = 'matchingweapon Hunters laser sword'
  //   const filterQuery = new FilterQuery(query);
  //   const cards = filterQuery.execute(allCards).map(h => h.title);
  //   expect(cards).toEqual(['•Hayes Hunter']);
  // });

  it('matches query (underlyingcard for, alias): Hayes Hunter (v)', () => {
    const query = 'ucf Hayes Hunter (v)';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.title);
    expect(cards).toEqual(['•Hayes Hunter']);
  });

  // TODO: pulls, cancels, canceledby
});

describe('FilterQuery: identity aka "is"', () => {
  // DATA BUG: Hayes Hunter should be an Imperial! Corrected in my fixture only
  it('matches query (is c): imperial', () => {
    const query = 'is c imperial';
    const filterQuery = new FilterQuery(query);
    const cards = filterQuery.execute(allCards).map(h => h.title);
    expect(cards).toEqual(['•Hayes Hunter']);
  });

  // BUG: this was probably broken by me fixing pwr3
  // it('matches query (is): imperial', () => {
  // const query = 'is imperial'
  // const filterQuery = new FilterQuery(query);
  // const cards = filterQuery.execute(allCards).map(h => h.title);
  // expect(cards).toEqual(['•Hayes Hunter']);
  // });

  // BUG: this was probably broken by me fixing pwr3
  // it('matches query (is an): imperial - ignores an', () => {
  // const query = 'is an imperial'
  // const filterQuery = new FilterQuery(query);
  // const cards = filterQuery.execute(allCards).map(h => h.title);
  // expect(cards).toEqual(['•Hayes Hunter']);
  // });

  // BUG: this was probably broken by me fixing pwr3
  // BUG: should not include starships with pilot icon
  // it('matches query (is): pilot', () => {
  //   const query = 'is pilot'
  //   const filterQuery = new FilterQuery(query);
  //   const cards = filterQuery.execute(allCards).map(h => h.title);
  //   expect(cards).toEqual(['•Hayes Hunter', '•Scott Lingrell']);
  // });

  // it('matches query (is): character', () => {
  //   const query = 'is character'
  //   const filterQuery = new FilterQuery(query);
  //   const cards = filterQuery.execute(allCards).map(h => h.title);
  //   expect(cards).toEqual(['•Hayes Hunter', '•Scott Lingrell']);
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
