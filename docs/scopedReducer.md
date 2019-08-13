# scopedReducer(reducer, scope)

A helper to manage scoped actions. This utility acts as a gatekeeper. The reducer will only be invoked if the scope matches or when the reducer is initialized with an _undefined_ state. The second case allows the initialState to be applied.

## Arguments

1. `reducer` (_Function_): A [reducer](https://redux.js.org/basics/reducers#reducers) function to augment
2. `scope` (_String_): See _scope_ documentation

## Returns

(_Function_): A new [reducer](https://redux.js.org/basics/reducers#reducers) which will only be called if the action has a `meta.scope` property which matches the `scope`.

## Example

This partial example of a reducer can be used to store any data. It accepts `SET_VALUE` actions which contain key/value pairs and applies them to an object.

```js
import { SET_VALUE } from './valueActions';

const valueReducer = (state = {}, action) => {
  switch (action.type) {
    case SET_VALUE:
      const { key, value } = action.payload;
      return {
        ...state,
        [key]: value
      };
    /* ...other cases */

    default:
      return state;
  }
};

export default valueReducer;
```

The `valueReducer` can be used many times by scoping it.

```js
import { combineReducers } from 'redux';
import { scopedReducer } from 'redux-scope-utils';
import { valueReducer } from 'modules/value';

const rootReducer = combineReducers({
  orderForm: scopedReducer(valueReducer, 'orderForm'),
  loginForm: scopedReducer(valueReducer, 'loginForm')
});
```
