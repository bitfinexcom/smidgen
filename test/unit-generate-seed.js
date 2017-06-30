/* eslint-env mocha */

'use strict'

const assert = require('assert')

const generateSeed = require('../lib/cmds/generate-seed.js')

describe('unit: generate seed', () => {
  it('generates seeds, 81 chars long', () => {
    const res = generateSeed()
    assert.equal(res.length, 81)
  })

  it('supports json', () => {
    const res = generateSeed({ json: true })
    assert.equal(res.seed.length, 81)
  })
})
