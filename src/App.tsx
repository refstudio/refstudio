import * as React from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { ReferenceItem } from './types/ReferenceItem';
import { AIView } from './views/AIView';
import { EditorView } from './views/EditorView';
import { FoldersView } from './views/FoldersView';
import { ReferencesView } from './views/ReferencesView';

import { useDebounce } from 'usehooks-ts';
import { EditorAPI } from './types/EditorAPI';
import { FileEntry } from '@tauri-apps/api/fs';

function isTipTap(file?: FileEntry) {
  return file?.path.endsWith('.tiptap');
}

function App() {
  const [selectedFile, setSelectedFile] = React.useState<FileEntry | undefined>();

  const [selection, setSelection] = React.useState<string | null>(null);
  const debouncedSelection = useDebounce(selection, 200);
  const [editorContent, setEditorContent] = React.useState('');
  const editorRef = React.useRef<EditorAPI>();
  const handleReferenceClicked = (reference: ReferenceItem) => {
    editorRef.current?.insertReference(reference);
  };

  function handleFolderClick(content: Uint8Array, file: FileEntry): void {
    setSelectedFile(file);
    if (isTipTap(file)) {
      var stringContent = new TextDecoder('utf-8').decode(content);
      setEditorContent(stringContent);
    }
  }

  const showEditor = isTipTap(selectedFile);

  return (
    <PanelGroup autoSaveId="refstudio" direction="horizontal">
      <Panel defaultSize={20} collapsible className="overflow-scroll p-4">
        <FoldersView onClick={handleFolderClick} />
      </Panel>
      <VerticalResizeHandle />

      <Panel defaultSize={60} className="overflow-scroll p-3">
        {showEditor && (
          <EditorView onSelectionChange={setSelection} editorRef={editorRef} editorContent={editorContent} />
        )}
        {!showEditor && (
          <div>
            <strong>FILE:</strong>
            <div>{selectedFile?.name} at <code>{selectedFile?.path}</code></div>
          </div>
        )}
      </Panel>

      <VerticalResizeHandle />
      <Panel>
        <PanelGroup autoSaveId="rs-right-sidebar" direction="vertical">
          <Panel className="overflow-scroll p-3">
            <ReferencesView onRefClicked={handleReferenceClicked} />
          </Panel>
          <HorizontalResizeHandle />
          <Panel className="overflow-scroll p-3">
            <AIView selection={debouncedSelection} />
          </Panel>
        </PanelGroup>
      </Panel>
    </PanelGroup>
  );
}

function VerticalResizeHandle() {
  return <PanelResizeHandle className="flex w-1 items-center bg-gray-200 hover:bg-blue-100" />;
}

function HorizontalResizeHandle() {
  return <PanelResizeHandle className="flex h-1 items-center bg-gray-200 hover:bg-blue-100" />;
}

export default App;
