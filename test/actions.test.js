import { scopedAction } from '../src';

describe('scopedAction', () => {
  it('Creates an action creator with a scope', () => {
    const setValue = val => ({
      type: 'SET_VALUE',
      payload: val
    });

    const scopedSetValue = scopedAction(setValue, 'abc');

    expect(scopedSetValue('hello')).toEqual({
      type: 'SET_VALUE',
      payload: 'hello',
      meta: { scope: 'abc' }
    });
  });

  it('Maintains meta properties', () => {
    const setValue = val => ({
      type: 'SET_VALUE',
      payload: val,
      meta: { timestamp: 0 }
    });

    const scopedSetValue = scopedAction(setValue, 'abc');

    expect(scopedSetValue('hello')).toEqual({
      type: 'SET_VALUE',
      payload: 'hello',
      meta: { scope: 'abc', timestamp: 0 }
    });
  });

  it('Ignores non standard action types', () => {
    const stringAction = 'STR';
    const scopedString = scopedAction(stringAction, 'abc');

    expect(scopedString()).toEqual(stringAction);

    const thunk = jest.fn(val => dispatch => dispatch(val * 2));

    const scopedThunk = scopedAction(thunk, 'abc');
    expect(scopedThunk()).toEqual(thunk);

    expect(scopedThunk(2)).toBeCalledWith(2);
    expect(scopedThunk(4)).toHaveLastReturnedWith(8);
  });

  it.only('Scopes valid objects', () => {
    const objAction = {
      type: 'SET_VALUE',
      payload: 'hello'
    };

    const scopedObject = scopedAction(objAction, 'abc');

    expect(scopedObject()).toEqual({
      ...objAction,
      meta: {
        scope: 'abc'
      }
    });
  });
});
