/* eslint-env mocha */

'use strict'

const assert = require('assert')

const {
  populateCommands
} = require('../lib/smidgen.js')

describe('unit: smidgen.js', () => {
  it('populate filters non js files', () => {
    const res = populateCommands(
      {},
      {},
      [ 'generate-seed.js', 'eat-apple.exe' ]
    )

    assert.ok(res.cliFuncs['generate-seed'])
    assert.ok(typeof res.commandFuncs['generate-seed'] === 'function')
    assert.ok(!res.cliFuncs['eat-apple.exe'])
  })
})
