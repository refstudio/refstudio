import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SelectionState {
  text: string;
}

const initialState: SelectionState = {
  text: '',
};

export const selectionSlice = createSlice({
  name: 'selection',
  initialState,
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

export default selectionSlice.reducer;
