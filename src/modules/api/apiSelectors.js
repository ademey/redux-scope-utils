/**
 * Get if data is loading
 * @param {object} state - Scoped state slice
 * @return {boolean}
 */
export const getLoading = state => state.isLoading;

/**
 * Get data that was stored with `setData`
 * @param {object} state - Scoped state slice
 * @return {any}
 */
export const getData = state => state.data;

/**
 * Get any error data if there was a problem with the request.
 * @param {object} state - Scoped state slice
 * @return {object}
 */
export const getError = state => state.error;
