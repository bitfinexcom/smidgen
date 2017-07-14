/* eslint-env mocha */

'use strict'

const assert = require('assert')
const { spawnSync } = require('child_process')
const path = require('path')

const cli = path.join(__dirname, '..', 'bin', 'smidgen.js')

describe('int: generate seed', () => {
  it('gs: prints json', () => {
    const opts = { stdio: 'pipe' }
    const c = spawnSync(cli, [ 'generate-seed', '--json' ], opts)
    const res = JSON.parse(c.stdout.toString())

    assert.equal(res.seed.length, 81)
  })

  it('gs: prints seed', () => {
    const opts = { stdio: 'pipe' }
    const c = spawnSync(cli, [ 'generate-seed' ], opts)
    const res = c.stdout.toString().trim()

    assert.equal(res.length, 81)
  })
})
