import { ReactElement, useCallback, useState } from 'react';

import { CloseIcon, EditIcon, OpenPdfIcon } from '../../../components/icons';
import { cx } from '../../../lib/cx';
import { Author, ReferenceItem } from '../../../types/ReferenceItem';
import { authorsFormatter } from './grid/formatters';

const getContentString = (fieldName: string, content?: string | Author[]): string => {
  if (typeof content == 'undefined') {
    return '';
  } else if (typeof content != 'string' && fieldName === 'authors') {
    return authorsFormatter({ value: content });
  } else if (fieldName === 'citationKey') {
    return '[' + content.toString() + ']';
  } else {
    return content.toString();
  }
};

const DataTextInput = ({
  content,
  fieldName,
  refId,
  onBlur,
}: {
  content: string;
  fieldName: string;
  refId: string;
  onBlur: (fieldName: string, value: string) => void;
}) => {
  const [value, setValue] = useState(content);

  return (
    <input
      className="w-full border bg-slate-50 px-2 py-0.5"
      id={refId + '_' + fieldName}
      name={fieldName}
      type="text"
      value={value}
      onBlur={(evt) => {
        onBlur(fieldName, evt.target.value);
      }}
      onChange={(evt) => {
        setValue(evt.target.value);
      }}
    />
  );
};

const TableDataCell = ({
  contentData,
  fieldName,
  refId,
  onBlur,
  editable,
  editing,
}: {
  contentData: string | Author[];
  fieldName: string;
  refId: string;
  onBlur: (fieldName: string, value: string) => void;
  editable: boolean;
  editing: boolean;
}) => (
  <td className="w-auto p-5">
    {editing && editable && typeof contentData === 'string' ? (
      <DataTextInput content={contentData} fieldName={fieldName} refId={refId} onBlur={onBlur} />
    ) : (
      <span className="leading-[30px]">{getContentString(fieldName, contentData)}</span>
    )}
  </td>
);

const TableHeadCell = ({
  content,
  colSpan,
  header,
  fieldName,
  reference,
  editing,
  setEditing,
  openPdf,
}: {
  content: string;
  colSpan?: number;
  header?: boolean;
  fieldName: string;
  reference: ReferenceItem;
  editing: boolean;
  setEditing?: (value: boolean) => void;
  openPdf?: (reference: ReferenceItem) => void;
}) => (
  <th
    className={cx(
      { 'rounded-t bg-card-bg-header p-3 text-white': header },
      { 'w-1/6 p-6': !header },
      'text-sm uppercase',
    )}
    colSpan={colSpan}
    key={content}
  >
    <label htmlFor={reference.id + '_' + fieldName}>{content}</label>

    {header && setEditing && (
      <>
        {editing ? (
          <IconButton icon={<CloseIcon />} title="Finished Editing Reference" onClick={() => setEditing(false)} />
        ) : (
          <IconButton icon={<EditIcon />} title="Edit Reference" onClick={() => setEditing(true)} />
        )}
        {reference.filepath && (
          <IconButton icon={<OpenPdfIcon />} title="Open PDF Reference" onClick={() => openPdf?.(reference)} />
        )}
      </>
    )}
  </th>
);

const IconButton = ({ title, icon, onClick }: { title: string; icon: ReactElement; onClick: () => void }) => (
  <button className="float-right hover:text-cyan-100" key={title} name={title} title={title} onClick={onClick}>
    {icon}
  </button>
);

export default function ReferenceDetailsCard({
  reference,
  handleReferenceChange,
  handleOpenPdf,
}: {
  reference: ReferenceItem;
  handleReferenceChange: (params: ReferenceItem) => void;
  handleOpenPdf?: (reference: ReferenceItem) => void;
}) {
  const [editing, setEditing] = useState(false);
  const cloneReferenceItem = <T extends object>(source: T): T => ({
    ...source,
  });

  // We have to use a copy of the reference for updating purposes, otherwise UpdateReferencesAtom sees no changes and doesn't update
  const recordChangesAndHandleReferenceChange = useCallback(
    (fieldName: string, value: string) => {
      const updatedReference = cloneReferenceItem(reference);

      switch (fieldName) {
        case 'citationKey':
          updatedReference.citationKey = value;
          break;
        case 'title':
          updatedReference.title = value;
          break;
        case 'doi':
          updatedReference.doi = value;
          break;
      }
      handleReferenceChange(updatedReference);
    },
    [reference, handleReferenceChange],
  );

  const referenceDetailsCardFormat = {
    citationKey: {
      title: 'Citation Key',
      editable: true,
    },
    title: {
      title: 'Title',
      editable: true,
    },
    authors: {
      title: 'Authors',
      editable: false,
    },
    doi: {
      title: 'DOI',
      editable: true,
    },
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
      <thead>
        <tr>
          <TableHeadCell
            colSpan={2}
            content="Reference Details"
            editing={editing}
            fieldName="table-head"
            header={true}
            openPdf={handleOpenPdf}
            reference={reference}
            setEditing={setEditing}
          />
        </tr>
      </thead>
      <tbody className="divide-y">
        {Object.entries(referenceDetailsCardFormat).map(([key, rowData]) => {
          const contentData = reference[key as keyof ReferenceItem];

          return (
            <tr key={key}>
              <TableHeadCell content={rowData.title} editing={editing} fieldName={key} reference={reference} />
              <TableDataCell
                contentData={contentData ?? ''}
                editable={rowData.editable}
                editing={editing}
                fieldName={key}
                refId={reference.id}
                onBlur={recordChangesAndHandleReferenceChange}
              />
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
