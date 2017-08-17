# smidgen - Tiny IOTA multisignature wallet

  - [Installation](#installation)
  - [Commands](#commands)
    - generate-seed
    - get-balance
    - generate-address
    - transfer
    - multisig create
    - multisig add
    - multisig finalize
  - [API](#api)
    - 'generate-seed'
    - 'get-balance'
    - 'generate-address'
    - transfer
    - multisig.create
    - multisig.add
    - multisig.finalize

## Installation

```
npm install -g smidgen
```

## Commands

The CLI supports different commands for managing your wallet.

The default provider is `http://iota.bitfinex.com:80`. You can
change it by passing `--provider http://example.com` as argument.

#### generate-seed [--json]

Returns a seed for the IOTA wallet. If `json` is true, it prints JSON.

**Example:**

```
$ smidgen generate-seed
UZQRLQNQAAXNSJAZTTMWGCAMQCCZBKTQMC9GKRBMVGXWCBIZAOA9LEPBKZKFSPMUEAKGRISEDNOGPZNHG

$ smidgen generate-seed --json
{ seed: 'UZQRLQNQAAXNSJAZTTMWGCAMQCCZBKTQMC9GKRBMVGXWCBIZAOA9LEPBKZKFSPMUEAKGRISEDNOGPZNHG' }
```

#### get-balance [--json | --watch | --provider]

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

#### generate-address [--json | --depth | --mwm | --provider]

Generates a new address and attaches to tangle.

If `json` is true, it prints JSON.
Use `depth` to configure tip selection and `mwm` to change the minimum
weight magnitude.


#### transfer <amount> <address> [--json | --depth | --mwm | --force | --provider]

Transfers a given amount of *i* to an address.
With `--force` enabled smidgen will not check if the target address was used
before, which can lead to loss of IOTA for the owner of the address.

#### multisig create <id> <file> [--force]

Starts the creation of a multisignature wallet. `id` is the identifier for
the first party that signs the wallet.

`--force` can be used to overwrite an existing setup-file.

#### multisig add <id> <file>

Adds another party to the setup file used for multisignature wallet generation.

#### multisig finalize <file>

Creates two addresses for transferring IOTA from the multisig wallet.
One as the main address, and a second one which is used for remaining balance
after the transfer.

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
    - `force` &lt;Boolean&gt; continue even with already used addresses

#### smidgen['multisig'].create(iotaLib, conf, seed, id, filename, cb)

  - `conf` &lt;Object&gt;
    - `force` &lt;Boolean&gt; overwrite existing setup file

If `filename` is `undefined` the `create` command will not write to a file.

#### smidgen['multisig'].add(iotaLib, conf, seed, id, filename, cb)

#### smidgen['multisig'].finalize(iotaLib, conf, filename, cb)
