import { DecoratorNode, EditorConfig, LexicalNode, NodeKey } from 'lexical';
import { ReactNode } from 'react';
import { Reference } from '../Reference';
import { ReferenceItem } from '../types/ReferenceItem';

export class ReferenceNode extends DecoratorNode<ReactNode> {
  __ref: ReferenceItem;
  //   __color: string;

  constructor(ref: ReferenceItem, key?: NodeKey) {
    super(key);
    this.__ref = ref;
    // this.__color = 'red';
  }

  static getType(): string {
    return 'reference-node';
  }

  static clone(node: ReferenceNode): ReferenceNode {
    return new ReferenceNode(node.__ref, node.__key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    // const element = super.createDOM(config);
    // element.style.color = this.__color;
    // return element;
    return document.createElement('div');
  }

  updateDOM(
    prevNode: ReferenceNode,
    dom: HTMLElement,
    config: EditorConfig,
  ): false {
    //     const isUpdated = super.updateDOM(prevNode, dom, config);
    //     if (prevNode.__color !== this.__color) {
    //       dom.style.color = this.__color;
    //     }
    //     return isUpdated;
    return false;
  }

  decorate(): ReactNode {
    return <Reference ref={this.__ref} />;
  }
}

export function $createReferenceNode(ref: ReferenceItem): ReferenceNode {
  return new ReferenceNode(ref);
}

export function $isReferenceNode(node?: LexicalNode): boolean {
  return node instanceof ReferenceNode;
}
