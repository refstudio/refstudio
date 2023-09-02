import { ReactElement, useCallback, useState } from 'react';

import { CloseIcon, EditIcon } from '../../../components/icons';
import { useDebouncedCallback } from '../../../hooks/useDebouncedCallback';
import { cx } from '../../../lib/cx';
import { ReferenceItem } from '../../../types/ReferenceItem';
import { ReferenceDetailsCardRow } from './ReferenceEditorTypes';

export default function ReferenceDetailsCard({
  tableData,
  updateReference,
  editableReferenceItem,
}: {
  tableData: {
    tableBodyContent: ReferenceDetailsCardRow[];
    headerContentArray: string[];
    headerColSpan: number;
  };
  updateReference: (params: ReferenceItem) => void;
  editableReferenceItem: ReferenceItem;
}) {
  const [editing, setEditing] = useState(false);

  const TableHead = ({ headerContent }: { headerContent: { headerContentArray: string[]; headerColSpan: number } }) => (
    <thead>
      <tr>
        {headerContent.headerContentArray.map((h) => (
          <TableHeadCell colSpan={headerContent.headerColSpan} content={h} header={true} key={h} />
        ))}
      </tr>
    </thead>
  );

  const TableHeadCell = ({ content, colSpan, header }: { content: string; colSpan?: number; header?: boolean }) => {
    const colSpanString = { ['colSpan']: colSpan };

    return (
      <th
        className={cx(
          { 'rounded-t bg-card-bg-header p-3 text-white': header },
          { 'w-1/6 p-6': !header },
          'text-sm uppercase',
        )}
        key={content}
        {...colSpanString}
      >
        {content}
        {IconButtons(header)}
      </th>
    );
  };

  const IconButtons = (header: boolean | undefined): ReactElement[] => {
    if (header) {
      return [
        IconButton({ hiddenWhenEditing: true, icon: EditIcon(), title: 'Edit Reference' }),
        IconButton({ hiddenWhenEditing: false, icon: CloseIcon(), title: 'Finished Editing Reference' }),
      ];
    } else {
      return [];
    }
  };

  const IconButton = ({
    hiddenWhenEditing,
    title,
    icon,
  }: {
    hiddenWhenEditing: boolean;
    title: string;
    icon: ReactElement;
  }) => {
    const hiddenClass = hiddenWhenEditing ? { hidden: editing } : { hidden: !editing };

    return (
      <button
        className={cx(hiddenClass, 'float-right hover:text-cyan-100')}
        key={title}
        title={title}
        onClick={() => {
          setEditing(!editing);
        }}
      >
        {icon}
      </button>
    );
  };

  const TableBody = ({ tableBodyContent }: { tableBodyContent: ReferenceDetailsCardRow[] }) => {
    const rows: ReactElement[] = tableBodyContent.map((rowData) => TableRow(rowData));
    return <tbody className="divide-y">{rows}</tbody>;
  };

  const TableRow = ({ editable, value, title, id }: ReferenceDetailsCardRow): ReactElement => (
    <tr key={id}>
      <TableHeadCell content={title} />
      <TableDataCell content={value} editable={editable} id={id} />
    </tr>
  );

  const TableDataCell = ({ content, editable, id }: { content: string; editable: boolean; id: string }) => {
    const contentDisplay = id === 'citationKey' ? '[' + content + ']' : content;
    const input = DataTextInput(content, editable, id);
    const contentHideClass = editable ? { hidden: editing } : '';
    return (
      <td className="w-auto p-5">
        <span className={cx(contentHideClass, 'leading-[30px]')}>{contentDisplay}</span>
        {input}
      </td>
    );
  };

  const referenceUpdateOnChangeHandler = useCallback(
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
      updateReference(editableReferenceItem);
    },
    [editableReferenceItem, updateReference],
  );

  const DataTextInput = (content: string, editable: boolean, id: string): ReactElement | [] => {
    const [value, setValue] = useState(content);
    const debouncedOnChange = useDebouncedCallback(referenceUpdateOnChangeHandler, 500);

    if (!editable) {
      return [];
    }

    return (
      <input
        className={cx({ hidden: !editing }, 'w-full border bg-slate-50 px-2 py-0.5')}
        name={id}
        type="text"
        value={value}
        onChange={(evt) => {
          setValue(evt.target.value);
          debouncedOnChange(id, evt.target.value);
        }}
      />
    );
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
