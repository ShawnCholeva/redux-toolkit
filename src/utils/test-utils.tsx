import React from 'react';
import { act, render } from '@testing-library/react';
import { configureStore, Dispatch } from '@reduxjs/toolkit';
import { MemoryRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { reducer } from 'app/reducer';
import { RootState, store as origStore } from 'app/store';
import '@testing-library/jest-dom/extend-expect';

jest.mock('app/store', () => ({
  store: jest.fn()
}));

function configureTestStore(initialState: Partial<RootState> = {}) {
  const store = configureStore({ reducer, preloadedState: initialState });
  const origDispatch = store.dispatch as jest.Mock;

  store.dispatch = jest.fn(origDispatch);
  origStore.getState = () => store.getState();

  return store;
}

export function renderWithProviders(
  ui: React.ReactElement,
  initialState: Partial<RootState>,
  initialEntries?: string[],
  store = configureTestStore(initialState),
  rtlRender = render
) {
  const Wrapper: React.FC = ({ children }) => (
    <Provider store={store}>
      <Router initialEntries={initialEntries}>{children}</Router>
    </Provider>
  );

  return { ...rtlRender(ui, { wrapper: Wrapper }), store };
}

export async function actWithReturn<T = typeof origStore>(callback: Function) {
  let ret;

  await act(async () => {
    ret = await callback();
  });

  return (ret as unknown) as T;
}

export async function getActionResult<T = any>(dispatch: Dispatch, action: number = 0) {
  const mockDispatch = dispatch as jest.Mock;
  return (await mockDispatch.mock.results[action].value) as { type: string; payload?: T };
}

export const HooksWrapper: React.FC = ({ children }) => <Provider store={configureTestStore()}>{children}</Provider>;

export * from '@testing-library/react';
