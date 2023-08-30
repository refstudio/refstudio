import { ReactElement } from 'react';

import { cx } from '../../../lib/cx';

function TableHeadCell({ content, colSpan, header }: { content: string; colSpan?: number; header?: boolean }) {
  const colSpanString = { ['colSpan']: colSpan };
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
    </th>
  );
}

function TableDataCell({ content }: { content: string }) {
  return <td className="w-auto p-6">{content}</td>;
}

function TableHead({ headerContent }: { headerContent: { headerContentArray: string[]; headerColSpan: number } }) {
  return (
    <thead>
      <tr>
        {headerContent.headerContentArray.map((h) => (
          <TableHeadCell colSpan={headerContent.headerColSpan} content={h} header={true} key={h} />
        ))}
      </tr>
    </thead>
  );
}

function TableRow({ content, key }: { content: string; key: string }): ReactElement {
  return (
    <tr key={key}>
      <TableHeadCell content={key} />
      <TableDataCell content={content} />
    </tr>
  );
}

function TableBody({ tableBodyContent }: { tableBodyContent: Record<string, string>[] }) {
  const rows: ReactElement[] = [];
  tableBodyContent.forEach((record) =>
    Object.entries(record).map((h) => {
      rows.push(TableRow({ content: h[1], key: h[0] }));
    }),
  );
  return <tbody className="divide-y">{rows}</tbody>;
}

export default function ReferenceDetailsCard({
  tableData,
}: {
  tableData: {
    tableBodyContent: Record<string, string>[];
    headerContentArray: string[];
    headerColSpan: number;
  };
}) {
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
