import { mapStateToScope, mapDispatchToScope } from '../src';

describe('mapStateToScope', () => {
  const state = {
    filters: {
      count: 5
    }
  };

  it('Maps state to scope', () => {
    const getValue = s => s;
    const mapStateToProps = s => ({
      myCount: getValue(s)
    });
    const mapToCount = mapStateToScope(mapStateToProps, 'filters');

    expect(mapToCount(state)).toEqual({
      myCount: 5
    });
  });

  it('Maps objects to scope', () => {
    const getValue = s => s;
    const mapStateToProps = {
      myCount: getValue
    };
    const mapToCount = mapStateToScope(mapStateToProps, 'filters');

    expect(mapToCount(state)).toEqual({
      myCount: 5
    });
  });
});

describe('mapDispatchToScope', () => {
  it('Dispatches with meta values', () => {
    const setValue = val => ({
      type: 'SET_VALUE',
      payload: val
    });
    const mapDispatchToProps = dispatch => ({
      onTest: val => dispatch(setValue(val))
    });
    const dispatchToCount = mapDispatchToScope(mapDispatchToProps, 'filters');
    const dispatchMock = jest.fn();
    dispatchToCount(dispatchMock).onTest('hello');
    expect(dispatchMock).toBeCalledWith({
      type: 'SET_VALUE',
      payload: 'hello',
      meta: {
        scope: 'filters'
      }
    });
  });
});
