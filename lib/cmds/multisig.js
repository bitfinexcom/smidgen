'use strict'

const fs = require('fs')

const smidgen = require('../smidgen.js')
const getSeed = require('../get-seed.js')
const { getKeyIndex } = require('../accounts.js')

const cmds = {
  'create': createWallet,
  'add': addSigner
}

module.exports = (exports = cmds)

exports.cli = cli
function cli ([ command, id, filename ], cb) {
  switch (command) {
    case 'create':
      cliCreate(id, filename, cb)
      break

    case 'add':
      cliAdd(id, filename, cb)
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
smidgen multisig add <id> <file>
smidgen multisig finalize <id> <file>

Example:
smidgen multisig create rocko wallet-setup.txt`

function cliAdd (id, filename, cb) {
  if (!id) {
    const err = new Error('smidgen multisig add <id> <file>')
    err.type = 'EUSAGE'
    return cb(err)
  }

  fs.access(filename, (err) => {
    if (err) {
      const err = new Error([
        `the file ${filename} does not exist.`,
        'use `smidgen multisig create` to create a valid setup file'
      ].join('\n'))
      err.type = 'EUSAGE'
      return cb(err)
    }

    checkFile(filename, id, smidgen.config, (err) => {
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
    addSigner(smidgen.iota, smidgen.config, seed, id, filename, (err, res) => {
      if (err) return cb(err)

      smidgen.log.info('', `successfully wrote to ${filename}`)
      smidgen.log.info('', 'finish address creation with: ')
      smidgen.log.info('', '`smidgen multisig finalize`')
      return cb(null)
    })
  }
}

function checkFile (filename, id, opts, cb) {
  fs.readFile(filename, 'utf8', (err, data) => {
    if (err) return cb(err)

    let content

    try {
      content = JSON.parse(data)
    } catch (e) {
      const err = new Error([
        `${filename} contains invalid JSON`,
        'use `smidgen multisig create` to create a valid setup file'
      ].join('\n'))
      err.type = 'EUSAGE'
      return cb(err)
    }

    if (!content.parties || content.parties.length < 1) {
      const err = new Error([
        `${filename} has no initial signee`,
        'use `smidgen multisig create` to create a valid setup file'
      ].join('\n'))
      err.type = 'EUSAGE'
      return cb(err)
    }

    const found = content.parties.filter((el) => {
      return el.id === id
    })

    if (found.length && !opts.force) {
      const err = new Error([
        `the id ${id} already exists in ${filename}`,
        'use `--force` to continue anyway'
      ].join('\n'))
      err.type = 'EUSAGE'
      return cb(err)
    }

    return cb(null)
  })
}

function addSigner (iota, opts = { force: false }, seed, id, filename, cb) {
  checkFile(filename, id, opts, (err) => {
    if (err) return cb(err)

    getKeyIndex(iota, { security: 2 }, seed, (err, keyIndex) => {
      if (err) return cb(err)

      const digest = iota.multisig.getDigest(seed, keyIndex, 2)
      const indexRemainder = keyIndex + 1
      const digestRemainder = iota.multisig.getDigest(seed, indexRemainder, 2)
      const res = {
        id: id,
        security: 2,
        indexMain: keyIndex,
        indexRemainder,
        digest,
        digestRemainder
      }
      append(filename, res)
    })

    function append (filename, data) {
      fs.readFile(filename, 'utf8', (err, d) => {
        if (err) return cb(err)

        const content = JSON.parse(d)

        content.parties.push(data)

        const res = JSON.stringify(content, null, '  ')
        fs.writeFile(filename, res, 'utf8', (err, data) => {
          if (err) return cb(err)

          cb(null, res)
        })
      })
    }
  })
}

function createWallet (iota, opts = { force: false }, seed, id, filename, cb) {
  if (!id) return cb(new Error('id not set'))
  if (!seed) return cb(new Error('no seed set'))

  getKeyIndex(iota, { security: 2 }, seed, (err, keyIndex) => {
    if (err) return cb(err)

    const digest = iota.multisig.getDigest(seed, keyIndex, 2)
    const indexRemainder = keyIndex + 1
    const digestRemainder = iota.multisig.getDigest(seed, indexRemainder, 2)
    const res = {
      id: id,
      security: 2,
      indexMain: keyIndex,
      indexRemainder,
      digest,
      digestRemainder
    }

    const content = {
      parties: [
        res
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
            `the file ${filename} already exists. Use --force to overwrite.`
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
        `the file ${filename} already exists. Use --force to overwrite.`
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
        const keyIndex = res.parties[0].indexMain
        const keyIndexRem = res.parties[0].indexRemainder

        smidgen.log.info('', `successfully wrote to ${filename}`)
        smidgen.log.info('', `used key index ${keyIndex} (main) and ${keyIndexRem} (remainder)`)

        smidgen.log.info('', 'finish address creation with: ')
        smidgen.log.info('', '`smidgen multisig add` and `smidgen multisig finalize`')
        return cb(null)
      }

      console.log(JSON.stringify(res))
      cb(null)
    })
  }
}
