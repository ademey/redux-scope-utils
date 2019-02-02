# redux-scope-utils

[👷‍Work In Progress!]

Utilities for Redux scope patterns

Redux Scope Utils is a set of functions to promote reusability of Actions, Reducers and Selectors. The concept of a `scope` is used to control the flow of actions to reducers.

## Getting Started

To explain the concept of a `scope` we need to build an application state with multiple of the same reducers. While there are many ways to write reducers, this library assumes your state will
be constructed by using [combineReducers](https://redux.js.org/api/combinereducers) from the redux package.

Lets start with a simple reducer based off the [counter example](https://redux.js.org/introduction/getting-started#basic-example) from the Redux docs:

```js
const counter = (state = 0, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1
    case 'DECREMENT':
      return state - 1
    default:
      return state
  }
}
```

The `counter` reducer's initial state is just `0`. It can handle `INCREMENT` and `DECREMENT` actions to change the state by one. Use `combineReducers` to add 2 instances of the `counter` reducer:

### The Problem

When we dispatch an action we can see a problem with this design. Both reducers will increment since they both handle the `INCREMENT` action type.

```js
const rootReducer = combineReducers({ likes: counter, followers: counter })
// Produces an initial state:
// { likes: 0,  followers: 0 }
// ...

store.dispatch({ type: 'INCREMENT' })
// Produces a new state:
// { likes: 1, followers: 1 }
```

How would you approach this problem? Write separate `likes` and `followers` reducers, each handling their own action types (`INCREMENT_LIKES`, `INCREMENT_FOLLOWERS`, ...)?

## Scoped Reducers

The goal of this library is store logic reuse and we will use "scoped" reducers to do so. A scoped reducer will handle a generic action type like `INCREMENT`, but only if the action has the proper `scope` property.

When an action is dispatched, the store's "rootReducer" will be called with the current state and the dispatched action. The example "rootReducer" is created with `combineReducers`, which will call each child reducer with the state and the action.

The `createScopedReducer(reducer, scope)` function from this library will act as a gateway to our `counter` reducers. The `counter` reducer will only be called if a matching `scope` is included with the action.

```js
import { createStore, combineReducers } from 'redux'
import { createScopedReducer } from 'redux-scope-utils'

const rootReducer = combineReducers({
  likes: createScopedReducer(counter, 'likes'),
  followers: createScopedReducer(counter, 'followers')
})

const store = createStore(rootReducer)

store.dispatch({ type: 'INCREMENT' })
// Nothing changes
// { likes: 0, followers: 0 }

store.dispatch({ type: 'INCREMENT', meta: { scope: 'likes' } })
// likes changed!
// { likes: 1, followers: 0 }
```

## Scoped Actions

Lets refactor our counter so it has [action creators](https://redux.js.org/basics/actions#action-creators) (functions which return action objects).

```js
const INCREMENT = 'INCREMENT'
const DECREMENT = 'DECREMENT'

// Increase counter value by one
export const incCounter = () => ({ type: INCREMENT })

// Lower counter value by one
export const decCounter = () => ({ type: DECREMENT })

export const counter = (state = 0, action) => {
  switch (action.type) {
    case INCREMENT:
      return state + 1
    case DECREMENT:
      return state - 1
    default:
      return state
  }
}
```

```js
import { createScopedAction } from 'redux-scope-utils'
// Import action creators from your reusable module
import { incCounter, decCounter } from 'store/modules/counter'

// Creates a new action creator which includes the `scope` of `likes`
const upvote = createScopedAction(incCounter, 'likes')
const downvote = createScopedAction(decCounter, 'likes')

// Somewhere else... dispatch the action with included scope
import { upvote } from 'store/likes'

store.dispatch(upvote())
/* Creates an action:
 * {
 *   type: 'INCREMENT',
 *   meta: { scope: 'likes' }
 * }
 */
```

## Functions

## References

- [Flux Standard Actions](https://github.com/redux-utilities/flux-standard-action)
