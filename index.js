"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createScopedDispatch = exports.createScopedSelector = exports.createScopedReducer = exports.createScopedAction = exports.scopedConnect = exports.mapDispatchToScope = exports.mapStateToScope = exports.scopedDispatch = exports.scopedReducer = exports.scopedSelector = exports.scopedAction = exports.getStateSlice = void 0;

var _reactRedux = require("react-redux");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Utility to grab a slice of the state based on the scope
 *
 * @param {object} state - A branch of a state object
 * @param {string} scope  - A key pointing to a part of state
 * @return {object} - the slice of state
 */
var getStateSlice = function getStateSlice(state, scope) {
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


exports.getStateSlice = getStateSlice;

var scopedAction = function scopedAction(actionCreator, scope) {
  return function () {
    return _objectSpread({}, actionCreator.apply(void 0, arguments), {
      meta: _objectSpread({}, actionCreator.apply(void 0, arguments).meta, {
        scope: scope
      })
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


exports.scopedAction = scopedAction;

var scopedSelector = function scopedSelector(selector, scope) {
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


exports.scopedSelector = scopedSelector;

var scopedReducer = function scopedReducer(reducer, scope) {
  return function (state, action) {
    if (state === undefined || action.meta && action.meta.scope === scope) {
      return reducer(state, action);
    }

    return state;
  };
};
/**
 * Create a dispatch function which will apply a scope to all dispatched
 * action objects.
 * @param {function} dispatch - Original dispatch
 * @param {string} scope - State path
 * @return {function} Modified dispatch function
 */


exports.scopedReducer = scopedReducer;

var scopedDispatch = function scopedDispatch(dispatch, scope) {
  return function (action) {
    // TODO: Should this do an error or something?
    if (_typeof(action) !== 'object') {
      dispatch(action);
    }

    dispatch(scopedAction(function () {
      return action;
    }, scope)());
  };
};
/**
 * Create a `mapStateToProps` function in which the state is scoped.
 * @param {function} mapFunction - mapStateToProps
 * @param {string} scope - Path to the undoable instance
 * @return {function}
 */


exports.scopedDispatch = scopedDispatch;
var mapStateToScope = scopedSelector;
/**
 * Create a `mapDispatchToProps` function in which all actions dispatched are
 * given a scope.
 *
 * // TODO: This does not work with thunks!
 * @param {function} mapFunction - mapDispatchToProps
 * @param {string} scope - Path to the undoable instance
 * @return {function}
 */

exports.mapStateToScope = mapStateToScope;

var mapDispatchToScope = function mapDispatchToScope(mapFunction, scope) {
  return function (dispatch, props) {
    return mapFunction(scopedDispatch(dispatch, scope), props);
  };
};
/**
 * Connect a component so that it's state is relative to the undoable scope. Anything
 * dispatched will have the scope and undoableScope applied.
 * @param {string} scope - Path to the undoable instance
 * @param {string} [undoableScope] - Property name reducer was assigned to in `undoableReducers`
 * @return {function}
 */


exports.mapDispatchToScope = mapDispatchToScope;

var scopedConnect = function scopedConnect(scope) {
  return function (mstp, mdtp) {
    for (var _len = arguments.length, rest = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      rest[_key - 2] = arguments[_key];
    }

    return function (component) {
      return _reactRedux.connect.apply(void 0, [mapStateToScope(mstp, scope), mapDispatchToScope(mdtp, scope)].concat(rest))(component);
    };
  };
};

exports.scopedConnect = scopedConnect;
var createScopedAction = scopedAction;
exports.createScopedAction = createScopedAction;
var createScopedReducer = scopedReducer;
exports.createScopedReducer = createScopedReducer;
var createScopedSelector = scopedSelector;
exports.createScopedSelector = createScopedSelector;
var createScopedDispatch = scopedDispatch;
exports.createScopedDispatch = createScopedDispatch;
//# sourceMappingURL=index.js.map