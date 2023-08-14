import { Mark, Node } from '@tiptap/pm/model';

import { ReferenceItem } from '../../../../../types/ReferenceItem';
import { CitationNode } from '../citation/CitationNode';
import { NotionBlockNode } from '../notionBlock/NotionBlockNode';
import { ReferenceNode } from '../references/ReferenceNode';

export class MarkdownSerializer {
  private referencesById: Record<string, ReferenceItem>;

  constructor(references: ReferenceItem[]) {
    this.referencesById = Object.fromEntries(references.map((reference) => [reference.id, reference]));
  }

  private inlineBlockToMarkdown(node: Node): string {
    const nodeType = node.type.name;
    if (nodeType !== 'paragraph' && nodeType !== 'heading') {
      throw new Error('Unexpected node type. Expected an inline block, got ' + nodeType);
    }

    const flattenedTextNodes: { text: string; marks: readonly Mark[] }[] = [];

    node.forEach((child) => {
      if (child.isText) {
        flattenedTextNodes.push({ text: child.text ?? '', marks: child.marks });
      } else if (child.type.name === CitationNode.name) {
        flattenedTextNodes.push({ text: '[', marks: child.maybeChild(0)?.marks ?? [] });
        child.forEach((citationChild) => {
          const citationChildType = citationChild.type.name;
          if (citationChildType === ReferenceNode.name) {
            const reference = this.referencesById[citationChild.attrs.id] as ReferenceItem | undefined;
            flattenedTextNodes.push({
              marks: citationChild.marks,
              text: `@${reference?.citationKey ?? 'INVALID_REFERENCE'}`,
            });
          } else {
            flattenedTextNodes.push({
              marks: citationChild.marks,
              text: citationChild.text ?? '',
            });
          }
        });
        flattenedTextNodes.push({ text: ']', marks: child.lastChild?.marks ?? [] });
      } else if (child.type.name === 'hardBreak') {
        flattenedTextNodes.push({ text: '\n', marks: child.maybeChild(0)?.marks ?? [] });
      } else {
        throw new Error('Unexpected node type. Expected text or citation, got ' + child.type.name);
      }
    });

    let wasBold = false;
    let wasItalic = false;
    let wasStrikedthrough = false;
    let markdownContent = '';

    flattenedTextNodes.forEach((child) => {
      const isBold = child.marks.some((mark) => mark.type.name === 'bold');
      const isItalic = child.marks.some((mark) => mark.type.name === 'italic');
      const isStrikedthrough = child.marks.some((mark) => mark.type.name === 'strike');
      if (isBold !== wasBold) {
        wasBold = isBold;
        markdownContent += '**';
      }
      if (isItalic !== wasItalic) {
        wasItalic = isItalic;
        markdownContent += '*';
      }
      if (isStrikedthrough !== wasStrikedthrough) {
        wasStrikedthrough = isStrikedthrough;
        markdownContent += '~~';
      }
      markdownContent += child.text;
    });

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (wasBold) {
      markdownContent += '**';
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (wasItalic) {
      markdownContent += '*';
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (wasStrikedthrough) {
      markdownContent += '~~';
    }

    if (nodeType === 'heading') {
      markdownContent = `${'#'.repeat(+node.attrs.level)} ${markdownContent}`;
    }
    return markdownContent;
  }

  private notionBlocksToMarkdown(nodes: Node[], indentLevel = 0, isList = false): string {
    nodes.forEach((node) => {
      const nodeType = node.type.name;
      if (nodeType !== NotionBlockNode.name) {
        throw new Error('Unexpected node type. Expected notionBlock, got ' + nodeType);
      }
    });

    const lines: string[] = [];
    let addEmptyLine = !isList;

    nodes.forEach((node, nodeIndex) => {
      const isCollapsible = node.attrs.type === 'collapsible';
      const isListItem = node.attrs.type === 'bulletList';

      if ((nodeIndex > 0 || indentLevel > 0) && (addEmptyLine || !isCollapsible)) {
        lines.push('');
      }

      lines.push(
        ' '.repeat(indentLevel * 4) +
          (isCollapsible || isListItem ? '- ' : '') +
          this.inlineBlockToMarkdown(node.child(0)),
      );

      if (node.childCount > 1) {
        const content: Node[] = [];
        node.forEach((child, _offset, index) => {
          if (index > 0) {
            content.push(child);
          }
        });
        lines.push(this.notionBlocksToMarkdown(content, isCollapsible ? indentLevel + 1 : indentLevel, isCollapsible));
      }
      addEmptyLine = !isCollapsible;
    });
    return lines.join('\n');
  }

  serialize(node: Node): string {
    const notionBlocks: Node[] = [];
    node.forEach((child) => {
      notionBlocks.push(child);
    });

    return this.notionBlocksToMarkdown(notionBlocks);
  }
}
