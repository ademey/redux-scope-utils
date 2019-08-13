import { combineReducers } from 'redux';
import { scopedReducer } from '../src';

describe('scopedReducer', () => {
  const INC = 'inc';
  // Demo reducer which handles one action, and will increase
  // it's count each time.
  const incReducer = (state = 0, action) =>
    action.type === INC ? state + 1 : state;

  it('Scoped reducer called only when scope matches', () => {
    // Use the same reducer but only one is scoped. All actions will be
    // handled by `a`, but only actions with a scope of `b` will be
    // handled by `b`.
    const reducer = combineReducers({
      a: incReducer,
      b: scopedReducer(incReducer, 'b')
    });

    // Action has scope `x` which is only handled by `a` reducer
    let state = reducer({ a: 0, b: 0 }, { type: INC, meta: { scope: 'x' } });
    expect(state).toEqual({ a: 1, b: 0 });

    // Action will be handled by both reducers
    state = reducer(state, { type: INC, meta: { scope: 'b' } });
    expect(state).toEqual({ a: 2, b: 1 });
  });

  it('Handles actions with no meta', () => {
    const reducer = scopedReducer(incReducer, 'xyz');

    let state = reducer(1, { type: INC, meta: { scope: 'xyz' } });
    expect(state).toEqual(2);

    state = reducer(1, { type: INC, meta: { scope: undefined } });
    expect(state).toEqual(1);
  });
});
