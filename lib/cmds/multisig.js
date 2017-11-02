'use strict'

const fs = require('fs')

const smidgen = require('../smidgen.js')
const getSeed = require('../get-seed.js')
const { getKeyIndex } = require('../accounts.js')

const cmds = {
  'create': createWallet,
  'add': addSigner,
  'finalize': finalizeAddress,
  'transfer': transfer
}

module.exports = (exports = cmds)

const usage = `Usage:
smidgen multisig create <id> <file>
smidgen multisig add <id> <file>
smidgen multisig finalize <id> <file>

smidgen multisig transfer <value> <address> <id> <file>

Example:
smidgen multisig create rocko wallet-setup.txt`

const shortUsage = `
multisig create <id> <file> [--force]
multisig add <id> <file>
multisig finalize <id> <file>
multisig transfer <value> <address> <id> <file> [--provider | --balance]
`

exports.cli = cli
exports.cli.usage = shortUsage

function cli ([ command, ...args ], cb) {
  let id, filename, amount, address
  switch (command) {
    case 'create':
      [ id, filename ] = args
      cliCreate(id, filename, cb)
      break

    case 'add':
      [ id, filename ] = args
      cliAdd(id, filename, cb)
      break

    case 'finalize':
      [ filename ] = args
      cliFinalize(filename, cb)
      break

    case 'transfer':
      [ amount, address, id, filename ] = args
      cliTransfer(amount, address, id, filename, cb)
      break

    default:
      const err = new Error(usage)
      err.type = 'EUSAGE'
      cb(err)
      break
  }
}

function cliTransfer (value, address, id, filename, cb) {
  if (!value || !address || !id || !filename) {
    const err = new Error(
      'Usage: smidgen multisig transfer <value> <address> <id> <file>'
    )
    err.type = 'EUSAGE'
    return cb(err)
  }

  value = +value
  if (typeof value !== 'number') {
    const err = new Error([
      'Value must be a number',
      'Usage: smidgen multisig transfer <value> <address> <id> <file>'
    ].join('\n'))

    err.type = 'EUSAGE'
    return cb(err)
  }

  fs.access(filename, (err) => {
    if (err) {
      const err = new Error([
        `The file ${filename} does not exist.`,
        'Use `smidgen multisig create` to create a valid setup file'
      ].join('\n'))
      err.type = 'EUSAGE'
      return cb(err)
    }

    readAndCheckFile(filename, null, smidgen.config, (err, data) => {
      if (err) return cb(err)

      transfer(smidgen.iota, smidgen.config, value, address, id, filename, data, cb)
    })
  })
}

function getSigningOrder (data) {
  const parties = data.parties

  const res = parties.map((el) => {
    return el.id
  })

  return res
}

function getSecuritySum (data) {
  const parties = data.parties

  const res = parties.reduce((acc, el) => {
    acc = acc + el.security
    return acc
  }, 0)

  return res
}

function transfer (iota, opts, value, targetAddress, id, filename, data, cb) {
  const current = data.current

  if (!current) {
    const err = new Error([
      `No current entry for transaction available`
    ].join('\n'))
    err.type = 'EUSAGE'
    return cb(err)
  }

  if (!current.transfer) {
    current.transfer = {}
  }

  const signingOrder = getSigningOrder(current)
  const securitySum = getSecuritySum(current)

  let currentSignee
  let firstTransfer = !current.transfer.bundles
  let index

  if (firstTransfer) {
    index = 0
    currentSignee = current.parties[index]
  } else {
    index = current.transfer.bundles.signed.length
    if (!current.parties[index]) {
      const err = new Error(
        'Signed bundle count equals party count'
      )
      err.type = 'EUSAGE'
    }

    currentSignee = current.parties[index]
  }

  let nextParty
  if (current.parties[index + 1]) {
    nextParty = current.parties[index + 1].id
  }

  if (id !== currentSignee.id) {
    const err = new Error([
      `Wrong party signing. Current party: ${currentSignee.id}`,
      `Signing order: ${signingOrder.join(', ')}`
    ].join('\n'))
    err.type = 'EUSAGE'
    return cb(err)
  }

  getSeed((err, seed) => {
    if (err) return cb(err)

    continueWithSeed(seed)
  })

  function continueWithSeed (seed) {
    const address = iota.utils.noChecksum(current.mainAddress)

    const multisigTransfer = [{
      address: iota.utils.noChecksum(targetAddress),
      value: value,
      message: '',
      tag: '9'.repeat(27)
    }]

    const input = {
      'address': iota.utils.noChecksum(current.mainAddress),
      'securitySum': securitySum,
      'balance': opts.balance
    }

    const entry = createDigestEntry(
      iota,
      currentSignee.id,
      seed,
      currentSignee.indexRemainder,
      currentSignee.security
    )

    if (!data.next) {
      data.next = {
        parties: [
          entry
        ]
      }
    } else {
      data = appendToNext(data, entry)
    }

    if (firstTransfer) {
      current.transfer.bundles = {}
      iota.multisig.initiateTransfer(
        input,
        iota.utils.noChecksum(current.remainderAddress),
        multisigTransfer,
        (err, initiatedBundle) => {
          if (err) return cb(err)

          current.transfer.bundles.initial = initiatedBundle
          current.transfer.bundles.signed = []

          current.transfer.meta = multisigTransfer[0]

          iota.multisig.addSignature(
            initiatedBundle,
            address,
            iota.multisig.getKey(seed, currentSignee.indexMain, currentSignee.security),
            (err, signedBundle) => {
              if (err) return cb(err)

              current.transfer.bundles.signed.push(signedBundle)

              data.current = current
              const r = JSON.stringify(data, null, '  ')
              fs.writeFile(filename, r, 'utf8', (err) => {
                if (err) return cb(err)

                smidgen.log.info('', `Successfully signed transfer`)
                smidgen.log.info('', `Share ${filename} with '${nextParty}' to continue`)

                cb(null, data)
              })
            })
        })

      return
    }

    // find out current point in transaction
    const transactionIndex = current.transfer.bundles.signed.length - 1
    const lastSigned = current.transfer.bundles.signed[transactionIndex]

    iota.multisig.addSignature(
      lastSigned,
      address,
      iota.multisig.getKey(seed, currentSignee.indexMain, currentSignee.security),
      (err, nextBundle) => {
        if (err) return cb(err)

        current.transfer.bundles.signed.push(nextBundle)
        flush(nextParty, nextBundle)
      })

    function flush (nextParty, nextBundle) {
      if (!nextParty) {
        const bundleState = iota.utils.validateSignatures(nextBundle, address) ? 'OK' : 'INVALID'
        smidgen.log.info('', `Verifying bundle... Bundle: ${bundleState}`)

        if (bundleState === 'INVALID') {
          const err = new Error('Bundle is invalid - check your seed/balance/address')
          err.type = 'EUSAGE'
          return cb(err)
        }

        const [
          mainAddress,
          remainderAddress
        ] = getAddresses(iota, data.next.parties)

        data.next.mainAddress = mainAddress
        data.next.remainderAddress = remainderAddress

        const tryteBundle = nextBundle.map((tr) => {
          return iota.utils.transactionTrytes(tr)
        }).reverse()

        smidgen.log.info('', 'Sending transaction...')
        current.transfer.bundles.final = nextBundle

        iota.api.sendTrytes(tryteBundle, opts.depth, opts.mwm, (err, transaction) => {
          if (err) return cb(err)

          const hash = transaction[0].hash
          smidgen.log.info('', `Transaction sent, hash: ${hash}`)
          smidgen.log.info('', `Reattach with \`smidgen reattach ${hash}\``)
          current.transfer.transaction = transaction

          const last = Object.assign({}, current)
          if (!data.last) {
            data.last = []
          }
          data.last.push(last)

          const next = Object.assign({}, data.next)
          data.current = next
          data.next = null

          writeBundle()
        })

        return
      }

      writeBundle()

      function writeBundle () {
        const res = JSON.stringify(data, null, '  ')
        fs.writeFile(filename, res, 'utf8', (err) => {
          if (err) return cb(err)

          if (nextParty) {
            smidgen.log.info('', `Successfully signed transfer`)
            smidgen.log.info('', `Share ${filename} with '${nextParty}' to continue`)
          } else {
            smidgen.log.info('', `Saved status to ${filename}`)
            smidgen.log.info('', `New main address: ${data.current.mainAddress}`)
          }

          cb(null, current)
        })
      }
    }
  }
}

function cliFinalize (filename, cb) {
  if (!filename) {
    const err = new Error('smidgen multisig finalize <file>')
    err.type = 'EUSAGE'
    return cb(err)
  }

  finalizeAddress(smidgen.iota, smidgen.config, filename, (err, res) => {
    if (err) return cb(err)

    smidgen.log.info('', `Successfully wrote to ${filename}`)
    smidgen.log.info('', `Main address: ${res.current.mainAddress}`)

    return cb(null)
  })
}

function finalizeAddress (iota, opts, filename, cb) {
  readAndCheckFile(filename, null, opts, (err, content) => {
    if (err) return cb(err)

    if (!content.next) {
      const err = new Error([
        'Found no next property, is file finalized already?'
      ].join('\n'))
      err.type = 'EUSAGE'
      return cb(err)
    }

    if (content.next.parties.length < 2) {
      const err = new Error([
        'Found just one party in setup file. ' +
        'need at least 2 parties for multisigning.',
        'Add another party with: smidgen add <id>'
      ].join('\n'))
      err.type = 'EUSAGE'
      return cb(err)
    }

    const [
      mainAddress,
      remainderAddress
    ] = getAddresses(iota, content.next.parties)

    content.next.mainAddress = mainAddress
    content.next.remainderAddress = remainderAddress

    const current = Object.assign({}, content.next)
    content.current = current
    content.next = null

    const res = JSON.stringify(content, null, '  ')
    fs.writeFile(filename, res, 'utf8', (err) => {
      if (err) return cb(err)

      cb(null, content)
    })
  })
}

function getAddresses (iota, parties) {
  const Address = iota.multisig.address

  const mainAddress = new Address()
  const remainderAddress = new Address()

  parties.forEach((party) => { // aint no party like a multisig party :)
    mainAddress.absorb(party.digest)
    remainderAddress.absorb(party.digestRemainder)
  })

  let finalizedMainAddress = mainAddress.finalize()
  let finalizedRemainderAddress = remainderAddress.finalize()

  if (finalizedMainAddress.length === 81) {
    finalizedMainAddress = iota.utils.addChecksum(finalizedMainAddress)
  }
  if (finalizedRemainderAddress.length === 81) {
    finalizedRemainderAddress = iota.utils.addChecksum(finalizedRemainderAddress)
  }

  return [ finalizedMainAddress, finalizedRemainderAddress ]
}

function cliAdd (id, filename, cb) {
  if (!id) {
    const err = new Error('smidgen multisig add <id> <file>')
    err.type = 'EUSAGE'
    return cb(err)
  }

  fs.access(filename, (err) => {
    if (err) {
      const err = new Error([
        `The file ${filename} does not exist.`,
        'Use `smidgen multisig create` to create a valid setup file'
      ].join('\n'))
      err.type = 'EUSAGE'
      return cb(err)
    }

    readAndCheckFile(filename, id, smidgen.config, (err) => {
      if (err) return cb(err)
      nextAdd()
    })
  })

  function nextAdd () {
    getSeed((err, seed) => {
      if (err) return cb(err)

      finalizeAdd(seed)
    })
  }

  function finalizeAdd (seed) {
    addSigner(smidgen.iota, smidgen.config, seed, id, filename, (err, [ entry, content ]) => {
      if (err) return cb(err)

      const keyIndex = entry.indexMain
      const keyIndexRem = entry.indexRemainder
      smidgen.log.info('', `Successfully wrote to ${filename}`)
      smidgen.log.info('', `Used key index ${keyIndex} (main) and ${keyIndexRem} (remainder)`)
      smidgen.log.info('', '')

      smidgen.log.info('', `Add another party with: `)
      smidgen.log.info('', `smidgen multisig add <name> ${filename}`)
      smidgen.log.info('', `You can finalize the wallet with:`)
      smidgen.log.info('', `smidgen multisig finalize ${filename}`)
      return cb(null)
    })
  }
}

function readAndCheckFile (filename, id, opts, cb) {
  fs.readFile(filename, 'utf8', (err, data) => {
    if (err) return cb(err)

    let content

    try {
      content = JSON.parse(data)
    } catch (e) {
      const err = new Error([
        `${filename} contains invalid JSON`,
        'Use `smidgen multisig create` to create a valid setup file'
      ].join('\n'))
      err.type = 'EUSAGE'
      return cb(err)
    }

    if (!id) return cb(null, content)

    const found = content.next.parties.filter((el) => {
      return el.id === id
    })

    if (found.length && !opts.force) {
      const err = new Error([
        `The id ${id} already exists in ${filename}`
      ].join('\n'))
      err.type = 'EUSAGE'
      return cb(err)
    }

    return cb(null, content)
  })
}

function addSigner (iota, opts = { security: 2, force: false }, seed, id, filename, cb) {
  readAndCheckFile(filename, id, opts, (err, content) => {
    if (err) return cb(err)

    getKeyIndex(iota, { security: opts.security }, seed, (err, keyIndex) => {
      if (err) return cb(err)

      const entry = createDigestEntry(iota, id, seed, keyIndex, opts.security)
      appendAndWrite(filename, entry)
    })

    function appendAndWrite (filename, entry) {
      const altered = appendToNext(content, entry)

      const res = JSON.stringify(altered, null, '  ')
      fs.writeFile(filename, res, 'utf8', (err) => {
        if (err) return cb(err)

        cb(null, [ entry, content ])
      })
    }
  })
}

function appendToNext (content, entry) {
  content.next.parties.push(entry)

  return content
}

function createDigestEntry (iota, id, seed, keyIndex, security) {
  const digest = iota.multisig.getDigest(seed, keyIndex, security)
  const indexRemainder = keyIndex + 1
  const digestRemainder = iota.multisig.getDigest(seed, indexRemainder, security)
  const entry = {
    id: id,
    security: security,
    indexMain: keyIndex,
    indexRemainder,
    digest,
    digestRemainder
  }

  return entry
}

function createWallet (iota, opts = { force: false, security: 2 }, seed, id, filename, cb) {
  if (!id) return cb(new Error('id not set'))
  if (!seed) return cb(new Error('no seed set'))

  getKeyIndex(iota, { security: opts.security }, seed, (err, keyIndex) => {
    if (err) return cb(err)

    const entry = createDigestEntry(iota, id, seed, keyIndex, opts.security)
    const content = {
      next: {
        parties: [
          entry
        ]
      }
    }

    if (!filename) return cb(null, [ entry, content ])

    writeToFile([ entry, content ])
  })

  function writeToFile ([ entry, content ]) {
    const fileOpts = { encoding: 'utf8' }
    if (!opts.force) {
      fileOpts.flag = 'wx'
    }
    const data = JSON.stringify(content, null, '  ')
    fs.writeFile(filename, data, fileOpts, (err) => {
      if (err) {
        if (err.code === 'EEXIST') {
          const err = new Error(
            `The file ${filename} already exists. Use --force to overwrite.`
          )
          err.type = 'EUSAGE'
          return cb(err)
        }

        return cb(err)
      }

      return cb(null, [ entry, content ])
    })
  }
}

function cliCreate (id, filename, cb) {
  if (!id) {
    const err = new Error('smidgen multisig create <id> <file>')
    err.type = 'EUSAGE'
    return cb(err)
  }

  if (!filename) return next()

  fs.access(filename, (err) => {
    if (!err && !smidgen.config.force) {
      const err = new Error(
        `The file ${filename} already exists. Use --force to overwrite.`
      )
      err.type = 'EUSAGE'
      return cb(err)
    }

    next()
  })

  function next () {
    getSeed((err, seed) => {
      if (err) return cb(err)

      finalize(seed)
    })
  }

  function finalize (seed) {
    createWallet(smidgen.iota, smidgen.config, seed, id, filename, (err, [ entry, res ]) => {
      if (err) return cb(err)

      if (filename) {
        const keyIndex = entry.indexMain
        const keyIndexRem = entry.indexRemainder

        smidgen.log.info('', `Successfully wrote to ${filename}`)
        smidgen.log.info('', `Used key index ${keyIndex} (main) and ${keyIndexRem} (remainder)`)
        smidgen.log.info('', '')

        smidgen.log.info('', `Add another party with: `)
        smidgen.log.info('', `smidgen multisig add <name> ${filename}`)
        smidgen.log.info('', `You can finalize the wallet with:`)
        smidgen.log.info('', `smidgen multisig finalize ${filename}`)
        return cb(null)
      }

      console.log(JSON.stringify(res))
      cb(null)
    })
  }
}
