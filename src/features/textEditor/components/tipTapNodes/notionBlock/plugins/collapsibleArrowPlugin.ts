import { EditorState, Plugin, PluginKey, Transaction } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

import { toggleCollapsed } from '../commands/toggleCollapsed';
import { NotionBlockNode } from '../NotionBlockNode';

export const collapsibleArrowsPluginKey = new PluginKey<DecorationSet>('collapsibleArrows');
/** Plugin to add arrow decorations to collapsible blocks */
export const collapsibleArrowsPlugin = new Plugin({
  key: collapsibleArrowsPluginKey,
  state: {
    init: (_config, state) => DecorationSet.create(state.doc, getCollapsibleArrowDecorations(state)),
    apply: (tr, value, _oldState, newState) => {
      if (!tr.docChanged || tr.getMeta(collapsibleArrowsPluginKey)) {
        return value;
      }
      return DecorationSet.create(tr.doc, getCollapsibleArrowDecorations(newState));
    },
  },
  props: {
    decorations(state) {
      return this.getState(state);
    },
    handleClick: (view, pos, event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const toggleNodeCollapsed = () =>
        toggleCollapsed({ pos: pos - 2, view, tr: view.state.tr, dispatch: (tr: Transaction) => view.dispatch(tr) });
      if (hasAncestor(target, '.collapsible-arrow')) {
        toggleNodeCollapsed();
      } else if (target.className.includes('empty-collapsible-placeholder')) {
        const { tr } = view.state;
        const schemaNodes = view.state.schema.nodes;
        view.dispatch(tr.insert(pos, schemaNodes[NotionBlockNode.name].create(null, schemaNodes.paragraph.create())));
      }
    },
  },
});
function getCollapsibleArrowDecorations(state: EditorState): Decoration[] {
  const decorations: Decoration[] = [];
  state.doc.descendants((node, pos) => {
    if (node.type.name !== NotionBlockNode.name) {
      return false;
    }
    if (node.attrs.type !== 'collapsible') {
      return;
    }

    const isEmpty = node.childCount === 1;
    // + 2 to add the decoration in the paragraph (...|<notionBlock><p>... --> ...<notionBlock><p>|...)
    decorations.push(createCollapsibleArrowButtonWidget(pos + 2, isEmpty));
  });
  return decorations;
}

function createCollapsibleArrowButtonWidget(pos: number, isEmpty: boolean) {
  return Decoration.widget(
    pos,
    () => {
      const button = document.createElement('button');
      button.classList.add('collapsible-arrow');
      button.innerHTML = `
        <svg className="triangle" viewBox="0 0 100 100">
          <polygon points="5.9,88.2 50,11.8 94.1,88.2 " />
        </svg>`;

      if (isEmpty) {
        button.classList.add('empty');
      }

      return button;
    },
    { side: -1 },
  );
}

function hasAncestor(el: Element, selector: string): boolean {
  if (el.matches(selector)) {
    return true;
  }
  const { parentElement } = el;
  if (!parentElement) {
    return false;
  }
  return hasAncestor(parentElement, selector);
}
