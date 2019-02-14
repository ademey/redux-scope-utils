import { API_REQUEST, API_SUCCESS, API_FAILURE, API_RESET } from './apiActions';

const initialState = {
  isLoading: false,
  data: null,
  error: null
};

/**
 * Generic reducer to handle loading state and storage of data. This is designed
 * to work with the Redux API Middleware. The actions that this reducer handles
 * are created by the middleware.
 */
const apiReducer = (state = initialState, action) => {
  switch (action.type) {
    case API_REQUEST:
    case API_FAILURE:
      // A API_FAIURE action will always have an error property.
      // The API_REQUEST action may also have an error, in which case we want to
      // differentiate it from a API_REQUEST that initiates a loading state
      if (action.error) {
        return {
          ...state,
          error: action.payload,
          isLoading: false,
          data: null
        };
      }
      // This was an API_REQUEST so reset the state
      return {
        ...state,
        data: null,
        error: null,
        isLoading: true
      };
    case API_SUCCESS:
      return {
        ...state,
        isLoading: false,
        data: action.payload
      };
    case API_RESET:
      return { ...initialState };
    default:
      return state;
  }
};

export default apiReducer;
