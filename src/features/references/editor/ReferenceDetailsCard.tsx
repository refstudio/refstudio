import { ReactElement, useCallback, useContext, useState } from 'react';

import { CloseIcon, EditIcon } from '../../../components/icons';
import { cx } from '../../../lib/cx';
import { ReferenceItem } from '../../../types/ReferenceItem';
import { TableDataContext } from './ReferenceDetailsCard.Context';
import { ReferenceDetailsCardRow } from './ReferenceEditorTypes';

const TableHead = ({ editing, setEditing }: { editing: boolean; setEditing: CallableFunction }) => {
  const tableData = useContext(TableDataContext);

  return (
    <thead>
      <tr>
        {tableData.headerContentArray.map((h, index) => (
          <TableHeadCell
            colspan={tableData.headerColSpan}
            content={h}
            editing={editing}
            header={true}
            key={'th' + index.toString() + new Date().getTime().toString()}
            setEditing={setEditing}
          />
        ))}
      </tr>
    </thead>
  );
};

const TableHeadCell = ({
  colspan,
  content,
  header,
  editing,
  setEditing,
}: {
  colspan?: number;
  content: string;
  header?: boolean;
  editing: boolean;
  setEditing: CallableFunction;
}) => {
  const colSpanString = { ['colSpan']: colspan };

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
      {IconButtons(header, editing, setEditing)}
    </th>
  );
};

const IconButtons = (
  header: boolean | undefined,
  editing: boolean,
  setEditing: CallableFunction,
): ReactElement | undefined => {
  if (header) {
    return (
      <>
        <IconButton
          editing={editing}
          hiddenWhenEditing={true}
          icon={EditIcon()}
          setEditing={setEditing}
          title="Edit Reference"
        />
        <IconButton
          editing={editing}
          hiddenWhenEditing={false}
          icon={CloseIcon()}
          setEditing={setEditing}
          title="Finished Editing Reference"
        />
      </>
    );
  } else {
    return;
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
      title={title}
      onClick={() => {
        setEditing(!editing);
      }}
    >
      {icon}
    </button>
  );
};

const TableBody = ({
  editing,
  setEditing,
  editableReferenceItem,
  handleCellValueChanged,
}: {
  editing: boolean;
  setEditing: CallableFunction;
  editableReferenceItem: ReferenceItem;
  handleCellValueChanged: CallableFunction;
}) => {
  const tableData = useContext(TableDataContext);
  const rows: ReactElement[] = tableData.tableBodyContent.map((rowData) =>
    TableRow(rowData, editing, setEditing, editableReferenceItem, handleCellValueChanged),
  );
  return <tbody className="divide-y">{rows}</tbody>;
};

const TableRow = (
  { editable, value, title, id }: ReferenceDetailsCardRow,
  editing: boolean,
  setEditing: CallableFunction,
  editableReferenceItem: ReferenceItem,
  handleCellValueChanged: CallableFunction,
): ReactElement => (
  <tr key={'row' + id + new Date().getTime().toString()}>
    <TableHeadCell content={title} editing={editing} setEditing={setEditing} />
    <TableDataCell
      content={value}
      editable={editable}
      editableReferenceItem={editableReferenceItem}
      editing={editing}
      handleCellValueChanged={handleCellValueChanged}
      id={id}
    />
  </tr>
);

const TableDataCell = ({
  content,
  editable,
  id,
  editing,
  editableReferenceItem,
  handleCellValueChanged,
}: {
  content: string;
  editable: boolean;
  id: string;
  editing: boolean;
  editableReferenceItem: ReferenceItem;
  handleCellValueChanged: CallableFunction;
}) => {
  const contentDisplay = id === 'citationKey' ? '[' + content + ']' : content;
  const input = DataTextInput({ content, editable, id, editableReferenceItem, editing, handleCellValueChanged });
  const contentHideClass = editable ? { hidden: editing } : '';

  return (
    <td className="w-auto p-5" key={id}>
      <span className={cx(contentHideClass, 'leading-[30px]')}>{contentDisplay}</span>
      {input}
    </td>
  );
};

const DataTextInput = ({
  content,
  editable,
  id,
  editableReferenceItem,
  editing,
  handleCellValueChanged,
}: {
  content: string;
  editable: boolean;
  id: string;
  editableReferenceItem: ReferenceItem;
  editing: boolean;
  handleCellValueChanged: CallableFunction;
}): ReactElement | [] => {
  if (!editable) {
    return [];
  }
  const key = id + new Date().getTime().toString();
  return (
    <TextInput
      content={content}
      editableReferenceItem={editableReferenceItem}
      editing={editing}
      handleCellValueChanged={handleCellValueChanged}
      id={id}
      key={key}
    />
  );
};

const TextInput = ({
  content,
  id,
  editableReferenceItem,
  handleCellValueChanged,
  editing,
}: {
  content: string;
  id: string;
  editableReferenceItem: ReferenceItem;
  handleCellValueChanged: CallableFunction;
  editing: boolean;
}): ReactElement | [] => {
  const [value, setValue] = useState(content);

  const referenceUpdateOnChangeHandler = useCallback(
    (fieldName: string, theValue: string) => {
      switch (fieldName) {
        case 'citationKey':
          editableReferenceItem.citationKey = theValue;
          break;
        case 'title':
          editableReferenceItem.title = theValue;
          break;
        case 'doi':
          editableReferenceItem.doi = theValue;
          break;
      }
      handleCellValueChanged(editableReferenceItem);
    },
    [editableReferenceItem, handleCellValueChanged],
  );

  return (
    <input
      className={cx({ hidden: !editing }, 'w-full border bg-slate-50 px-2 py-0.5')}
      key={id}
      name={id}
      type="text"
      value={value}
      onBlur={(evt) => {
        referenceUpdateOnChangeHandler(id, evt.target.value);
      }}
      onChange={(evt) => {
        setValue(evt.target.value);
      }}
    />
  );
};

export default function ReferenceDetailsCard({
  handleCellValueChanged,
  editableReferenceItem,
}: {
  handleCellValueChanged: (params: ReferenceItem) => void;
  editableReferenceItem: ReferenceItem;
}) {
  const [editing, setEditing] = useState(false);

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
      <TableHead editing={editing} setEditing={setEditing} />
      <TableBody
        editableReferenceItem={editableReferenceItem}
        editing={editing}
        handleCellValueChanged={handleCellValueChanged}
        setEditing={setEditing}
      />
    </table>
  );
}
