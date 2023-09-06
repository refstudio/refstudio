import { createContext, Dispatch, ReactElement, SetStateAction, useCallback, useContext, useState } from 'react';

import { CloseIcon, EditIcon } from '../../../components/icons';
import { cx } from '../../../lib/cx';
import { ReferenceItem } from '../../../types/ReferenceItem';

interface IEditingContext {
  editing: boolean;
  setEditing: Dispatch<SetStateAction<boolean>>;
}

const EditingContext = createContext<IEditingContext>({
  editing: false,
  setEditing: () => {
    console.log('seting edtiting');
  },
});

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
  content,
  editable,
  id,
  onChangeHandler,
}: {
  content: string;
  editable: boolean;
  id: string;
  onChangeHandler: CallableFunction;
}) => {
  const { editing } = useContext(EditingContext);

  const contentDisplay = id === 'citationKey' ? '[' + content + ']' : content;

  if (!editing || !editable) {
    return (
      <td className="w-auto p-5">
        <span className="leading-[30px]">{contentDisplay}</span>
      </td>
    );
  } else {
    return (
      <td className="w-auto p-5">
        <DataTextInput content={content} id={id} onChangeHandler={onChangeHandler} />
      </td>
    );
  }
};

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
  const { editing, setEditing } = useContext(EditingContext);
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

export default function ReferenceDetailsCard({
  reference,
  handleReferenceChanged,
}: {
  reference: ReferenceItem;
  handleReferenceChanged: (params: ReferenceItem) => void;
}) {
  const [editing, setEditing] = useState(false);
  const cloneReferenceItem = <T extends object>(source: T): T => ({
    ...source,
  });

  const updatedReference = cloneReferenceItem(reference);

  // We have to use a copy of the reference for updating purposes, otherwise UpdateReferencesAtom sees no changes and doesn't update
  const referenceChanged = useCallback(
    (fieldName: string, value: string) => {
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
      handleReferenceChanged(updatedReference);
    },
    [updatedReference, handleReferenceChanged],
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

  const getOnlyEditableStringProperty = (theReference: ReferenceItem, key: string): string => {
    switch (key) {
      case 'citationKey':
        return theReference.citationKey;
      case 'title':
        return theReference.title;
      case 'doi':
        return theReference.title;
      default:
        return '';
    }
  };

  const returnFormatedAuthorsString = (theReference: ReferenceItem) => {
    let authorsString = '';
    theReference.authors.forEach((a, index) => {
      authorsString += (index > 0 ? ', ' : '') + a.fullName;
    });
    return authorsString;
  };

  return (
    <EditingContext.Provider value={{ editing, setEditing }}>
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
            <TableHeadCell colSpan={2} content="References" header={true} />
          </tr>
        </thead>
        <tbody className="divide-y">
          {Object.entries(referenceDetailsCardFormat).map((row) => {
            const key = row[0];
            const rowData = row[1];
            const content =
              key === 'authors'
                ? returnFormatedAuthorsString(reference)
                : getOnlyEditableStringProperty(reference, key as keyof ReferenceItem);
            return (
              <tr key={'row' + key + new Date().getTime().toString()}>
                <TableHeadCell content={rowData.title} />
                <TableDataCell
                  content={content}
                  editable={rowData.editable}
                  id={key}
                  onChangeHandler={referenceChanged}
                />
              </tr>
            );
          })}
        </tbody>
      </table>
    </EditingContext.Provider>
  );
}
