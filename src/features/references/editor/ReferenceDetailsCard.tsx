import { atom, useAtom } from 'jotai';
import { ChangeEventHandler, ReactElement, useMemo } from 'react';

import { CloseIcon, EditIcon } from '../../../components/icons';
import { cx } from '../../../lib/cx';

export default function ReferenceDetailsCard({
  tableData,
  referenceUpdateHandler,
}: {
  tableData: {
    tableBodyContent: Record<string, string>[];
    headerContentArray: string[];
    headerColSpan: number;
  };
  referenceUpdateHandler: ChangeEventHandler<HTMLInputElement>;
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

  const TableDataCell = ({ content, name }: { content: string; name: string }) => (
    <td className="w-auto p-5">
      <span className={cx({ hidden: editable }, 'leading-[30px]')}>{content}</span>
      <input
        className={cx({ hidden: !editable }, 'w-full border bg-slate-50 px-2 py-0.5')}
        name={name}
        type="text"
        value={content}
        onChange={referenceUpdateHandler}
      />
    </td>
  );

  const TableHead = ({ headerContent }: { headerContent: { headerContentArray: string[]; headerColSpan: number } }) => (
    <thead>
      <tr>
        {headerContent.headerContentArray.map((h) => (
          <TableHeadCell colSpan={headerContent.headerColSpan} content={h} header={true} key={h} />
        ))}
      </tr>
    </thead>
  );

  const TableRow = ({ content, key }: { content: string; key: string }): ReactElement => (
    <tr key={key}>
      <TableHeadCell content={key} />
      <TableDataCell content={content} name={key} />
    </tr>
  );

  const TableBody = ({ tableBodyContent }: { tableBodyContent: Record<string, string>[] }) => {
    const rows: ReactElement[] = [];
    tableBodyContent.forEach((record) =>
      Object.entries(record).map((h) => {
        rows.push(TableRow({ content: h[1], key: h[0] }));
      }),
    );
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
