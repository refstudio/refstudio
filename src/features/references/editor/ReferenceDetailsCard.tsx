import { atom, useAtom } from 'jotai';
import { ReactElement, useCallback, useMemo, useState } from 'react';

import { CloseIcon, EditIcon } from '../../../components/icons';
import { useDebouncedCallback } from '../../../hooks/useDebouncedCallback';
import { cx } from '../../../lib/cx';
import { ReferenceItem } from '../../../types/ReferenceItem';
import { ReferenceDetailsCardRow } from './ReferenceEditorTypes';

export default function ReferenceDetailsCard({
  tableData,
  referenceUpdateHandler,
  editableReferenceItem,
}: {
  tableData: {
    tableBodyContent: ReferenceDetailsCardRow[];
    headerContentArray: string[];
    headerColSpan: number;
  };
  referenceUpdateHandler: (params: ReferenceItem) => undefined;
  editableReferenceItem: ReferenceItem;
}) {
  const referenceCardEditableAtom = useMemo(() => atom(false), []);
  const [editable, setEditable] = useAtom(referenceCardEditableAtom);

  const TableHeadCell = ({ content, colSpan, header }: { content: string; colSpan?: number; header?: boolean }) => {
    const colSpanString = { ['colSpan']: colSpan };
    const editIcon: ReactElement | null = header ? EditIcon() : null;
    const closeIcon: ReactElement | null = header ? CloseIcon() : null;
    const toggleEditable = () => {
      setEditable(editable ? false : true);
    };

    return (
      <th
        className={cx(
          { 'rounded-t bg-card-bg-header p-3 text-white': header },
          { 'w-1/6 p-6': !header },
          'text-sm uppercase',
        )}
        {...colSpanString}
      >
        {content}
        <button
          className={cx({ hidden: editable }, 'float-right hover:text-cyan-100')}
          title="Edit Reference"
          onClick={toggleEditable}
        >
          {editIcon}
        </button>
        <button
          className={cx({ hidden: !editable }, 'float-right hover:text-cyan-100')}
          title="Finished Edit Reference"
          onClick={toggleEditable}
        >
          {closeIcon}
        </button>
      </th>
    );
  };

  interface InputProps {
    onChange: (value: string, fieldName: string) => void;
  }

  const updateAtomOnChange = useCallback(
    (fieldName: string, value: string) => {
      switch (fieldName) {
        case 'citationKey':
          editableReferenceItem.citationKey = value;
          break;
        case 'title':
          editableReferenceItem.title = value;
          break;
        case 'doi':
          editableReferenceItem.doi = value;
          break;
      }
      console.log(fieldName);
      console.log(value);
      console.log(editableReferenceItem);
      referenceUpdateHandler(editableReferenceItem);
    },
    [editableReferenceItem, referenceUpdateHandler],
  );

  const TableDataCell = ({ content, id }: { content: string; id: string }) => {
    const [value, setValue] = useState(content);
    const debouncedOnChange = useDebouncedCallback(updateAtomOnChange, 200);

    const contentDisplay = id === 'citationKey' ? '[' + content + ']' : content;
    return (
      <td className="w-auto p-5">
        <span className={cx({ hidden: editable }, 'leading-[30px]')}>{contentDisplay}</span>
        <input
          className={cx({ hidden: !editable }, 'w-full border bg-slate-50 px-2 py-0.5')}
          name={id}
          type="text"
          value={value}
          onChange={(evt) => {
            setValue(evt.target.value);
            debouncedOnChange(id, evt.target.value);
          }}
          // onChange={(e) => debouncedUpdateAtomOnChange(e.target.name, e.target.value)}
        />
      </td>
    );
  };

  const TableHead = ({ headerContent }: { headerContent: { headerContentArray: string[]; headerColSpan: number } }) => (
    <thead>
      <tr>
        {headerContent.headerContentArray.map((h) => (
          <TableHeadCell colSpan={headerContent.headerColSpan} content={h} header={true} key={h} />
        ))}
      </tr>
    </thead>
  );

  const TableRow = ({ value, title, id }: ReferenceDetailsCardRow): ReactElement => (
    <tr key={id}>
      <TableHeadCell content={title} />
      <TableDataCell content={value} id={id} />
    </tr>
  );

  const TableBody = ({ tableBodyContent }: { tableBodyContent: ReferenceDetailsCardRow[] }) => {
    const rows: ReactElement[] = [];
    tableBodyContent.forEach((rowData) => rows.push(TableRow(rowData)));
    return <tbody className="divide-y">{rows}</tbody>;
  };

  return (
    <table
      className={cx(
        'm-2 h-max w-full ',
        'border-collapse',
        'bg-card-bg-primary',
        'text-left',
        'rounded',
        'text-card-txt-primary',
      )}
    >
      <TableHead
        headerContent={{ headerContentArray: tableData.headerContentArray, headerColSpan: tableData.headerColSpan }}
      />
      <TableBody tableBodyContent={tableData.tableBodyContent} />
    </table>
  );
}
