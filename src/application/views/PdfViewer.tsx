import { PdfEditorContent } from '../../atoms/types/EditorContent';

interface PdfViewerProps {
  data: PdfEditorContent;
}

export function PdfViewer({ data }: PdfViewerProps) {
  console.log('DATA', data);
  const url = '/api/fs/' + data.projectId + '/' + data.filePath;
  const embedOptions = 'navpanes=0&view=fitH';
  return <iframe className="flex h-full w-full flex-col" height="100%" src={`${url}#${embedOptions}`} width="100%" />;
}
