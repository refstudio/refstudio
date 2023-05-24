import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';

import selectionReducer from '../features/selection/selectionSlice';

export const store = configureStore({
  reducer: {
    selection: selectionReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
