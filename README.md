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

## API

smidgen exposes each command as callback-based API function.
There is no printing and other CLI related parts in the functions and they
can be used to compose other programs.

#### smidgen['generate-seed'](conf, cb)

  - `conf` &lt;Object&gt;
    - `json` &lt;Boolean&gt; return json


**Example:**

```js
const smidgen = require('smidgen')

const conf = { json: false }
smidgen.load(conf, (err, smidgen) => {
  console.log(
    smidgen.commands['generate-seed']()
  )
})
```
