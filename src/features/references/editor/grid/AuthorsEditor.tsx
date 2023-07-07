import { ICellEditorParams } from '@ag-grid-community/core';
import { forwardRef, useImperativeHandle, useState } from 'react';

import { autoFocus } from '../../../../lib/autoFocusAndSelect';
import { Author, ReferenceItem } from '../../../../types/ReferenceItem';

// Documentation:https://www.ag-grid.com/react-data-grid/cell-editors/
export const AuthorsEditor = forwardRef((props: ICellEditorParams<ReferenceItem, Author[]>, ref) => {
  const [value, setValue] = useState((props.value ?? []).map((v) => v.fullName).join('\n'));
  useImperativeHandle(ref, () => ({
    // the final value to send to the grid, on completion of editing
    getValue: () => parseAuthorsFromString(value),
    // Gets called once before editing starts, to give editor a chance to
    // cancel the editing before it even starts.
    isCancelBeforeStart: () => false,

    // Gets called once when editing is finished (eg if Enter is pressed).
    // If you return true, then the result of the edit will be ignored.
    isCancelAfterEnd: () => false,
  }));

  return (
    <div className="flex flex-col gap-2 border border-slate-200 p-1">
      <textarea
        className="border-none bg-slate-100 p-2 outline-none"
        ref={autoFocus}
        rows={(props.value?.length ?? 0) + 1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <p className="text-xs italic text-slate-500">
        NOTE: One author per line. <br />
        SHIFT+ENTER to create new lines.
      </p>
    </div>
  );
});
AuthorsEditor.displayName = 'AuthorsEditor';

function parseAuthorsFromString(lines: string) {
  return lines
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((fullName) => ({
      fullName,
      lastName: fullName.split(' ').pop() ?? '',
    })) as Author[];
}
