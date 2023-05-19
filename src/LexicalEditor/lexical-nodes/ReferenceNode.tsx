import { EditorConfig, LexicalNode, NodeKey, TextNode } from 'lexical';
import { ReferenceItem } from '../types/ReferenceItem';

export class ReferenceNode extends TextNode {
  __ref: ReferenceItem;
  __color: string;

  constructor(ref: ReferenceItem, key?: NodeKey) {
    super(`[${ref.id}]`, key);
    this.__ref = ref;
    this.__color = 'red';
  }

  static getType(): string {
    return 'reference-text-node';
  }

  static clone(node: ReferenceNode): ReferenceNode {
    return new ReferenceNode(node.__ref, node.__key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = super.createDOM(config);
    element.style.color = this.__color;
    return element;
  }

  updateDOM(prevNode: ReferenceNode, dom: HTMLElement, config: EditorConfig) {
    const isUpdated = super.updateDOM(prevNode, dom, config);
    if (prevNode.__color !== this.__color) {
      dom.style.color = this.__color;
    }
    return isUpdated;
  }
}

export function $createReferenceNode(ref: ReferenceItem): ReferenceNode {
  return new ReferenceNode(ref).setMode('token');
}

export function $isReferenceNode(node?: LexicalNode): boolean {
  return node instanceof ReferenceNode;
}
