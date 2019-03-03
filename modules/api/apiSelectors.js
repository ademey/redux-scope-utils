"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Get if data is loading
 * @param {object} state - Scoped state slice
 * @return {boolean}
 */
var getLoading = exports.getLoading = function getLoading(state) {
  return state.isLoading;
};

/**
 * Get data that was stored with `setData`
 * @param {object} state - Scoped state slice
 * @return {any}
 */
var getData = exports.getData = function getData(state) {
  return state.data;
};

/**
 * Get any error data if there was a problem with the request.
 * @param {object} state - Scoped state slice
 * @return {object}
 */
var getError = exports.getError = function getError(state) {
  return state.error;
};
//# sourceMappingURL=apiSelectors.js.map