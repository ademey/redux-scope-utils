import { combineReducers } from 'redux';
import { scopedSelector } from '../src';

describe('scopedSelector', () => {
  const getDate = state => state.date;

  const getDateA = scopedSelector(getDate, 'a');
  const getDateB = scopedSelector(getDate, 'b');

  it('Creates a selector relative to scope', () => {
    const state = {
      a: { date: '2018-10-11' },
      b: { date: '2017-08-03' }
    };

    expect(getDateA(state)).toEqual('2018-10-11');
    expect(getDateB(state)).toEqual('2017-08-03');
  });
});
