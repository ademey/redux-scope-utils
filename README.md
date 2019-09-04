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

### [`scopedReducer(reducer, scope)`](docs/createScopedReducer.md)

Only actions with a matching `scope` will be passed to the reducer.

### [`scopedAction(actionCreator, scope)`](docs/createScopedAction.md)

Adds `scope` to an action so that it can pass the scoped reducer's test.

### [`scopedSelector(selector, scope)`](docs/createScopedSelector.md)

Uses `scope` to traverse the state tree. The `selector` should be relative to a the reducer.

## In Depth

While there are many ways to write reducers, this library assumes your state will
be constructed by using [combineReducers](https://redux.js.org/api/combinereducers) from the redux package. The `combineReducers` function can be used to create deeply nested application states (_objects_ containing _objects_). At the end of this tree will be a final reducer, and it's path is the `scope`.

```js
/* The `/` separated path to the reducer is the `scope`
{
  menu: {
    order: scopedReducer(menuReducer, 'menu/order/')
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

The `scopedReducer(reducer, scope)` function from this library will act as a gateway to our `counterReducer`. The reducer will only be called if a matching `scope` is included with the action.

```js
import { createStore, combineReducers } from 'redux';
import { createScopedReducer } from 'redux-scope-utils';

const rootReducer = combineReducers({
  likes: scopedReducer(counterReducer, 'likes'),
  followers: scopedReducer(counterReducer, 'followers')
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
import { scopedAction } from 'redux-scope-utils';
// Import action creators from your reusable module
import { incCounter, decCounter } from 'example/counter';

// Creates a new action creator which includes the `scope` of `likes`
const upvote = scopedAction(incCounter, 'likes');
const downvote = scopedAction(decCounter, 'likes');

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

<<<<<<< Updated upstream

The final part of this is retrieving data from state. To get data from our scoped reducer, we will use a scoped selector. A selector is a function which takes `state` and returns a subset of the state or derives a new value.

The `counterReducer` is so simple it barely needs a selector. It's state is simply a number,.

```js
const getCount = state => state;
// ...
const getLikes = scopedSelector(getCount, 'likes');
const getFollowers = scopedSelector(getCount, 'followers');
```

A reducer with more complex shape will have more complex selectors. For example a 
reducer for a shopping cart may maintain a list of items in the cart and if it has been submitted.

The selectors for a scoped reducer should be relative to their reducer. The
`scope` will be used to traverse the state tree to the reducers node and apply
the selector from there. 

```js
// Example "cartReducer" state
// {
//   submitted: false,
//   items: [
//     { name: 'Milk', price: 315 },
//     { name: 'Cookies', price: 225 }
//   ]
// }

const getCartSubmitted = state => state.submitted;
const getCartItems = state => state.items;
const getCartTotal = state => getCartItems(state).reduce(
  (acc, curr) => acc + curr.price,
  0
)
```



See [scopedSelector](docs/scopedSelector.md) documentation for more examples.

## Why `meta`?

An [action](https://redux.js.org/basics/actions) in Redux is not a strictly conformed object. The only requirement is that it contains a `type` property. This library follows the pattern specified for [Flux Standard Actions](https://github.com/redux-utilities/flux-standard-action). It specifies that an action must contain a `type` property, and optionally a `payload`, `error` or `meta` property.

The `Flux Standard Actions` [documentation describes `meta`](https://github.com/redux-utilities/flux-standard-action#meta) as:

> The optional `meta` property MAY be any type of value. It is intended for any extra information that is not part of the payload.

In our case the "extra information" is our `scope`!
=======
The final part of this is retrieving data from state. To get data from our scoped reducer, we will
use a scoped selector.
>>>>>>> Stashed changes


## References

- [Flux Standard Actions](https://github.com/redux-utilities/flux-standard-action)