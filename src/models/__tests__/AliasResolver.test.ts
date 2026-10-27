import AliasResolver from '../AliasResolver';
import Card from '../Card';

const premiere = {id: '1', name: 'Premiere', abbr: 'P', gempName: 'Premiere'};
const reflections = {id: '301', name: 'Reflections II', abbr: 'R2', gempName: 'Reflections II'};

const makeCard = (gempId: string, title: string, abbr: string[], set = premiere) =>
  new Card(
    {
      gempId,
      side: 'Dark',
      set: set.id,
      rarity: 'U',
      abbr,
      front: {title, type: 'Character', subType: '', characteristics: [], icons: [], imageUrl: ''},
    } as any,
    set,
  );

const cards = [
  makeCard('1_168', '•Hayes Hunter', ['Space Hunter', 'Math Hunter']),
  makeCard('200_115', 'Alter (Premiere) (V)', [], reflections),
  makeCard('1_2', '•Dark Hours', []),
  makeCard('301_1', '•Hayes Hunter (V)', [], reflections),
];

describe('AliasResolver', () => {
  const resolver = new AliasResolver(cards);

  it('resolves a card nickname to the card title', () => {
    expect(resolver.resolve('Math Hunter', 'card')).toBe('hayes hunter');
    expect(resolver.resolve('math hunter', 'card')).toBe('hayes hunter');
  });

  it('resolves an exact title to itself, not to a longer title sharing the prefix', () => {
    expect(resolver.resolve('Hayes Hunter', 'card')).toBe('hayes hunter');
  });

  it('does not rewrite a value that is only a substring of some title', () => {
    expect(resolver.resolve('premiere', 'card')).toBe('premiere');
    expect(resolver.resolve('dark', 'card')).toBe('dark');
    expect(resolver.resolve('hunter', 'card')).toBe('hunter');
  });

  it('resolves a set abbreviation or gemp name to the set name', () => {
    expect(resolver.resolve('P', 'set')).toBe('Premiere');
    expect(resolver.resolve('r2', 'set')).toBe('Reflections II');
    expect(resolver.resolve('reflections ii', 'set')).toBe('Reflections II');
  });

  it('knows every set the cards came from, once each', () => {
    expect(resolver.sets.map(s => s.id).sort()).toEqual(['1', '301']);
  });

  it('leaves a value alone for a field that holds neither card nor set names', () => {
    expect(resolver.resolve('Math Hunter')).toBe('Math Hunter');
    expect(resolver.resolve('P')).toBe('P');
  });

  it('leaves a set value alone when it only partially matches a set name', () => {
    expect(resolver.resolve('reflections', 'set')).toBe('reflections');
  });
});
