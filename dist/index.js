'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/**
 * Utility to grab a slice of the state based on the scope
 *
 * @param {object} state - A branch of a state object
 * @param {string} scope  - A key pointing to a part of state
 * @return {object} - the slice of state
 */
var getStateSlice = exports.getStateSlice = function getStateSlice(state, scope) {
  var path = scope.indexOf('/') === -1 ? [scope] : scope.split('/');
  return path.reduce(function (value, pathSegment) {
    return value[pathSegment];
  }, state);
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
var createScopedAction = exports.createScopedAction = function createScopedAction(actionCreator, scope) {
  var _actionCreator = actionCreator(),
      type = _actionCreator.type;

  return function () {
    return _extends({}, actionCreator.apply(undefined, arguments), {
      meta: _extends({}, actionCreator.apply(undefined, arguments).meta, { scope: scope })
    });
  };
};

/**
 * Create a selector with a predefined scope. This allows generic selectors
 * to be created for a specific part of state.
 * @param {function} selector - Selector which is relative to a slice of state
 * @param {string} scope - State path
 * @return {function} Scoped selector
 */
var createScopedSelector = exports.createScopedSelector = function createScopedSelector(selector, scope) {
  return function (state, props) {
    return selector(getStateSlice(state, scope), props);
  };
};

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
var createScopedReducer = exports.createScopedReducer = function createScopedReducer(reducer, scope) {
  return function (state, action) {
    if (state === undefined || action.meta && action.meta.scope && action.meta.scope.startsWith(scope)) {
      return reducer(state, action);
    }
    return state;
  };
};
//# sourceMappingURL=index.js.map