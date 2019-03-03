'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _apiActions = require('./apiActions');

var initialState = {
  isLoading: false,
  data: null,
  error: null
};

/**
 * Generic reducer to handle loading state and storage of data. This is designed
 * to work with the Redux API Middleware. The actions that this reducer handles
 * are created by the middleware.
 */
var apiReducer = function apiReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments[1];

  switch (action.type) {
    case _apiActions.API_REQUEST:
    case _apiActions.API_FAILURE:
      // A API_FAIURE action will always have an error property.
      // The API_REQUEST action may also have an error, in which case we want to
      // differentiate it from a API_REQUEST that initiates a loading state
      if (action.error) {
        return _extends({}, state, {
          error: action.payload,
          isLoading: false,
          data: null
        });
      }
      // This was an API_REQUEST so reset the state
      return _extends({}, state, {
        data: null,
        error: null,
        isLoading: true
      });
    case _apiActions.API_SUCCESS:
      return _extends({}, state, {
        isLoading: false,
        data: action.payload
      });
    case _apiActions.API_RESET:
      return _extends({}, initialState);
    default:
      return state;
  }
};

exports.default = apiReducer;
//# sourceMappingURL=apiReducer.js.map