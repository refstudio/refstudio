import { useDispatch } from 'react-redux';

import { cx } from '../cx';
import { closeFile, selectFile } from '../features/openedFiles/openedFilesSlice';
import { useAppSelector } from '../redux/hooks';

export function OpenedFilesView() {
  const dispatch = useDispatch();
  const openedFiles = useAppSelector((state) => state.openedFiles);

  if (openedFiles.files.length === 0) return null;

  return (
    <div
      className={cx(
        'm-2 flex items-center gap-2', //
        'border-b-1 border-b border-slate-400 ',
      )}
    >
      {openedFiles.files.map((fileInfo) => (
        <span
          onClick={(evt) => {
            evt.stopPropagation();
            dispatch(selectFile(fileInfo));
          }}
          className={cx(
            'flex flex-wrap items-center justify-between',
            'cursor-pointer select-none whitespace-nowrap',
            'px-2 py-1', //
            'group',
            'border border-b-0 border-slate-400',
            'hover:bg-slate-100',
            {
              'border-t-2 !border-t-green-500 bg-slate-100': openedFiles.selectedFile === fileInfo,
            },
          )}
          key={fileInfo.entry.path}
        >
          {fileInfo.entry.name}
          <span
            onClick={(evt) => {
              evt.stopPropagation();
              dispatch(closeFile(fileInfo));
            }}
            className={cx(
              'ml-4 px-1 text-lg font-semibold', //
              'hover:bg-slate-200 ',
              'invisible group-hover:visible',
            )}
          >
            &times;
          </span>
        </span>
      ))}
    </div>
  );
}
