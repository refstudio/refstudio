import { useCallback, useEffect, useRef } from 'react';

let draggingCount = 0;

const isFileDrop = (e: DragEvent) => {
  if (!e.dataTransfer) {
    return false;
  }
  if (!e.dataTransfer.types.includes('Files')) {
    return false;
  }
  return true;
};

interface FileDragDropZoneProps {
  onFileDropStarted?: () => void;
  onFileDropCanceled?: () => void;
  onFileDrop: (files: FileList) => void;
  children: React.ReactNode;
}

/**
 * FilesDragDropZone
 *
 *  In HTML drag and drop events, it is not possible to directly access the names of files before the drop event occurs.
 *  The dragstart and dragover events provide limited information about the dragged data,
 *  but they do not expose details about the content of the files being dragged.
 *
 *  We need to register in the dragStart and DragOver to e.preventDefault() in order to get the drop event.
 */
export function FilesDragDropZone({
  onFileDropStarted,
  onFileDropCanceled,
  onFileDrop,
  children,
}: FileDragDropZoneProps) {
  const divRef = useRef<HTMLDivElement>(null);

  const handleDragEnter = useCallback(
    (e: DragEvent) => {
      if (!isFileDrop(e)) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();

      draggingCount++;
      if (draggingCount === 1) {
        onFileDropStarted?.();
      }
    },
    [onFileDropStarted],
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    if (!isFileDrop(e)) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback(
    (e: DragEvent) => {
      if (!isFileDrop(e)) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      draggingCount--;
      if (draggingCount === 0) {
        onFileDropCanceled?.();
      }
    },
    [onFileDropCanceled],
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      if (!isFileDrop(e)) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      draggingCount = 0;

      const eventFiles = e.dataTransfer!.files;
      if (eventFiles.length > 0) {
        onFileDrop(eventFiles);
      }
    },
    [onFileDrop],
  );

  useEffect(() => {
    const ele = divRef.current;
    if (!ele) {
      return;
    }
    ele.addEventListener('dragenter', handleDragEnter);
    ele.addEventListener('dragleave', handleDragLeave);
    ele.addEventListener('dragover', handleDragOver);
    ele.addEventListener('drop', handleDrop);
    return () => {
      ele.removeEventListener('dragenter', handleDragEnter);
      ele.removeEventListener('dragleave', handleDragLeave);
      ele.removeEventListener('dragover', handleDragOver);
      ele.removeEventListener('drop', handleDrop);
    };
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop, divRef]);

  return (
    <div className="relative h-screen" ref={divRef}>
      {children}
    </div>
  );
}
