import { Context, createContext } from 'react';

import { TableData } from './ReferenceEditorTypes';

const defaultTableData = (): TableData => ({
  tableBodyContent: [],
  headerContentArray: [''],
  headerColSpan: 0,
});

export const TableDataContext: Context<TableData> = createContext(defaultTableData());
