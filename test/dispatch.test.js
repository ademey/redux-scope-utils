import { scopedDispatch, scopedAction } from '../src';

describe('scopedDispatch', () => {
  it('Adds scope to an action', () => {
    const setValue = val => ({
      type: 'SET_VALUE',
      payload: val
    });

    const scopedValue = scopedAction(setValue, 'abc');

    const dispatch = jest.fn();
    const abcDispatch = scopedDispatch(dispatch, 'abc');

    abcDispatch(setValue('xyz'));

    expect(dispatch).toBeCalledWith(scopedValue('xyz'));
  });
});
