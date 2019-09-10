import { connect } from 'react-redux';

/**
 * Utility to grab a slice of the state based on the scope
 *
 * @param {object} state - A branch of a state object
 * @param {string} scope  - A key pointing to a part of state
 * @return {object} - the slice of state
 */
export const getStateSlice = (state, scope) => {
  const path = scope.indexOf('/') === -1 ? [scope] : scope.split('/');
  return path.reduce((value, pathSegment) => value[pathSegment], state);
};

/**
 * Creates an action creator with predefined scope. This allows generic
 * action creators to be created for a specific part of state.
 *
 * @param {function} actionCreator - Function which creates an action. The `scope` must
 *                                  be the last param.
 * @param {string} scope - State path
 * @return {function} Scoped action creator
 */
export const scopedAction = (actionCreator, scope) => (...args) => ({
  ...actionCreator(...args),
  meta: { ...actionCreator(...args).meta, scope }
});

/**
 * Create a selector with a predefined scope. This allows generic selectors
 * to be created for a specific part of state.
 * @param {function} selector - Selector which is relative to a slice of state
 * @param {string} scope - State path
 * @return {function} Scoped selector
 */
export const scopedSelector = (selector, scope) => (state, props) =>
  selector(getStateSlice(state, scope), props);

/**
 * A helper to manage scoped actions. This utility acts as a gatekeeper.
 * The reducer will only be invoked if the scope matches or when the reducer
 * is initialized with an undefined state. The second case allows the
 * initialState to be applied.
 *
 * @param {function} reducer - Reducer function to scope
 * @param {string} scope - State path
 * @return {function}
 */
export const scopedReducer = (reducer, scope) => (state, action) => {
  if (state === undefined || (action.meta && action.meta.scope === scope)) {
    return reducer(state, action);
  }
  return state;
};

/**
 * Create a dispatch function which will apply a scope to all dispatched
 * action objects.
 * @param {function} dispatch - Original dispatch
 * @param {string} scope - State path
 * @return {function} Modified dispatch function
 */
export const scopedDispatch = (dispatch, scope) => action => {
  // TODO: Should this do an error or something?
  if (typeof action !== 'object') {
    dispatch(action);
  }

  dispatch(scopedAction(() => action, scope)());
};

/**
 * Create a `mapStateToProps` function in which the state is scoped.
 * @param {function} mapFunction - mapStateToProps
 * @param {string} scope - Path to the undoable instance
 * @return {function}
 */
export const mapStateToScope = scopedSelector;

/**
 * Create a `mapDispatchToProps` function in which all actions dispatched are
 * given a scope.
 *
 * // TODO: This does not work with thunks!
 * @param {function} mapFunction - mapDispatchToProps
 * @param {string} scope - Path to the undoable instance
 * @return {function}
 */
export const mapDispatchToScope = (mapFunction, scope) => (dispatch, props) =>
  mapFunction(scopedDispatch(dispatch, scope), props);

/**
 * Connect a component so that it's state is relative to the undoable scope. Anything
 * dispatched will have the scope and undoableScope applied.
 * @param {string} scope - Path to the undoable instance
 * @param {string} [undoableScope] - Property name reducer was assigned to in `undoableReducers`
 * @return {function}
 */
export const scopedConnect = scope => (mstp, mdtp, ...rest) => component =>
  connect(
    mapStateToScope(mstp, scope),
    mapDispatchToScope(mdtp, scope),
    ...rest
  )(component);

export const createScopedAction = scopedAction;
export const createScopedReducer = scopedReducer;
export const createScopedSelector = scopedSelector;
export const createScopedDispatch = scopedDispatch;
