'use strict'

const smidgen = require('../smidgen.js')

function promote (
  iota,
  opts = { depth: 4, mwm: 14 },
  transaction,
  cb
) {
  const spamTransfer = [{address: '9'.repeat(81), value: 0, message: '', tag: ''}]
  iota.api.promoteTransaction(transaction, opts.depth, opts.mwm, spamTransfer,
    {interrupt: false, delay: 0}, cb)
}

const usage = 'Usage: smidgen promote <tail transaction hash> [--provider]'
exports.cli = cliPromote
exports.cli.usage = usage
function cliPromote ([ transaction ], cb) {
  if (!transaction) {
    const err = new Error([
      'No transaction given. Please provide a transaction.',
      usage
    ].join('\n'))
    err.type = 'EUSAGE'
    return cb(err)
  }

  if (!smidgen.iota.valid.isHash(transaction)) {
    const err = new Error([
      'No valid transaction hash given.',
      usage
    ].join('\n'))
    err.type = 'EUSAGE'
    return cb(err)
  }

  promote(smidgen.iota, smidgen.config, transaction, (err, data) => {
    if (err) return cb(err)

    smidgen.log.info('', 'Transaction successfully promoted')
  })
}
