export const API_REQUEST = 'API_REQUEST';
export const API_SUCCESS = 'API_SUCCESS';
export const API_FAILURE = 'API_FAILURE';
export const API_RESET = 'API_RESET';


/**
 * Resets the loading reducer to its initial state
 * @return {Action}
 */
export const resetData = () => ({ type: API_RESET });


