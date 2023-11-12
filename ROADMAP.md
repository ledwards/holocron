FEATURES
========
* Put entire up under tab bar menu
* Scrape public decklists
* Add login screen for gemp
* Browse your own decks
* use OpenAI to ingest rules PDF and card data to create a TD chatbot or natural language chat query interface


BUGS
====
* app sometimes stuck on first load? Log below:
```LOG  Running "holo" with {"rootTag":1,"initialProps":{}}
LOG  [SyntaxError: JSON Parse error: Unexpected end of input]
WARN  Possible Unhandled Promise Rejection (id: 0):
TypeError: Cannot read property 'map' of undefined
TypeError: Cannot read property 'map' of undefined```

* what happens when wifi down and app needs tries to download data?
 - perhaps chekc if internet down, and then say it needs connection


SPECIFIC BUGS
=============
these are specific bugs that should be solved by writing a simple failing test case
* title = search destroy => uses match instead of =
* title matches search and destroy => triggers AND...
* title matchesd & => blanks and shows all instead of combo cards
* cancels blaster pro => says NOT includes blaster pro
* is clone / is a clone => is includes lone
* type = character => type matches character BUT type eq character => type = character
* Search: Luke's returns nothing, but Lukes does
* Search: commas are broken


FUNCTIONALITY IMPROVEMENTS
==========================
* test coverage

* matching and matchingweapon don't really work

* matching/matchingweapon should be disambiguated (matchingstarship, matchingpilot, matchingweapon, matchingcharacterforweapon, matching (all of the above))

* uniqueness doesn't work logically - non-unique, ***, etc. (maybe this is a job for the value class)

* in FilterQuery there is "sketchy" logic (search for that comment.) There should be real logic for this.

* Field might want a true name vs display name that shows in the chip, e.g. "underlyingcardfor" vs "undercard for"

* Sideways starships and weapons show a bit of the green or blue chrome in the list view


UX IMPROVEMENTS
===============
* tapping anywhere on screen should hide keyboard


REFACTORS
=========
* Use Typescript properly in every file...

* colors constants file - almost every view has this
* stylesheets - conditional logic with styles should use classes and a stylesheet

* Value class
 - should contain alias resolver logic
 - values can actually be a set of values, e.g. `gt c numbers` is actually gametext contains either of the two "numbers" cards
 - allow for `lore c foo bar baz` to work with all 3 words
 - this could also allow for "or" logic e.g. `gt c cantina or night club`
 - enums?
 - type checking of sorts? (value is invalid if it doesn't work as a type, like power = bob)

* Repo classes
 - for Card and maybe ExpansionSet
 - would encapsulate search logic, for various search kinds like case insensitive, etc.
 - would encapsulate the logic for loading the data from the json files

* Rename FilterQuerySet to FilterQueryGroup


ONE DAY
=======
* use native driver for CardListItem component e.g. https://stackoverflow.com/questions/63976219/style-property-width-is-not-supported-by-native-animated-module-need-advice-f
*
