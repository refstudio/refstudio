import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { TreeView } from '@lexical/react/LexicalTreeView';
import './TreeViewPlugin.css';

export function TreeViewPlugin() {
  const [editor] = useLexicalComposerContext();
  return (
    <TreeView
      editor={editor}
      viewClassName="tree-view-output"
      treeTypeButtonClassName="debug-treetype-button"
      timeTravelPanelClassName=""
      timeTravelButtonClassName=""
      timeTravelPanelSliderClassName=""
      timeTravelPanelButtonClassName=""
    />
  );
}
