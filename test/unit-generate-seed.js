/* eslint-env mocha */

'use strict'

const assert = require('assert')

const generateSeed = require('../lib/cmds/generate-seed.js')

describe('unit: generate seed', () => {
  const stubIota = {}

  it('generates seeds, 81 chars long', () => {
    generateSeed(stubIota, {}, (_, res) => {
      assert.equal(res.length, 81)
    })
  })

  it('supports json', () => {
    generateSeed(stubIota, { json: true }, (_, res) => {
      assert.equal(res.seed.length, 81)
    })
  })
})
