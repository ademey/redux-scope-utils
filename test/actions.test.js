import { combineReducers } from 'redux'
import { createScopedAction } from '../src'

describe('createScopedAction', () => {
  it('Creates an action creator with a scope', () => {
    const setValue = val => ({
      type: 'SET_VALUE',
      payload: val
    })

    const scopedSetValue = createScopedAction(setValue, 'abc')

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

    const scopedSetValue = createScopedAction(setValue, 'abc')

    expect(scopedSetValue('hello')).toEqual({
      type: 'SET_VALUE',
      payload: 'hello',
      meta: { scope: 'abc', timestamp: 0 }
    })
  })
})
