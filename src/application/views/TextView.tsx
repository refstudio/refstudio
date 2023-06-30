import { JsonEditorContent, XmlEditorContent } from '../../atoms/types/EditorContent';

export function TextView({
  file,
  textFormatter = (text) => text,
}: {
  file: XmlEditorContent | JsonEditorContent;
  textFormatter?: (input: string) => string;
}) {
  return (
    <div className="ml-1 h-full w-full overflow-y-auto p-2">
      <pre className="text-xs">{textFormatter(file.textContent)}</pre>
    </div>
  );
}
