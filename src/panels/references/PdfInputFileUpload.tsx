import { createRef } from 'react';

export function PdfInputFileUpload({
  className,
  onUpload,
}: {
  className?: string;
  onUpload: (files: FileList) => void;
}) {
  const inputRef = createRef<HTMLInputElement>();

  return (
    <div className={className}>
      <input
        accept="application/pdf"
        className="hidden"
        multiple
        ref={inputRef}
        role="form"
        type="file"
        onChange={(e) => e.currentTarget.files && onUpload(e.currentTarget.files)}
      />
      <strong>TIP:</strong> Click{' '}
      <span className="cursor-pointer underline" onClick={() => inputRef.current?.click()}>
        here
      </span>{' '}
      or drag/drop PDF files here for upload.
    </div>
  );
}
