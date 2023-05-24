import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../../redux/store';

export interface SelectionState {
  text: string;
}

const initialState: SelectionState = {
  text: '',
};

export const selectionSlice = createSlice({
  name: 'selection',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setTextSelection: (state, action: PayloadAction<string>) => {
      state.text = action.payload;
    },
    clearTextSelection: (state) => {
      state.text = '';
    },
  },
});

export const { setTextSelection, clearTextSelection } = selectionSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.selection)`
export const selectSelection = (state: RootState) => state.selection;

export default selectionSlice.reducer;
