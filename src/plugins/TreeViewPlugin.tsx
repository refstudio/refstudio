import { TreeView } from '@lexical/react/LexicalTreeView';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import './TreeViewPlugin.css';

export function TreeViewPlugin() {
  const [editor] = useLexicalComposerContext();
  return (
    <TreeView
      editor={editor}
      viewClassName="tree-view-output"
      treeTypeButtonClassName="debug-treetype-button"
      timeTravelPanelClassName="debug-timetravel-panel"
      timeTravelButtonClassName="debug-timetravel-button"
      timeTravelPanelSliderClassName="debug-timetravel-panel-slider"
      timeTravelPanelButtonClassName="debug-timetravel-panel-button"
    />
  );
}
