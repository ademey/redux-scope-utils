import { combineReducers } from 'redux'
import { createScopedAction } from './'

describe('createScopedAction', () => {
  const setValue = (val, scope) => ({
    type: 'SET_VALUE',
    payload: val,
    meta: { scope }
  })

  const scopedSetValue = createScopedAction(setValue, 'abc')

  it('Creates an action creator with a scope', () => {
    expect(scopedSetValue('hello')).toEqual({
      type: 'SET_VALUE',
      payload: 'hello',
      meta: { scope: 'abc' }
    })
  })
})
