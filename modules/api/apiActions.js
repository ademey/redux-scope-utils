'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var API_REQUEST = exports.API_REQUEST = 'API_REQUEST';
var API_SUCCESS = exports.API_SUCCESS = 'API_SUCCESS';
var API_FAILURE = exports.API_FAILURE = 'API_FAILURE';
var API_RESET = exports.API_RESET = 'API_RESET';

/**
 * Resets the loading reducer to its initial state
 * @return {Action}
 */
var resetData = exports.resetData = function resetData() {
  return { type: API_RESET };
};
//# sourceMappingURL=apiActions.js.map