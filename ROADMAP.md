# ROADMAP

FEATURES
========
* swipe on any expanded card to show card details broken out as text
* Put entire app under tab bar menu
* Decklists
* PDF Rules
* Text Rules
* Add login screen for gemp
* Browse your own decks
* use OpenAI to ingest rules PDF and card data to create a TD chatbot or natural language chat query interface
* Links to Forums, Slack, Discord?
* Settings (switch Dark/Light/inherit mode)


GENERAL BUGS
============
*


DATA-RELATED BUGS
=================
* "Emperor's Prize / Emperor's Prize" and "Jabba's Prize / Jabba's Prize" have name twice. (Mythrol only shows once)


ADVANCED SEARCH BUGS
====================
these are specific bugs that should be solved by writing a simple failing test case
* title = search destroy => uses match instead of =
* title matches search and destroy => triggers AND...
* title matches & => blanks and shows all instead of combo cards
* cancels blaster pro => says NOT includes blaster pro
* is clone / is a clone => is includes lone
* type = character => type matches character BUT type eq character => type = character
* Search: Luke's returns nothing, but Lukes does
* Search: commas are broken
* "gtc va" returns nothing
* "pulled by sos" doesn't work, "pulled by c sos" does
* matching and matchingweapon don't work with "for"
* matching/matchingweapon should be disambiguated (matchingstarship, matchingpilot, matchingweapon, matchingcharacterforweapon, matching (all of the above))
* uniqueness doesn't work logically - non-unique, ***, etc. (maybe this is a job for the value class)
* in FilterQuery there is "sketchy" logic (search for that comment.) There should be real logic for this.


FUNCTIONALITY IMPROVEMENTS
==========================
* fuzzy search (https://medium.com/analytics-vidhya/how-to-create-a-fuzzy-search-in-react-js-using-fuse-js-859f80345657)
* if results include both alias and exact title, list alias last (or sort by score)
* Field might want a true name vs display name that shows in the chip, e.g. "underlyingcardfor" vs "undercard for"


UX IMPROVEMENTS
===============
* tap a site rotates it 180 degrees
* acronyms resolve to their expanded selves in the green filter query area (even for basic search)
* Advanced search (for small phones) on press, hide the detailed view of the advanced query and leave just "combined reuslts" showing, on focus on the input field, show again


DESIGN
======
* empty list state has holocron art - maybe dependent on light vs. dark mode
* Sideways starships and weapons show a bit of the green or blue chrome in the list view


REFACTORS
=========
* test coverage
* Rename `FilterQuerySet` to `FilterQueryGroup`
* SearchMode should be a class instead of a couple hashes
* Theme should also probably be a class
* Use Typescript properly in every file...
* `Value` class
 - should contain alias resolver logic
 - values can actually be a set of values, e.g. `gt c numbers` is actually gametext contains either of the two "numbers" cards
 - allow for `lore c foo bar baz` to work with all 3 words
 - this could also allow for "or" logic e.g. `gt c cantina or night club`
 - enums?
 - type checking of sorts? (value is invalid if it doesn't work as a type, like power = bob)
* Repo classes
 - for `Card` and maybe `ExpansionSet`
 - would encapsulate search logic, for various search kinds like case insensitive, etc.
 - would encapsulate the logic for loading the data from the json files
* `FilterQuery` maybe needs a Presenter that can wrap display logic
* Rename `card` to `cardPresenter` when its a presenter that's being used to clear up confusion
* figure out the magic numbers in the `SearchableCardList` component


APP STORE / OPS
===============


ONE DAY
=======
* use native driver for CardListItem component e.g. https://stackoverflow.com/questions/63976219/style-property-width-is-not-supported-by-native-animated-module-need-advice-f
