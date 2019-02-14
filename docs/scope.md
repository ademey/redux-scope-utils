# Scope

Scope is a *string* which namespaces reducers, action creators and selectors to a specific slice of state. The `scope` should be wrote as a `/` separated path to the reducer in the state tree.

Here a reducer is being used multiple times because it has unique scopes. When an form action
is dispatched, `formReducer` will only handle it if the `scope` matches.

```js
import { combineReducers } from 'redux';
import { createScopedReducer } from 'redux-scope-utils';
import { formReducer, loadingReducer } from 'redux-scope-utils/modules';
import { authReducer } from 'store/auth'; // example non scoped reducer

const rootReducer = combineReducers({
  auth: authReducer,
  forms: combineReducers({
    orderForm: createScopedReducer(formReducer, 'forms/orderForm'),
    loginForm: createScopedReducer(formReducer, 'forms/loginForm')
  }),
  data: combineReducers({
    menu: createScopedReducer(loadingReducer, 'data/menu')
  })
});

```


## Coordination

All the functions in this library work in conjunction around the `scope`. 

### `createScopedReducer(reducer, scope)`

Uses `scope` to only allow actions to the reducer which contain a matching `scope`. ~~The manner in which the scope is matched may be customized.~~

### `createScopedAction(actionCreator, scope)`

Adds `scope` to an action so that it can pass the scoped reducer's test.

### `createScopedSelector(selector, scope)`

Uses `scope` to traverse the state tree. It is important that the `scope` follow the path notation.


