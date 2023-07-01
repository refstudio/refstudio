import './ReferenceView.css';

import { useAtomValue } from 'jotai';
import { useState } from 'react';
import DataGrid, { Column, RenderEditCellProps, SelectColumn } from 'react-data-grid';

import { getReferencesAtom } from '../../../atoms/referencesState';
import { ReferenceItem } from '../../../types/ReferenceItem';
import { UploadTipInstructions } from '../components/UploadTipInstructions';

export function ReferencesTableView() {
  const references = useAtomValue(getReferencesAtom);

  const [selectedRows, setSelectedRows] = useState((): ReadonlySet<string> => new Set());

  const columns: Column<ReferenceItem>[] = [
    SelectColumn,
    { key: 'citationKey', name: 'Citation Key', frozen: true, resizable: true, width: 120 },
    { key: 'title', name: 'Title', editable: true, editor: TextEditor },
    { key: 'publishedDate', name: 'Date', width: 120 },
    {
      key: 'authors',
      name: 'Authors',
      formatter: ({ row }) => row.authors.map((a) => a.fullName).join(', '),
    },
  ];
  return (
    <div className="flex w-full flex-col overflow-y-auto p-6">
      {references.length === 0 && <UploadTipInstructions />}
      <DataGrid
        className="grow"
        columns={columns}
        rowKeyGetter={(row) => row.id}
        rows={references.map((reference) => ({
          ...reference,
        }))}
        selectedRows={selectedRows}
        onSelectedRowsChange={setSelectedRows}
      />

      {/* <table className="w-full border border-slate-300 text-left text-gray-500 ">
        <thead>
          <tr className="h-10 bg-slate-300 text-black">
            <th scope="col">Citation Key</th>
            <th scope="col">Title</th>
            <th scope="col">Date</th>
            <th scope="col">Authors</th>
          </tr>
        </thead>
        <tbody>
          {references.map((reference) => (
            <tr className="cursor-pointer bg-white even:bg-slate-50 hover:bg-slate-200" key={reference.id}>
              <td className="px-2">{reference.citationKey}</td>
              <td className="py-2">
                <div className="whitespace-nowrap ">{reference.title}</div>
              </td>
              <td>{reference.publishedDate ?? 'N/A'}</td>
              <td className="py-2 pl-6">
                <ul className="list-disc">
                  {reference.authors.map(({ fullName }) => (
                    <li key={fullName}>{fullName}</li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table> */}
    </div>
  );
}

function autoFocusAndSelect(input: HTMLInputElement | null) {
  input?.focus();
  input?.select();
}

export default function TextEditor<TRow, TSummaryRow>({
  row,
  column,
  onRowChange,
  onClose,
}: RenderEditCellProps<TRow, TSummaryRow>) {
  return (
    <input
      className="debug w-full px-2"
      ref={autoFocusAndSelect}
      value={row[column.key as keyof TRow] as unknown as string}
      onBlur={() => onClose(true, false)}
      onChange={(event) => onRowChange({ ...row, [column.key]: event.target.value })}
    />
  );
}
