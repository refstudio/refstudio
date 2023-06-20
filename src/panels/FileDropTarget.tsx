import type { DropTargetMonitor } from 'react-dnd';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import { VscFilePdf } from 'react-icons/vsc';

import { cx } from '../cx';

export interface FileDropTargetProps {
  onDrop: (files: FileList) => void;
  children: React.ReactNode;
}

export function FileDropTarget(props: FileDropTargetProps) {
  const { onDrop } = props;
  const [{ canDrop, isOver }, drop] = useDrop(
    () => ({
      accept: [NativeTypes.FILE],
      drop(item: { files: FileList }) {
        onDrop(item.files);
      },
      collect: (monitor: DropTargetMonitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [props.onDrop],
  );

  const isActive = canDrop && isOver;
  return (
    <div className="relative" ref={drop}>
      {isActive && (
        <div
          className={cx(
            'absolute left-0 top-0',
            'flex h-full w-full flex-col items-center justify-center gap-4',
            'bg-slate-100 p-10 text-center text-xl',
          )}
        >
          <VscFilePdf className="" size={60} />
          Release to upload files to your library
        </div>
      )}
      {props.children}
    </div>
  );
}
