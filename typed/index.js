'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

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
var createScopedAction = function createScopedAction(actionCreator, scope) {
  var _actionCreator = actionCreator(),
      type = _actionCreator.type,
      rest = _objectWithoutProperties(_actionCreator, ['type']);

  return function () {
    return _extends({
      type: type + '@' + scope
    }, rest);
  };
};

/**
 * Create a selector with a predefined scope. This allows generic selectors
 * to be created for a specific part of state.
 * @param {function} selector - Selector which is relative to a slice of state
 * @param {string} scope - State path
 * @return {function} Scoped selector
 */
exports.createScopedAction = createScopedAction;
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
    var _action$type$split = action.type.split('@'),
        _action$type$split2 = _slicedToArray(_action$type$split, 2),
        actionType = _action$type$split2[0],
        actionScope = _action$type$split2[1];

    if (state === undefined || actionScope === scope) {
      return reducer(state, _extends({}, action, { type: actionType }));
    }
    return state;
  };
};
//# sourceMappingURL=index.js.map