# smidgen - Tiny IOTA multisignature wallet

  - [Installation](#installation)
  - [Commands](#commands)
    - generate-seed
    - get-balance
    - generate-address
    - transfer
  - [API](#api)
    - generate-seed
    - get-balance
    - generate-address
    - transfer

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

#### get-balance [--json | --watch]

Gets the balance of a wallet. If `json` is true, it prints JSON.
The `--watch` option lets you watch a wallet for changes.

**Example:**

```
$ smidgen get-balance
Enter your seed:
Balance: 471735365 (471.735365 Mi)

$ smidgen get-balance --json
{"balance":471735365}
```

#### generate-address [--json | --depth | --mwm]

Generates a new address and attaches to tangle.

If `json` is true, it prints JSON.
Use `depth` to configure tip selection and `mwm` to change the minimum
weight magnitude.


#### transfer <amount> <address> [--json | --depth | --mwm]

Transfers a given amount of *i* to an address.

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

#### smidgen['generate-address'](iotaLib, conf, cb)

  - `conf` &lt;Object&gt;
    - `json` &lt;Boolean&gt; return json
    - `depth` &lt;Number&gt; set depth for tip selection
    - `mwm` &lt;Number&gt; set minimum weight magnitude

```js
const smidgen = require('smidgen')

const conf = { json: false, depth: 4, mwm: 18 }
smidgen.load(conf, (err, smidgen) => {
  smidgen.commands['generate-address'](smidgen.iota, conf, (err, address) => {
    console.log(res)
  })
})
```

#### smidgen['transfer'](iotaLib, conf, address, amount, seed, cb)

  - `conf` &lt;Object&gt;
    - `json` &lt;Boolean&gt; return json
    - `depth` &lt;Number&gt; set depth for tip selection
    - `mwm` &lt;Number&gt; set minimum weight magnitude
