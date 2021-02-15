/*eslint-disable react/prop-types*/

import React, { Component } from 'react';
import { createStore } from 'redux';
import { Provider as ProviderMock, connect } from 'react-redux';
import { scopedConnect } from '../src';
import * as rtl from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

describe('React', () => {
  describe('connect', () => {
    const propMapper = prop => {
      switch (typeof prop) {
        case 'object':
        case 'boolean':
          return JSON.stringify(prop);
        case 'function':
          return '[function ' + prop.name + ']';
        default:
          return prop;
      }
    };
    class Passthrough extends Component {
      render() {
        return (
          <ul>
            {Object.keys(this.props).map(prop => (
              <li title="prop" data-testid={prop} key={prop}>
                {propMapper(this.props[prop])}
              </li>
            ))}
          </ul>
        );
      }
    }

    class ContextBoundStore {
      constructor(reducer) {
        this.reducer = reducer;
        this.listeners = [];
        this.state = undefined;
        this.dispatch({});
      }

      getState() {
        return this.state;
      }

      subscribe(listener) {
        this.listeners.push(listener);
        return () => this.listeners.filter(l => l !== listener);
      }

      dispatch(action) {
        this.state = this.reducer(this.getState(), action);
        this.listeners.forEach(l => l());
        return action;
      }
    }

    function stringBuilder(prev = '', action) {
      return action.type === 'APPEND' ? prev + action.body : prev;
    }

    afterEach(() => rtl.cleanup());

    describe('Core subscription and prop passing behavior', () => {
      it('should receive the store state in the context', () => {
        const store = createStore(() => ({
          en: { greet: 'Hello' },
          fr: { greet: 'Salut' }
        }));

        @(scopedConnect('en')(state => state))
        class Container extends Component {
          render() {
            return <Passthrough {...this.props} />;
          }
        }

        const tester = rtl.render(
          <ProviderMock store={store}>
            <Container pass="through" />
          </ProviderMock>
        );

        expect(tester.getByTestId('greet')).toHaveTextContent('Hello');
      });

      it('should pass state and props to the given component', () => {
        const store = createStore(() => ({
          scoped: {
            foo: 'bar',
            baz: 42,
            hello: 'world'
          }
        }));

        @(scopedConnect('scoped')(({ foo, baz }) => ({ foo, baz }), {}))
        class Container extends Component {
          render() {
            return <Passthrough {...this.props} />;
          }
        }

        const tester = rtl.render(
          <ProviderMock store={store}>
            <Container pass="through" baz={50} />
          </ProviderMock>
        );

        expect(tester.getByTestId('pass')).toHaveTextContent('through');
        expect(tester.getByTestId('foo')).toHaveTextContent('bar');
        expect(tester.getByTestId('baz')).toHaveTextContent('42');
        expect(tester.queryByTestId('hello')).toBe(null);
      });

      it('should throw an error if the store is not in the props or context', () => {
        const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

        class Container extends Component {
          render() {
            return <Passthrough />;
          }
        }

        const decorator = connect(() => {});
        const Decorated = decorator(Container);

        expect(() => rtl.render(<Decorated />)).toThrow(
          /Could not find "store"/
        );

        spy.mockRestore();
      });
    });

    describe('Prop merging', () => {
      it('should handle additional prop changes in addition to slice', () => {
        const store = createStore(() => ({
          foo: 'bar'
        }));

        @connect(state => state)
        class ConnectContainer extends Component {
          render() {
            return <Passthrough {...this.props} pass={this.props.bar.baz} />;
          }
        }

        class Container extends Component {
          constructor() {
            super();
            this.state = {
              bar: {
                baz: ''
              }
            };
          }

          componentDidMount() {
            this.setState({
              bar: Object.assign({}, this.state.bar, { baz: 'through' })
            });
          }

          render() {
            return (
              <ProviderMock store={store}>
                <ConnectContainer bar={this.state.bar} />
              </ProviderMock>
            );
          }
        }

        const tester = rtl.render(<Container />);

        expect(tester.getByTestId('foo')).toHaveTextContent('bar');
        expect(tester.getByTestId('pass')).toHaveTextContent('through');
      });

      it('should handle unexpected prop changes with forceUpdate()', () => {
        const store = createStore(() => ({}));

        @connect(state => state)
        class ConnectContainer extends Component {
          render() {
            return <Passthrough {...this.props} pass={this.props.bar} />;
          }
        }

        class Container extends Component {
          constructor() {
            super();
            this.bar = 'baz';
          }

          componentDidMount() {
            this.bar = 'foo';
            this.forceUpdate();
          }

          render() {
            return (
              <ProviderMock store={store}>
                <ConnectContainer bar={this.bar} />
              </ProviderMock>
            );
          }
        }

        const tester = rtl.render(<Container />);

        expect(tester.getByTestId('bar')).toHaveTextContent('foo');
      });

      it('should remove undefined props', () => {
        const store = createStore(() => ({}));
        let props = { x: true };
        let container;

        @connect(
          () => ({}),
          () => ({})
        )
        class ConnectContainer extends Component {
          render() {
            return <Passthrough {...this.props} />;
          }
        }

        class HolderContainer extends Component {
          render() {
            return <ConnectContainer {...props} />;
          }
        }

        const tester = rtl.render(
          <ProviderMock store={store}>
            <HolderContainer ref={instance => (container = instance)} />
          </ProviderMock>
        );

        expect(tester.getByTestId('x')).toHaveTextContent('true');

        props = {};
        container.forceUpdate();

        expect(tester.queryByTestId('x')).toBe(null);
      });

      it('should remove undefined props without mapDispatch', () => {
        const store = createStore(() => ({}));
        let props = { x: true };
        let container;

        @connect(() => ({}))
        class ConnectContainer extends Component {
          render() {
            return <Passthrough {...this.props} />;
          }
        }

        class HolderContainer extends Component {
          render() {
            return <ConnectContainer {...props} />;
          }
        }

        const tester = rtl.render(
          <ProviderMock store={store}>
            <HolderContainer ref={instance => (container = instance)} />
          </ProviderMock>
        );

        expect(tester.getAllByTitle('prop').length).toBe(2);
        expect(tester.getByTestId('dispatch')).toHaveTextContent(
          '[function dispatch]'
        );
        expect(tester.getByTestId('x')).toHaveTextContent('true');

        props = {};
        container.forceUpdate();

        expect(tester.getAllByTitle('prop').length).toBe(1);
        expect(tester.getByTestId('dispatch')).toHaveTextContent(
          '[function dispatch]'
        );
      });

      it('should ignore deep mutations in props', () => {
        const store = createStore(() => ({
          foo: 'bar'
        }));

        @connect(state => state)
        class ConnectContainer extends Component {
          render() {
            return <Passthrough {...this.props} pass={this.props.bar.baz} />;
          }
        }

        class Container extends Component {
          constructor() {
            super();
            this.state = {
              bar: {
                baz: ''
              }
            };
          }

          componentDidMount() {
            // Simulate deep object mutation
            const bar = this.state.bar;
            bar.baz = 'through';
            this.setState({
              bar
            });
          }

          render() {
            return (
              <ProviderMock store={store}>
                <ConnectContainer bar={this.state.bar} />
              </ProviderMock>
            );
          }
        }

        const tester = rtl.render(<Container />);
        expect(tester.getByTestId('foo')).toHaveTextContent('bar');
        expect(tester.getByTestId('pass')).toHaveTextContent('');
      });

      it('should allow for merge to incorporate state and prop changes', () => {
        const store = createStore(stringBuilder);

        function doSomething(thing) {
          return {
            type: 'APPEND',
            body: thing
          };
        }

        let merged;
        let externalSetState;
        @connect(
          state => ({ stateThing: state }),
          dispatch => ({
            doSomething: whatever => dispatch(doSomething(whatever))
          }),
          (stateProps, actionProps, parentProps) => ({
            ...stateProps,
            ...actionProps,
            mergedDoSomething: (() => {
              merged = function mergedDoSomething(thing) {
                const seed = stateProps.stateThing === '' ? 'HELLO ' : '';
                actionProps.doSomething(seed + thing + parentProps.extra);
              };
              return merged;
            })()
          })
        )
        class Container extends Component {
          render() {
            return <Passthrough {...this.props} />;
          }
        }

        class OuterContainer extends Component {
          constructor() {
            super();
            this.state = { extra: 'z' };
            externalSetState = this.setState.bind(this);
          }

          render() {
            return (
              <ProviderMock store={store}>
                <Container extra={this.state.extra} />
              </ProviderMock>
            );
          }
        }

        const tester = rtl.render(<OuterContainer />);

        expect(tester.getByTestId('stateThing')).toHaveTextContent('');
        rtl.act(() => {
          merged('a');
        });

        expect(tester.getByTestId('stateThing')).toHaveTextContent('HELLO az');
        rtl.act(() => {
          merged('b');
        });

        expect(tester.getByTestId('stateThing')).toHaveTextContent(
          'HELLO azbz'
        );
        rtl.act(() => {
          externalSetState({ extra: 'Z' });
        });

        rtl.act(() => {
          merged('c');
        });

        expect(tester.getByTestId('stateThing')).toHaveTextContent(
          'HELLO azbzcZ'
        );
      });

      it('should merge actionProps into WrappedComponent', () => {
        const store = createStore(() => ({
          foo: 'bar'
        }));

        const exampleActionCreator = () => {};

        @connect(
          state => state,
          () => ({ exampleActionCreator })
        )
        class Container extends Component {
          render() {
            return <Passthrough {...this.props} />;
          }
        }

        const tester = rtl.render(
          <ProviderMock store={store}>
            <Container pass="through" />
          </ProviderMock>
        );

        expect(tester.getByTestId('exampleActionCreator')).toHaveTextContent(
          '[function exampleActionCreator]'
        );
        expect(tester.getByTestId('foo')).toHaveTextContent('bar');
      });

      it('should throw an error if mapState, mapDispatch, or mergeProps returns anything but a plain object', () => {
        const store = createStore(() => ({}));

        function makeContainer(mapState, mapDispatch, mergeProps) {
          @connect(
            mapState,
            mapDispatch,
            mergeProps
          )
          class Container extends Component {
            render() {
              return <Passthrough />;
            }
          }
          return React.createElement(Container);
        }

        function AwesomeMap() {}

        let spy = jest.spyOn(console, 'error').mockImplementation(() => {});
        rtl.render(
          <ProviderMock store={store}>
            {makeContainer(() => 1, () => ({}), () => ({}))}
          </ProviderMock>
        );
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy.mock.calls[0][0]).toMatch(
          /mapStateToProps\(\) in Connect\(Container\) must return a plain object/
        );
        spy.mockRestore();
        rtl.cleanup();

        spy = jest.spyOn(console, 'error').mockImplementation(() => {});
        rtl.render(
          <ProviderMock store={store}>
            {makeContainer(() => 'hey', () => ({}), () => ({}))}
          </ProviderMock>
        );
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy.mock.calls[0][0]).toMatch(
          /mapStateToProps\(\) in Connect\(Container\) must return a plain object/
        );
        spy.mockRestore();
        rtl.cleanup();

        spy = jest.spyOn(console, 'error').mockImplementation(() => {});
        rtl.render(
          <ProviderMock store={store}>
            {makeContainer(() => new AwesomeMap(), () => ({}), () => ({}))}
          </ProviderMock>
        );
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy.mock.calls[0][0]).toMatch(
          /mapStateToProps\(\) in Connect\(Container\) must return a plain object/
        );
        spy.mockRestore();
        rtl.cleanup();

        spy = jest.spyOn(console, 'error').mockImplementation(() => {});
        rtl.render(
          <ProviderMock store={store}>
            {makeContainer(() => ({}), () => 1, () => ({}))}
          </ProviderMock>
        );
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy.mock.calls[0][0]).toMatch(
          /mapDispatchToProps\(\) in Connect\(Container\) must return a plain object/
        );
        spy.mockRestore();
        rtl.cleanup();

        spy = jest.spyOn(console, 'error').mockImplementation(() => {});
        rtl.render(
          <ProviderMock store={store}>
            {makeContainer(() => ({}), () => 'hey', () => ({}))}
          </ProviderMock>
        );
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy.mock.calls[0][0]).toMatch(
          /mapDispatchToProps\(\) in Connect\(Container\) must return a plain object/
        );
        spy.mockRestore();
        rtl.cleanup();

        spy = jest.spyOn(console, 'error').mockImplementation(() => {});
        rtl.render(
          <ProviderMock store={store}>
            {makeContainer(() => ({}), () => new AwesomeMap(), () => ({}))}
          </ProviderMock>
        );
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy.mock.calls[0][0]).toMatch(
          /mapDispatchToProps\(\) in Connect\(Container\) must return a plain object/
        );
        spy.mockRestore();
        rtl.cleanup();

        spy = jest.spyOn(console, 'error').mockImplementation(() => {});
        rtl.render(
          <ProviderMock store={store}>
            {makeContainer(() => ({}), () => ({}), () => 1)}
          </ProviderMock>
        );
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy.mock.calls[0][0]).toMatch(
          /mergeProps\(\) in Connect\(Container\) must return a plain object/
        );
        spy.mockRestore();
        rtl.cleanup();

        spy = jest.spyOn(console, 'error').mockImplementation(() => {});
        rtl.render(
          <ProviderMock store={store}>
            {makeContainer(() => ({}), () => ({}), () => 'hey')}
          </ProviderMock>
        );
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy.mock.calls[0][0]).toMatch(
          /mergeProps\(\) in Connect\(Container\) must return a plain object/
        );
        spy.mockRestore();
        rtl.cleanup();

        spy = jest.spyOn(console, 'error').mockImplementation(() => {});
        rtl.render(
          <ProviderMock store={store}>
            {makeContainer(() => ({}), () => ({}), () => new AwesomeMap())}
          </ProviderMock>
        );
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy.mock.calls[0][0]).toMatch(
          /mergeProps\(\) in Connect\(Container\) must return a plain object/
        );
        spy.mockRestore();
      });
    });

    describe('Invocation behavior for mapState/mapDispatch based on number of arguments', () => {
      it('should not invoke mapState when props change if it only has one argument', () => {
        const store = createStore(stringBuilder);

        let invocationCount = 0;

        /*eslint-disable no-unused-vars */
        @connect(arg1 => {
          invocationCount++;
          return {};
        })
        /*eslint-enable no-unused-vars */
        class WithoutProps extends Component {
          render() {
            return <Passthrough {...this.props} />;
          }
        }

        class OuterComponent extends Component {
          constructor() {
            super();
            this.state = { foo: 'FOO' };
          }

          setFoo(foo) {
            this.setState({ foo });
          }

          render() {
            return (
              <div>
                <WithoutProps {...this.state} />
              </div>
            );
          }
        }

        let outerComponent;
        rtl.render(
          <ProviderMock store={store}>
            <OuterComponent ref={c => (outerComponent = c)} />
          </ProviderMock>
        );
        outerComponent.setFoo('BAR');
        outerComponent.setFoo('DID');

        expect(invocationCount).toEqual(1);
      });

      it('should invoke mapState every time props are changed if it has zero arguments', () => {
        const store = createStore(stringBuilder);

        let invocationCount = 0;

        @connect(() => {
          invocationCount++;
          return {};
        })
        class WithoutProps extends Component {
          render() {
            return <Passthrough {...this.props} />;
          }
        }

        class OuterComponent extends Component {
          constructor() {
            super();
            this.state = { foo: 'FOO' };
          }

          setFoo(foo) {
            this.setState({ foo });
          }

          render() {
            return (
              <div>
                <WithoutProps {...this.state} />
              </div>
            );
          }
        }

        let outerComponent;
        rtl.render(
          <ProviderMock store={store}>
            <OuterComponent ref={c => (outerComponent = c)} />
          </ProviderMock>
        );
        outerComponent.setFoo('BAR');
        outerComponent.setFoo('DID');

        expect(invocationCount).toEqual(3);
      });

      it('should invoke mapState every time props are changed if it has a second argument', () => {
        const store = createStore(stringBuilder);

        let propsPassedIn;
        let invocationCount = 0;

        @connect((state, props) => {
          invocationCount++;
          propsPassedIn = props;
          return {};
        })
        class WithProps extends Component {
          render() {
            return <Passthrough {...this.props} />;
          }
        }

        class OuterComponent extends Component {
          constructor() {
            super();
            this.state = { foo: 'FOO' };
          }

          setFoo(foo) {
            this.setState({ foo });
          }

          render() {
            return (
              <div>
                <WithProps {...this.state} />
              </div>
            );
          }
        }

        let outerComponent;
        rtl.render(
          <ProviderMock store={store}>
            <OuterComponent ref={c => (outerComponent = c)} />
          </ProviderMock>
        );

        outerComponent.setFoo('BAR');
        outerComponent.setFoo('BAZ');

        expect(invocationCount).toEqual(3);
        expect(propsPassedIn).toEqual({
          foo: 'BAZ'
        });
      });

      it('should not invoke mapDispatch when props change if it only has one argument', () => {
        const store = createStore(stringBuilder);

        let invocationCount = 0;

        /*eslint-disable no-unused-vars */
        @connect(
          null,
          arg1 => {
            invocationCount++;
            return {};
          }
        )
        /*eslint-enable no-unused-vars */
        class WithoutProps extends Component {
          render() {
            return <Passthrough {...this.props} />;
          }
        }

        class OuterComponent extends Component {
          constructor() {
            super();
            this.state = { foo: 'FOO' };
          }

          setFoo(foo) {
            this.setState({ foo });
          }

          render() {
            return (
              <div>
                <WithoutProps {...this.state} />
              </div>
            );
          }
        }

        let outerComponent;
        rtl.render(
          <ProviderMock store={store}>
            <OuterComponent ref={c => (outerComponent = c)} />
          </ProviderMock>
        );

        outerComponent.setFoo('BAR');
        outerComponent.setFoo('DID');

        expect(invocationCount).toEqual(1);
      });

      it('should invoke mapDispatch every time props are changed if it has zero arguments', () => {
        const store = createStore(stringBuilder);

        let invocationCount = 0;

        @connect(
          null,
          () => {
            invocationCount++;
            return {};
          }
        )
        class WithoutProps extends Component {
          render() {
            return <Passthrough {...this.props} />;
          }
        }

        class OuterComponent extends Component {
          constructor() {
            super();
            this.state = { foo: 'FOO' };
          }

          setFoo(foo) {
            this.setState({ foo });
          }

          render() {
            return (
              <div>
                <WithoutProps {...this.state} />
              </div>
            );
          }
        }

        let outerComponent;
        rtl.render(
          <ProviderMock store={store}>
            <OuterComponent ref={c => (outerComponent = c)} />
          </ProviderMock>
        );

        outerComponent.setFoo('BAR');
        outerComponent.setFoo('DID');

        expect(invocationCount).toEqual(3);
      });

      it('should invoke mapDispatch every time props are changed if it has a second argument', () => {
        const store = createStore(stringBuilder);

        let propsPassedIn;
        let invocationCount = 0;

        @connect(
          null,
          (dispatch, props) => {
            invocationCount++;
            propsPassedIn = props;
            return {};
          }
        )
        class WithProps extends Component {
          render() {
            return <Passthrough {...this.props} />;
          }
        }

        class OuterComponent extends Component {
          constructor() {
            super();
            this.state = { foo: 'FOO' };
          }

          setFoo(foo) {
            this.setState({ foo });
          }

          render() {
            return (
              <div>
                <WithProps {...this.state} />
              </div>
            );
          }
        }

        let outerComponent;
        rtl.render(
          <ProviderMock store={store}>
            <OuterComponent ref={c => (outerComponent = c)} />
          </ProviderMock>
        );

        outerComponent.setFoo('BAR');
        outerComponent.setFoo('BAZ');

        expect(invocationCount).toEqual(3);
        expect(propsPassedIn).toEqual({
          foo: 'BAZ'
        });
      });
    });
  });
});
