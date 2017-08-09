# smidgen - Tiny IOTA multisignature wallet

  - [Installation](#installation)
  - [Commands](#commands)
    - generate-seed
  - [API](#api)
    - generate-seed

## Installation

```
npm install -g smidgen
```

## Commands

The CLI supports different commands for managing your wallet.

#### generate-seed [--json]

Returns a seed for the IOTA wallet. If `json` is true, it prints JSON.

**Example:**

```
$ smidgen generate-seed
UZQRLQNQAAXNSJAZTTMWGCAMQCCZBKTQMC9GKRBMVGXWCBIZAOA9LEPBKZKFSPMUEAKGRISEDNOGPZNHG

$ smidgen generate-seed --json
{ seed: 'UZQRLQNQAAXNSJAZTTMWGCAMQCCZBKTQMC9GKRBMVGXWCBIZAOA9LEPBKZKFSPMUEAKGRISEDNOGPZNHG' }
```

#### get-balance [--json]

Gets the balance of a wallet. If `json` is true, it prints JSON.

**Example:**

```
$ smidgen get-balance
Enter your seed:
Balance: 471735365 (471.735365 Mi)

$ smidgen get-balance --json
{"balance":471735365}
```

## API

smidgen exposes each command as callback-based API function.
There is no printing and other CLI related parts in the functions and they
can be used to compose other programs.

#### smidgen['generate-seed'](iotaLib, conf, cb)

  - `conf` &lt;Object&gt;
    - `json` &lt;Boolean&gt; return json


**Example:**

```js
const smidgen = require('smidgen')

const conf = { json: false }
smidgen.load(conf, (err, smidgen) => {
  smidgen.commands['generate-seed'](smidgen.iota, conf, (err, res) => {
    console.log(res)
  })
})
```

#### smidgen['get-balance'](iotaLib, conf, seed, cb)

  - `conf` &lt;Object&gt;
    - `json` &lt;Boolean&gt; return json

**Example:**

```js
const smidgen = require('smidgen')

const conf = { json: false }
const seed = 'UZQRLQNQAAXNSJAZTTMWGCAMQCCZBKTQMC9GKRBMVGXWCBIZAOA9LEPBKZKFSPMUEAKGRISEDNOGPZNHG'

smidgen.load(conf, (err, smidgen) => {
  smidgen.commands['get-balance'](smidgen.iota, conf, seed, (err, res) => {
    console.log(res)
  })
})
```
