# createScopedAction(actionCreator, scope)

Creates a new [action creator](https://redux.js.org/glossary#action-creator) which can be used with a scoped reducer.

## Arguments

1. `actionCreator` (_Function_): A [action creator](https://redux.js.org/glossary#action-creator) function to apply a scope.
2. `scope` (_String_): See _scope_ documentation

## Returns

(_Function_): A new [action creator](https://redux.js.org/glossary#action-creator) which, when called will include a `meta.scope` property.

## Example

```js
import { createScopedAction } from 'redux-scope-utils';

export const SET_VALUE = 'SET_VALUE';

const setValue = (key, value) => ({
  type: SET_VALUE,
  payload: { key, value }
});

/*
setValue('myKey', 'someValue')
{
  type: 'SET_VALUE',
  payload: {
    key: 'myKey', value: 'someValue'
  }
}
*/

const setFormValue = createScopedAction(setValue, 'myForm');

/*
setFormValue('myKey', 'someValue')
{
  type: 'SET_VALUE',
  payload: {
    key: 'myKey', value: 'someValue'
  },
  meta: { scope: 'myForm' }  // <-- meta.scope is included in every `setFormValue` action
}
*/
```
