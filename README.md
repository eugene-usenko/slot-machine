# Description

# Configuration

This document describes slot machine configuration file.

## General Purpos Parameters

* `id` - machine unique identifier 
* `version` - machine version(or reviesion). Usually consists from two digits separated by _dot_ symbol. First digit is a comulative number of machine across other, second idigi is machine revision number.

## Symbols Section

**`symbols`** - section contains two arrays: 

* **`regular`** - symbols which are used for rules composition 
* **`special`** - symbols which can substitute `regular` in certain cases to complete the line.

```yaml
symbols:
  regular: ['a', 'b', 'c']
  special: ['s', 'w']
```

## Reels Section

**`reels`** - section contains array list. Each array represent reel with it own symbols layout. Reel index starts fron top to bottom.

```yaml
reels:
  - ['a','b','c','a','b','f'] # reel 1
  - ['a','b','c','c','s','f'] # reel 2
  - ['a','b','c','s','w','f'] # reel 3
```

## Paytable Section

**`paytable`** - section describes rules to cacluclate payout for specific combination. Section conatins array of objects. Every object has two fields:

* **`line`** - represent specific win combination. It usually consists from one type symbol(but it's not neccessary).
* **`pays`** - contains arrays with pays. Value bн index correspons pays for specific number of symbol.  

```yaml
paytable:
  - line: ['a','a','a']
    pays: [  0,  5, 10]
  - line: ['b','b','b']
    pays: [  0,  2,  4]
```

For snippet from above:

* `0` will be _paied_ for one `'a'` and one `'b'` symbol on the line
* `5` will be _paied_ for two `'a'` symbols on the line
* `10` will be _paied_ for three `'a'` symbols on the line

## Multipliers Section

**`multipliers`** section contains rules which describes when pays for specific line has to be multiplied. Example:

```yaml
multipliers:
  - line: ['w','*','w']
    value: 4 
  - line: ['*','w','w']
    value: 3
  - line: ['*','*','a']
    value: 2
``` 

* `line` - describes layout of the line. Contains two type of symbols: specific(from the machine configuration) and _whildcard_.
* `value` - multiplier value.

## Minigame Section

**`minigames`** - describes rules for additional built in games:

* **`line`** - combination which triggers mingame. This is array which contains regular symbols as well as _wildcards_ `*`.
* **`gameId`** - unique game identifier.
* **`expected`** - max. payout for this game. This is internal field and required for _symulator_ and statistics calculation.

```yaml
minigames:
  - line: ['*','s','s']
    gameId: 'bonus-game-id'
    expected: 10
```

For snippet from above - `bonus-game-id` game will be triggered in case `line` combination appears on the line. Acceptable combinations are

* `s,s,s` - three `s` symbols on the line
* `x,s,s` - since the first is a wild card, it can be any symbol type

## Freespins Section

**`freespins`** - describes rules for build in machines with free spins.

* **`line`** - combination which triggers mingame. This is array which contains regular symbols as well as _wildcards_ `*`.
* **`value`** - number of free spins the user won
* **`machineId`** - uniquie machine indentifier, which will be used for _free spins_.
* **`expected`** - max. payout for this game. This is internal field and required for _symulator_ and statistics calculation.

```yaml
freespins:
  - line: ['f', '*', 'f']
    value: 10
    machineId: 'mock-machine-freespins'
    expected: 100
  - line: [f', 'f']
    value: 5
    machineId: 'mock-machine-freespins'
    expected: 45
```
Machines with _free spines_ usually represented as not as single machine. `free-spins` it's a separate machine wich looks like exactly the same as original, but it's payout and rules are different.
