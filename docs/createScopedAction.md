# createScopedAction(actionCreator, scope)

Creates a new [action creator](https://redux.js.org/glossary#action-creator) which can be used with a scoped reducer. 

~~It adds  `scope` in it's `meta` property, which the scoped reducer looks for. ~~

## Arguments

1. `actionCreator` (*Function*): A [action creator](https://redux.js.org/glossary#action-creator) function to apply a scope.
2. `scope` (*String*): See *scope* documentation


## Returns

(*Function*): A new [action creator](https://redux.js.org/glossary#action-creator) which, when called will include a `meta.scope` property.

## Example

```js
import { createScopedAction } from 'redux-scope-utils'

export const SET_VALUE = 'SET_VALUE'

const setValue = (key, value) => ({
  type: SET_VALUE,
  payload: { key, value }
})

/*
setValue('myKey', 'someValue')
{
  type: 'SET_VALUE',
  payload: {
    key: 'myKey', value: 'someValue'
  }
}
*/

const setFormValue = createScopedAction(setValue, 'myForm')

/*
setFormValue('myKey', 'someValue')
{
  type: 'SET_VALUE',
  payload: {
    key: 'myKey', value: 'someValue'
  },
  meta: { scope: 'myForm' }  
}
*/


```
