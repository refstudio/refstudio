import { ReactElement, useCallback, useState } from 'react';

import { CloseIcon, EditIcon } from '../../../components/icons';
import { cx } from '../../../lib/cx';
import { Author, ReferenceItem } from '../../../types/ReferenceItem';
import { authorsFormatter } from './grid/formatters';

const getContentString = (id: string, content?: string | Author[]): string => {
  if (typeof content == 'undefined') {
    return '';
  } else if (typeof content != 'string' && id === 'authors') {
    return authorsFormatter({ value: content });
  } else if (id === 'citationKey') {
    return '[' + content.toString() + ']';
  } else {
    return content.toString();
  }
};

const DataTextInput = ({
  content,
  id,
  onChangeHandler,
}: {
  content: string;
  id: string;
  onChangeHandler: CallableFunction;
}) => {
  const [value, setValue] = useState(content);

  return (
    <input
      className="w-full border bg-slate-50 px-2 py-0.5"
      name={id}
      title={id} // required for unit testing to find this element
      type="text"
      value={value}
      onBlur={(evt) => {
        onChangeHandler(id, evt.target.value);
      }}
      onChange={(evt) => {
        setValue(evt.target.value);
      }}
    />
  );
};

const TableDataCell = ({
  contentData,
  id,
  onChangeHandler,
  editable,
  editing,
}: {
  contentData: string | Author[];
  id: string;
  onChangeHandler: CallableFunction;
  editable: boolean;
  editing: boolean;
}) => {
  if (!editing || !editable || typeof contentData != 'string') {
    return <UnEditableTableDataCell contentData={contentData} id={id} />;
  } else {
    return <EditableTableDataCell contentData={contentData} id={id} onChangeHandler={onChangeHandler} />;
  }
};

const EditableTableDataCell = ({
  contentData,
  id,
  onChangeHandler,
}: {
  contentData: string;
  id: string;
  onChangeHandler: CallableFunction;
}) => (
  <td className="w-auto p-5">
    <DataTextInput content={contentData} id={id} onChangeHandler={onChangeHandler} />
  </td>
);

const UnEditableTableDataCell = ({ contentData, id }: { contentData: string | Author[]; id: string }) => {
  const contentString = getContentString(id, contentData);

  return (
    <td className="w-auto p-5">
      <span className="leading-[30px]">{contentString}</span>
    </td>
  );
};

const TableHeadCell = ({
  content,
  colSpan,
  header,
  id,
  editing,
  setEditing,
}: {
  content: string;
  colSpan?: number;
  header?: boolean;
  id: string;
  editing?: boolean;
  setEditing?: CallableFunction;
}) => {
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
      <label htmlFor={id}>{content}</label>
      {IconButtons(header, editing, setEditing)}
    </th>
  );
};

const IconButtons = (header?: boolean, editing?: boolean, setEditing?: CallableFunction): ReactElement[] => {
  if (!header || editing === undefined || setEditing === undefined) {
    return [];
  } else {
    return [
      IconButton({ hiddenWhenEditing: true, icon: EditIcon(), title: 'Edit Reference', editing, setEditing }),
      IconButton({
        hiddenWhenEditing: false,
        icon: CloseIcon(),
        title: 'Finished Editing Reference',
        editing,
        setEditing,
      }),
    ];
  }
};

const IconButton = ({
  hiddenWhenEditing,
  title,
  icon,
  editing,
  setEditing,
}: {
  hiddenWhenEditing: boolean;
  title: string;
  icon: ReactElement;
  editing: boolean;
  setEditing: CallableFunction;
}) => {
  const hiddenClass = hiddenWhenEditing ? { hidden: editing } : { hidden: !editing };

  return (
    <button
      className={cx(hiddenClass, 'float-right hover:text-cyan-100')}
      key={title}
      name={title}
      title={title}
      onClick={() => {
        setEditing(!editing);
      }}
    >
      {icon}
    </button>
  );
};

export default function ReferenceDetailsCard({
  reference,
  handleReferenceChange,
}: {
  reference: ReferenceItem;
  handleReferenceChange: (params: ReferenceItem) => void;
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
      editable: false,
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
            content="References"
            editing={editing}
            header={true}
            id="table-head"
            setEditing={setEditing}
          />
        </tr>
      </thead>
      <tbody className="divide-y">
        {Object.entries(referenceDetailsCardFormat).map(([key, rowData]) => {
          const contentData = reference[key as keyof ReferenceItem];

          return (
            <tr key={key}>
              <TableHeadCell content={rowData.title} id={key} />
              <TableDataCell
                contentData={contentData ?? ''}
                editable={rowData.editable}
                editing={editing}
                id={key}
                onChangeHandler={recordChangesAndHandleReferenceChange}
              />
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
