import { combineReducers } from 'redux'
import { scopedAction } from '../src'

describe('scopedAction', () => {
  it('Creates an action creator with a scope', () => {
    const setValue = val => ({
      type: 'SET_VALUE',
      payload: val
    })

    const scopedSetValue = scopedAction(setValue, 'abc')

    expect(scopedSetValue('hello')).toEqual({
      type: 'SET_VALUE',
      payload: 'hello',
      meta: { scope: 'abc' }
    })
  })

  it('Maintains meta properties', () => {
    const setValue = val => ({
      type: 'SET_VALUE',
      payload: val,
      meta: { timestamp: 0 }
    })

    const scopedSetValue = scopedAction(setValue, 'abc')

    expect(scopedSetValue('hello')).toEqual({
      type: 'SET_VALUE',
      payload: 'hello',
      meta: { scope: 'abc', timestamp: 0 }
    })
  })
})
