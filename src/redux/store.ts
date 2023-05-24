import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';

import openedFilesSlice from '../features/openedFiles/openedFilesSlice';
import selectionReducer from '../features/selection/selectionSlice';

export const store = configureStore({
  reducer: {
    selection: selectionReducer,
    openedFiles: openedFilesSlice,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
