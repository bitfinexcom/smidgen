'use strict'

const fs = require('fs')

const smidgen = require('../smidgen.js')
const getSeed = require('../get-seed.js')
const { getKeyIndex } = require('../accounts.js')

const cmds = {
  'create': createWallet
}

module.exports = (exports = cmds)

exports.cli = cli
function cli ([ command, id, filename ], cb) {
  switch (command) {
    case 'create':
      cliCreate(id, filename, cb)
      break

    default:
      const err = new Error(usage)
      err.type = 'EUSAGE'
      cb(err)
      break
  }
}

const usage = `Usage:
smidgen multisig create <id> [<file>]
smidgen multisig create <id> > <file>
smidgen multisig add <id> <file>
smidgen multisig finalize <id> <file>

Example:
smidgen multisig create rocko wallet-setup.txt`

function createWallet (iota, opts = { force: false }, seed, id, filename, cb) {
  if (!id) return cb(new Error('id not set'))
  if (!seed) return cb(new Error('no seed set'))

  getKeyIndex(iota, { security: 2 }, seed, (err, keyIndex) => {
    if (err) return cb(err)

    const digest = iota.multisig.getDigest(seed, keyIndex, 2)
    const content = {
      parties: [
        { [id]: { security: 2, index: keyIndex, digest } }
      ]
    }

    if (!filename) return cb(null, content)

    writeToFile(content)
  })

  function writeToFile (content) {
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

      return cb(null, content)
    })
  }
}

function cliCreate (id, filename, cb) {
  if (!id) {
    const err = new Error('smidgen multisig create <id> [<file>]')
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
    createWallet(smidgen.iota, smidgen.config, seed, id, filename, (err, res) => {
      if (err) return cb(err)

      if (filename) {
        smidgen.log.info('', `Successfully wrote to ${filename}`)
        smidgen.log.info('', 'Finish address creation with: ')
        smidgen.log.info('', '`smidgen multisig add` and `smidgen multisig finalize`')
        return cb(null)
      }
      console.log(JSON.stringify(res))
      cb(null)
    })
  }
}
