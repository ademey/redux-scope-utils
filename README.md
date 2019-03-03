# redux-scope-utils

**Utilities for Redux Scope Patterns**

👷‍Docs Work In Progress!

✅ TODOS:

- Proof all doc code
- Proof use of _italics_ and `code`
- Unit test `modules`
- Document `modules`
- Document alternate patterns

Redux Scope Utils is a set of functions to promote reusability of _actions_, _reducers_ and _selectors_ in a `redux` application. They can be wrote in a generic manner, yet used across an application, applying only to a specific part of the state tree, the [`scope`](docs/scope.md).

### [`createScopedReducer(reducer, scope)`](docs/createScopedReducer.md)

Only actions with a matching `scope` will be passed to the reducer.

### [`createScopedAction(actionCreator, scope)`](docs/createScopedAction.md)

Adds `scope` to an action so that it can pass the scoped reducer's test.

### [`createScopedSelector(selector, scope)`](docs/createScopedSelector.md)

Uses `scope` to traverse the state tree. The `selector` should be relative to a the reducer.

## In Depth

While there are many ways to write reducers, this library assumes your state will
be constructed by using [combineReducers](https://redux.js.org/api/combinereducers) from the redux package. The `combineReducers` function can be used to create deeply nested application states (_objects_ containing _objects_). At the end of this tree will be a final reducer, and it's path is the `scope`.

```js
/* The `/` separated path to the reducer is the `scope`
{
  menu: {
    order: createScopedReducer(menuReducer, 'menu/order/')
  }
}
```

To explain the concept of a [`scope`](docs/scope.md) we need to build an application state with multiple of the same reducers. Lets start with a simple reducer based off the [counter example](https://redux.js.org/introduction/getting-started#basic-example) from the Redux docs:

```js
const counterReducer = (state = 0, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1;
    case 'DECREMENT':
      return state - 1;
    default:
      return state;
  }
};
```

The `counterReducer`'s initial state is just `0`. It can handle `INCREMENT` and `DECREMENT` actions to change the state by one.

### The Problem

The next example will use `combineReducers` to add 2 instances of the `counterReducer` reducer. When we dispatch an action we can see a problem with this design. Both reducers will increment since they both handle the `INCREMENT` action type.

```js
const rootReducer = combineReducers({
  likes: counterReducer,
  followers: counterReducer
});
// Produces an initial state:
// { likes: 0,  followers: 0 }
// ...

store.dispatch({ type: 'INCREMENT' });
// Produces a new state:
// { likes: 1, followers: 1 }
```

How would you approach this problem? Write separate `likes` and `followers` reducers, each handling their own action types (`INCREMENT_LIKES`, `INCREMENT_FOLLOWERS`, ...)?

## Scoped Reducers

The goal of this library is redux logic reuse and we will use "scoped" reducers to do so. A scoped reducer will handle a generic action type like `INCREMENT`, but only if the action has the proper `scope` property.

When an action is dispatched, the store's `rootReducer` will be called with the current state and the dispatched action. The example `rootReducer` is created with `combineReducers`, which will call each child reducer with the state and the action.

The `createScopedReducer(reducer, scope)` function from this library will act as a gateway to our `counterReducer`. The reducer will only be called if a matching `scope` is included with the action.

```js
import { createStore, combineReducers } from 'redux';
import { createScopedReducer } from 'redux-scope-utils';

const rootReducer = combineReducers({
  likes: createScopedReducer(counterReducer, 'likes'),
  followers: createScopedReducer(counterReducer, 'followers')
});

const store = createStore(rootReducer);

store.dispatch({ type: 'INCREMENT' });
// Nothing changes
// { likes: 0, followers: 0 }

store.dispatch({ type: 'INCREMENT', meta: { scope: 'likes' } });
// likes changed!
// { likes: 1, followers: 0 }
```

## Scoped Actions

A scoped action is a redux action, which contains info related to it's "scope"

Lets refactor our counter so it has [action creators](https://redux.js.org/basics/actions#action-creators) (functions which return action objects).

```js
const INCREMENT = 'INCREMENT';
const DECREMENT = 'DECREMENT';

// Increase counter value by one
export const incCounter = () => ({ type: INCREMENT });

// Lower counter value by one
export const decCounter = () => ({ type: DECREMENT });

export const counterReducer = (state = 0, action) => {
  switch (action.type) {
    case INCREMENT:
      return state + 1;
    case DECREMENT:
      return state - 1;
    default:
      return state;
  }
};
```

Then for each scoped reducer, you can create matching scoped actions creators. When they are called, they will contain the `scope` information.

```js
import { createScopedAction } from 'redux-scope-utils';
// Import action creators from your reusable module
import { incCounter, decCounter } from 'example/counter';

// Creates a new action creator which includes the `scope` of `likes`
const upvote = createScopedAction(incCounter, 'likes');
const downvote = createScopedAction(decCounter, 'likes');

// Somewhere else... dispatch the action with included scope
import { upvote } from 'store/likes';

store.dispatch(upvote());
/* Creates an action:
 * {
 *   type: 'INCREMENT',
 *   meta: { scope: 'likes' }
 * }
 */
```

## Scoped Selectors


The final part of this is retrieving data from state. To get data from our scoped reducer, we will use a scoped selector. A selector is a function which takes `state` and returns a subset of the state or derives a new value.

The `counterReducer` is so simple it barely needs a selector. It's state is simply a number.

```js
// The selector for `counterReducer` is relative to the reducer
const getCount = state => state;

//...

const exampleState = {
  likes: 1,
  followers: 2
};

const getLikes = createScopedSelector(getCount, 'likes');
const getFollowers = createScopedSelector(getCount, 'followers');
```

Selectors can be used to 

See [createScopedSelector](docs/createScopedSelector.md) documentation for more examples.

## Why `meta`?

An [action](https://redux.js.org/basics/actions) in Redux is not a strictly conformed object. The only requirement is that it contains a `type` property. This library follows the pattern specified for [Flux Standard Actions](https://github.com/redux-utilities/flux-standard-action). It specifies that an action must contain a `type` property, and optionally a `payload`, `error` or `meta` property.

The `Flux Standard Actions` [documentation describes `meta`](https://github.com/redux-utilities/flux-standard-action#meta) as:

> The optional `meta` property MAY be any type of value. It is intended for any extra information that is not part of the payload.

In our case the "extra information" is our `scope`!


## References

- [Flux Standard Actions](https://github.com/redux-utilities/flux-standard-action)
