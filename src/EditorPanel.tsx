import { Panel } from 'react-resizable-panels';
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  EditorState,
  EditorThemeClasses,
} from 'lexical';
import { useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { InitialConfigType } from '@lexical/react/LexicalComposer';

// Lexical React plugins are React components, which makes them
// highly composable. Furthermore, you can lazy load plugins if
// desired, so you don't pay the cost for plugins until you
// actually use them.
function MyCustomAutoFocusPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Focus the editor when the effect fires!
    editor.focus();
  }, [editor]);

  return null;
}

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error: Error) {
  console.error(error);
}

export function EditorPanel({
  onSelection,
}: {
  onSelection: (selection: string) => any;
}) {
  const initialConfig: InitialConfigType = {
    namespace: 'RefStudioEditor',
    onError,
    editorState: prepopulatedRichText,
  };

  // When the editor changes, you can get notified via the
  // LexicalOnChangePlugin!
  function onChange(editorState: EditorState) {
    editorState.read(() => {
      // Read the contents of the EditorState here.
      const root = $getRoot();
      const selection = $getSelection();
      console.log(root, selection);

      const selectedText = selection?.getTextContent();
      selectedText && onSelection(selectedText);
    });
  }

  return (
    <Panel defaultSize={60}>
      <h1>Editor</h1>
      <LexicalComposer initialConfig={initialConfig}>
        <PlainTextPlugin
          contentEditable={<ContentEditable />}
          placeholder={<div></div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <OnChangePlugin onChange={onChange} />
        <HistoryPlugin />
        <MyCustomAutoFocusPlugin />
      </LexicalComposer>
    </Panel>
  );
}

function prepopulatedRichText() {
  const root = $getRoot();
  if (root.getFirstChild() === null) {
    const paragraph = $createParagraphNode();
    paragraph.append(
      $createTextNode('The playground is a demo environment built with '),
      $createTextNode('@lexical/react').toggleFormat('code'),
      $createTextNode('.'),
      $createTextNode(' Try typing in '),
      $createTextNode('some text').toggleFormat('bold'),
      $createTextNode(' with '),
      $createTextNode('different').toggleFormat('italic'),
      $createTextNode(' formats.'),
    );
    root.append(paragraph);
    const paragraph2 = $createParagraphNode();
    paragraph2.append(
      $createTextNode(
        'Make sure to check out the various plugins in the toolbar. You can also use #hashtags or @-mentions too!',
      ),
    );
    root.append(paragraph2);
    const paragraph3 = $createParagraphNode();
    paragraph3.append(
      $createTextNode(`If you'd like to find out more about Lexical, you can:`),
    );
    root.append(paragraph3);

    const paragraph4 = $createParagraphNode();
    paragraph4.append(
      $createTextNode(
        `Lastly, we're constantly adding cool new features to this playground. So make sure you check back here when you next get a chance :).`,
      ),
    );
    root.append(paragraph4);
  }
}
