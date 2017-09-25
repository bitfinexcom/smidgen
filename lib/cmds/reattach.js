'use strict'

const smidgen = require('../smidgen.js')

function reAttach (
  iota,
  opts = { depth: 4, mwm: 14 },
  transaction,
  cb
) {
  iota.api.replayBundle(transaction, opts.depth, opts.mwm, cb)
}

const usage = 'Usage: smidgen reattach <transaction hash> [--provider]'
exports.cli = cliReAttach
exports.cli.usage = usage
function cliReAttach ([ transaction ], cb) {
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

  reAttach(smidgen.iota, smidgen.config, transaction, (err, data) => {
    if (err) return cb(err)

    smidgen.log.info('', 'Successfully reattached to tangle')
    smidgen.log.info('', `Bundle: ${data[0].bundle}`)
  })
}
