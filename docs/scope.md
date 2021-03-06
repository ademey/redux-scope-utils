# Scope

Scope is a *string* which namespaces reducers, action creators and selectors to a specific slice of state. The `scope` should be wrote as a `/` separated path to the reducer in the state tree.

Here a reducer is being used multiple times because it has unique scopes. When an form action
is dispatched, `formReducer` will only handle it if the `scope` matches.

```js
import { combineReducers } from 'redux';
import { scopedReducer } from 'redux-scope-utils';
import { formReducer } from 'redux-scope-utils/modules';
import { authReducer } from 'store/auth'; // example non scoped reducer

const rootReducer = combineReducers({
  auth: authReducer,
  forms: combineReducers({
    orderForm: scopedReducer(formReducer, 'forms/orderForm'),
    loginForm: scopedReducer(formReducer, 'forms/loginForm')
  }),
  data: combineReducers({
    one: combineReducers({
      two: scopedReducer(exampleReducer, 'data/one/two')
    })
  })
});

```
