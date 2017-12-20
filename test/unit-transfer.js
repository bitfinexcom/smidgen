/* eslint-env mocha */

'use strict'

const assert = require('assert')

const transfer = require('../lib/cmds/transfer.js')
const IOTA = require('iota.lib.js')
const iota = new IOTA()

describe('unit: transfer', () => {
  it('parseOutputs parses outputs', () => {
    const res = transfer.parseOutputs(
      [1, 'foo', 2, 'bar', 3, 'baz', 4, 'apple']
    )

    assert.deepEqual(
      res,
      [ { value: 1, address: 'foo' },
        { value: 2, address: 'bar' },
        { value: 3, address: 'baz' },
        { value: 4, address: 'apple' } ]
    )
  })

  it('getFullTransferObjects adds metadata', () => {
    const input = [
      { address: 'foo', value: 1 },
      { address: 'apple', value: 5 }
    ]
    const res = transfer.getFullTransferObjects(
      iota,
      input
    )

    assert.deepEqual(
      res,
      [
        { address: 'foo', value: 1, tag: '999999999999999999999999999', message: '' },
        { address: 'apple', value: 5, tag: '999999999999999999999999999', message: '' }
      ]
    )
  })

  it('getFullTransferObjects adds checksums', () => {
    const input = [
      { address: '999999999999999999999999999999999999999999999999999999999999999999999999999999999', value: 1 },
      { address: '999999999999999999999999999999999999999999999999999999999999999999999999999999999', value: 5 }
    ]
    const res = transfer.getFullTransferObjects(iota, input)

    assert.deepEqual(
      res,
      [
        { address: '999999999999999999999999999999999999999999999999999999999999999999999999999999999A9BEONKZW', value: 1, tag: '999999999999999999999999999', message: '' },
        { address: '999999999999999999999999999999999999999999999999999999999999999999999999999999999A9BEONKZW', value: 5, tag: '999999999999999999999999999', message: '' }
      ]

    )
  })

  it('getOverallOutput parses outputs', () => {
    const res = transfer.parseOutputs(
      [1, 'foo', 2, 'bar', 3, 'baz', 4, 'apple']
    )

    assert.deepEqual(
      res,
      [ { value: 1, address: 'foo' },
        { value: 2, address: 'bar' },
        { value: 3, address: 'baz' },
        { value: 4, address: 'apple' } ]
    )
  })
})
