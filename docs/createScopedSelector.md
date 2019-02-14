# createScopedSelector(selector, scope)

Creates a new [selector](https://github.com/reduxjs/reselect#motivation-for-memoized-selectors) function which is specific to the `scope` part of state.

## Arguments

1. `selector` (*Function*): A function to retrieve a part of state, relative to it's reducer.
2. `scope` (*String*): Path to the reducer. See *scope* documentation


## Returns

(*Function*): A new selector which ???

## Example

This example will create a `modalReducer` which can track if a modal is open, and any data that it may contain.

TODO: semis

```js
// modalReduer.js

const initialState = {
  open: false,
  data: {}
}

const modalReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_OPEN:
      return {
        ...state,
        open: action.payload
      };
    case SET_DATA: {
      const { key, value } = action.payload;
      return {
        ...state,
        data: {
          ...state.data,
          [key]: value
        }
      };
    }
    case RESET_DATA: {
      return {
        ...state,
        data: {}
      };
    }
    default:
      return state;
  }
};

export default modalReducer

```

Corresponding selectors for this `modalReducer` will be relative to the reducer's shape.

```js
// modalSelectors.js

const getModalOpen = state => state.open;
const getModalData = state => state.data;
```

```js
import { createScopedSelector } from 'redux-scope-utils'
import { getModalOpen, getModalData } from 'modules/modal'


const exampleState = {
  loginModal: {
    open: false,
    data: {
      email: 'my@email.com',
      password: null
    }
  },
  promoModal: {
    open: true,
    data: {}
  }
}

// loginModal specific
const getLoginModalOpen = createScopedSelector(getModalOpen, 'loginModal')
const getLoginModalData = createScopedSelector(getModalData, 'loginModal')

/*
  getLoginModalOpen(exampleState) // false
  getLoginModalData(exampleState) // { email: 'my@email.com', password: null }
*/


```