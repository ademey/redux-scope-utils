
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
export const createScopedAction = (actionCreator, scope) => {
  const { type, ...rest } = actionCreator();
  return (...args) => ({
    type: `${type}@${scope}`,
    ...rest
  });
};

/**
 * Create a selector with a predefined scope. This allows generic selectors
 * to be created for a specific part of state.
 * @param {function} selector - Selector which is relative to a slice of state
 * @param {string} scope - State path
 * @return {function} Scoped selector
 */
export const createScopedSelector = (selector, scope) => (state, props) =>
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
export const createScopedReducer = (reducer, scope) => (state, action) => {
  const [actionType, actionScope] = action.type.split('@')
  if (state === undefined || actionScope === scope) {
    return reducer(state, { ...action, type: actionType} );
  }
  return state;
};
