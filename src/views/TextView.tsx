import { JsonFileContent, XmlFileContent } from '../atoms/types/FileContent';

export function TextView({
  file,
  textFormatter = (text) => text,
}: {
  file: XmlFileContent | JsonFileContent;
  textFormatter?: (input: string) => string;
}) {
  return (
    <div className="ml-1 h-full w-full overflow-y-auto p-2">
      <pre className="text-xs">{textFormatter(file.textContent)}</pre>
    </div>
  );
}
