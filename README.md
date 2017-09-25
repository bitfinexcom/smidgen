# smidgen - Tiny IOTA multisignature wallet

Status: *smidgen is in late BETA right now*

  - [Installation](#installation)
  - [Multisignature Wallets](#multisignature-wallets)
  - [Commands](#commands)
    - generate-seed
    - get-balance
    - generate-address
    - transfer
    - reattach
    - regenerate-addresses
    - multisig create
    - multisig add
    - multisig finalize
    - multisig transfer
  - [API](#api)
    - 'generate-seed'
    - 'get-balance'
    - 'generate-address'
    - transfer

## Installation

```
npm install -g smidgen
```

## Commands

The CLI supports different commands for managing your wallet.

The default provider is `http://iota.bitfinex.com:80`. You can
change it by passing `--provider http://example.com` as argument.

**Important:** Right now smidgen is not doing the POW itself and depends on a full node as a provider for transfers. You can specify a full node with `--provider`.

### generate-seed [--json]

Returns a seed for the IOTA wallet. If `json` is true, it prints JSON.

**Example:**

```
$ smidgen generate-seed
UZQRLQNQAAXNSJAZTTMWGCAMQCCZBKTQMC9GKRBMVGXWCBIZAOA9LEPBKZKFSPMUEAKGRISEDNOGPZNHG

$ smidgen generate-seed --json
{ seed: 'UZQRLQNQAAXNSJAZTTMWGCAMQCCZBKTQMC9GKRBMVGXWCBIZAOA9LEPBKZKFSPMUEAKGRISEDNOGPZNHG' }
```

### get-balance [address] [--json | --watch | --threshold | --provider]

Gets the balance of a wallet. If `json` is true, it prints JSON.
The `--watch` option lets you watch a wallet for changes.

If an address is provided as argument, it will not require a seeds and
print the balance of the given address.

**Example:**

```
$ smidgen get-balance
Enter your seed:
Balance: 471735365 (471.735365 Mi)

$ smidgen get-balance --json
{"balance":471735365}

$ smidgen get-balance YHPMMBIMEGWGNKRIDNODAXABWBSRZGOQTAPOUAFODCOCOXZMVUZDRFYHMOJMMREBYYJQGKKZSEGIAFWHYYOXVPVFNY
Balance: 55 (0.000055 Mi)
```

### generate-address [--json | --depth | --mwm | --provider]

Generates a new address and attaches to tangle.

If `json` is true, it prints JSON.
Use `depth` to configure tip selection and `mwm` to change the minimum
weight magnitude.


### transfer &lt;amount&gt; &lt;address&gt; [--json | --depth | --mwm | --force | --provider]

Transfers a given amount of *i* to an address.
With `--force` enabled smidgen will not check if the target address was used
before, which can lead to loss of IOTA for the owner of the address.

**Important:** Right now smidgen is not doing the POW itself and depends on a full node as a provider for transfers. You can specify a full node with `--provider`.

### reattach &lt;transaction&gt; [--provider]

Replays a specific transaction.

**Important:** Right now smidgen is not doing the POW itself and depends on a full node as a provider for transfers. You can specify a full node with `--provider`.

### regenerate-addresses [--amount | --json | --depth | --mwm | --force | --provider]

Regenerates addresses to recover balances after a fresh snapshot. Default amount for addresses to generate is 25.

### multisig create &lt;id&gt; &lt;file&gt; [--force]

Starts the creation of a multisignature wallet. `id` is the identifier for
the first party that signs the wallet.

`--force` can be used to overwrite an existing setup-file.

### multisig add &lt;id&gt; &lt;file&gt;

Adds another party to the setup file used for multisignature wallet generation.

### multisig finalize &lt;file&gt;

Creates two addresses for transferring IOTA from the multisig wallet.
One as the main address, and a second one which is used for remaining balance
after the transfer.

### multisig transfer &lt;value&gt; &lt;address&gt; &lt;id&gt; &lt;file&gt; [--provider | --balance]

Transfers a given amout to the target address. Takes the id of the signing
party and the multisignature file, containing the account data.

With `--balance` we can override the current balance. This way smidgen will not query the tangle for the current balance.

**Important:** Right now smidgen is not doing the POW itself and depends on a full node as a provider for transfers. You can specify a full node with `--provider`.

## Multisignature Wallets

Multisignature wallets add an extra layer of security. With them, we can create addresses, that need multiple Seeds for a transaction. The seeds can be owned by one or multiple persons.

**Important:** Seeds to create multisignature wallets should just be used for one wallet.

Smidgen uses a file that is shared between Seed-owners. With the file we manage the wallet with its addresses and transfers. This makes it easier to keep track of the current state. Private keys are not part of the file. Please make sure you read and understood the [Offical IOTA Multisig FAQ](https://github.com/iotaledger/wiki/blob/master/multisigs.md).

**Important:** Right now smidgen is not doing the POW itself and depends on a full node as a provider for transfers. You can specify a full node with `--provider`.

### Creating a Multisignature Wallet

The command for creating a wallet is:

```
smidgen multisig create <id> <file>
```

`id` is the identifier for the current party. The order of the signing parties is important for each transfer. By assigning an identifier to each party it easier to verify the right signing order. `file` is the file we will use to store our transactions and addresses.

Let's say we have two parties, Bob and Alice, who want to manage a wallet.

Bob starts the process and creates the Multisignature Wallet:

```
smidgen multisig create bob multisig.txt
```

Smidgen asks for the Seed Bob wants to use and creates the file with the digest. Tip: `smidgen generate-seed` creates a secure Seed.

```
Enter your seed:
info Successfully wrote to multisig.txt
info Used key index 0 (main) and 1 (remainder)
info
info Add another party with:
info smidgen multisig add <name> multisig.txt
info You can finalize the wallet with:
info smidgen multisig finalize multisig.txt
```

Bob now shares the `multisig.txt` file with Alice to continue with the process.

When Alice receives the file, she has to use the `smidgen multisig add` command to add herself as the next party. Adding parties is possible until we finalize the wallet.

```
smidgen multisig add alice multisig.txt
```

```
Enter your seed:
info Successfully wrote to multisig.txt
info Used key index 0 (main) and 1 (remainder)
info Finish address creation with:
info `smidgen multisig finalize`
```

As there are no remaining parties, Alice finalizes the wallet:

```
smidgen multisig finalize multisig.txt
```

smidgen returns the current main address:


```
info Successfully wrote to multisig.txt
info Main address: LDSWPKCQ9HNPIVHDRUBUWB9ZZPEDFZLYXJNZKIXBFQTWZFVJZJTTOJQWYOR9XVR9NZOQXNQGWQPCCSSWZQPLPDAOIZ
```

That's it. Alice can now share the finalized wallet file with Bob. Transfers from the generated address are just possible if both Alice and Bob sign the transfer.

### Using a multisignature Wallet

Let's take some IOTA from another wallet and transfer them to the new Multisignature wallet:

```
smidgen transfer 3 --provider=http://fullnode.example.com LDSWPKCQ9HNPIVHDRUBUWB9ZZPEDFZLYXJNZKIXBFQTWZFVJZJTTOJQWYOR9XVR9NZOQXNQGWQPCCSSWZQPLPDAOIZ
```

smidgen returns:

```
Enter your seed:
info Successfully sent 3i to LDSWPKCQ9HNPIVHDRUBUWB9ZZPEDFZLYXJNZKIXBFQTWZFVJZJTTOJQWYOR9XVR9NZOQXNQGWQPCCSSWZQPLPDAOIZ
info Transaction sent, hash: HMBROOZJBZYCFZTRVCDINXBLCAUX9ZREKIDWGLFAFYSFFBVBHDZTBBOCRKPNLEBZIURQXGJNXSU999999
info Reattach with `smidgen reattach HMBROOZJBZYCFZTRVCDINXBLCAUX9ZREKIDWGLFAFYSFFBVBHDZTBBOCRKPNLEBZIURQXGJNXSU999999`
```

Awesome! In case our transaction is stuck, we can try to reattach with:

```
smidgen reattach HMBROOZJBZYCFZTRVCDINXBLCAUX9ZREKIDWGLFAFYSFFBVBHDZTBBOCRKPNLEBZIURQXGJNXSU999999
```

We can now monitor the balance of our multisignature wallet:

```
smidgen get-balance --watch LDSWPKCQ9HNPIVHDRUBUWB9ZZPEDFZLYXJNZKIXBFQTWZFVJZJTTOJQWYOR9XVR9NZOQXNQGWQPCCSSWZQPLPDAOIZ
```

smidgen will print the current balance every 15 seconds:

```
Balance: 0 i (0 Mi) - 3s since last update
```

Time for a tea until the funds arrive at our multisignature wallet...


The IOTA arrived!

```
Balance: 3 (0.000003 Mi) - 3s since last update
```

Let's continue and do our first transfer.

To kick off a transfer. Both Bob and Alice have to sign with their Seeds. As Bob signed as the first party, he also has to sign first this time.

A transfer is created from the wallet file that is shared between the parties. Each transfer is appended to the file. This way we keep track of the key indexes and other details, like the current address.

The signature of the command is:

```
smidgen multisig transfer <value> <address> <id> <file>
```

When we try to sign in a wrong order, smidgen will notify us:

```
smidgen multisig transfer 3 VSBHQVNJNWR... alice multisig.txt --provider=http://fullnode.example.com

ERR! Wrong party signing. Current party: bob
ERR! Signing order: bob, alice
```

So Bob has to sign first:

```
smidgen multisig transfer 3 VSBHQVNJNWR... bob multisig.txt --provider=http://fullnode.example.com
```

smidgen returns:

```
info Successfully signed transfer
info Share multisig.txt with 'alice' to continue
```

Great! Now it is Alice's turn to sign the transfer after Bob sent her the updated wallet file. smidgen will detect that the last party has signed and send the transaction. For the transfer we have to do a POW, so we need to specify a full node as provider:

```
smidgen multisig transfer 3 VSBHQVNJNWR... alice multisig.txt --provider=http://fullnode.example.com
```

smidgen verifies the bundle and sends the transfer:

```
Enter your seed:
info Verifying bundle... Bundle: OK
info Sending transaction...
info Transaction sent, hash: OHHJOCLRMKQ9EMINOZXITIKWFZIQBEWPOQWCIOMWOFNOILVDYLERFLJOFANUSECBXFEXOJ...
info Reattach with `smidgen reattach OHHJOCLRMKQ9EMINOZXITIKWFZIQBEWPOQWCIOMWOFNOILVDYLERFLJOFANUSECBXF`
info Saved status to multisig.txt
info New main address: DIYWAXPNINNJXWDPGGXAQTYTPREQYDONTZXGZMQTAGDCUOAEJXJXOIUFAVDUORHERZCXCCUMQGRAP...
```

Great! That's it! smidgen created a new address for us.

In case we want to accept new IOTA, we have to use the new address that was just generated.

## API

smidgen exposes each command as callback-based API function.
There is no printing and other CLI related parts in the functions and they
can be used to compose other programs.

### smidgen['generate-seed'](iotaLib, conf, cb)

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

### smidgen['get-balance'].getBalanceForSeed(iotaLib, conf, seed, cb)

  - `conf` &lt;Object&gt;
    - `json` &lt;Boolean&gt; return json

**Example:**

```js
const smidgen = require('smidgen')

const conf = { json: false }
const seed = 'UZQRLQNQAAXNSJAZTTMWGCAMQCCZBKTQMC9GKRBMVGXWCBIZAOA9LEPBKZKFSPMUEAKGRISEDNOGPZNHG'

smidgen.load(conf, (err, smidgen) => {
  smidgen.commands['get-balance'].getBalanceForSeed(smidgen.iota, conf, seed, (err, res) => {
    console.log(res)
  })
})
```

### smidgen['get-balance'].getBalanceForAddress(iotaLib, conf, address, cb)

  - `conf` &lt;Object&gt;
    - `json` &lt;Boolean&gt; return json
    - `threshold` &lt;Number&gt;

**Example:**

```js
const smidgen = require('smidgen')

const conf = { json: false, threshold: 49 }
const address = 'YHPMMBIMEGWGNKRIDNODAXABWBSRZGOQTAPOUAFODCOCOXZMVUZDRFYHMOJMMREBYYJQGKKZSEGIAFWHYYOXVPVFNY'

smidgen.load(conf, (err, smidgen) => {
  smidgen.commands['get-balance'].getBalanceForAddress(smidgen.iota, conf, address, (err, res) => {
    console.log(res)
  })
})
```

### smidgen['generate-address'](iotaLib, conf, cb)

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

### smidgen['transfer'](iotaLib, conf, address, amount, seed, cb)

  - `conf` &lt;Object&gt;
    - `json` &lt;Boolean&gt; return json
    - `depth` &lt;Number&gt; set depth for tip selection
    - `mwm` &lt;Number&gt; set minimum weight magnitude
    - `force` &lt;Boolean&gt; continue even with already used addresses
