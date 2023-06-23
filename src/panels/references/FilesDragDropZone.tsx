import { useCallback, useEffect, useRef } from 'react';

let draggingCount = 0;

interface FileDragDropZoneProps {
  onFileDropStarted?: (files: FileList) => void;
  onFileDropCompleted?: () => void;
  onFileDrop: (files: FileList) => void;
  children: React.ReactNode;
}

export function FilesDragDropZone({
  onFileDropStarted,
  onFileDropCompleted,
  onFileDrop,
  children,
}: FileDragDropZoneProps) {
  const divRef = useRef<HTMLDivElement>(null);

  const handleDragIn = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      draggingCount++;
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        onFileDropStarted?.(e.dataTransfer.files);
      }
    },
    [onFileDropStarted],
  );

  const handleDragOver = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        onFileDropStarted?.(e.dataTransfer.files);
      }
    },
    [onFileDropStarted],
  );

  const handleDragOut = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      draggingCount--;
      if (draggingCount > 0) {
        return;
      }
      onFileDropCompleted?.();
    },
    [onFileDropCompleted],
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      draggingCount = 0;

      if (!e.dataTransfer) {
        return;
      }

      const eventFiles = e.dataTransfer.files;
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
    // Note: We need all of these (with the stoppropagation) in order to have the drop event
    ele.addEventListener('dragenter', handleDragIn);
    ele.addEventListener('dragleave', handleDragOut);
    ele.addEventListener('dragover', handleDragOver);
    ele.addEventListener('drop', handleDrop);
    return () => {
      ele.removeEventListener('dragenter', handleDragIn);
      ele.removeEventListener('dragleave', handleDragOut);
      ele.removeEventListener('dragover', handleDragOver);
      ele.removeEventListener('drop', handleDrop);
    };
  }, [handleDragIn, handleDragOut, handleDragOver, handleDrop, divRef]);

  return (
    <div className="relative h-screen" ref={divRef}>
      {children}
    </div>
  );
}
