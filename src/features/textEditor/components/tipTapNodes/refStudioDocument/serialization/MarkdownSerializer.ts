import { getHTMLFromFragment } from '@tiptap/core';
import { Fragment, Node } from '@tiptap/pm/model';
import { Editor } from '@tiptap/react';
import TurndownService from 'turndown';

import { ReferenceItem } from '../../../../../../types/ReferenceItem';
import { NotionBlockNode } from '../../notionBlock/NotionBlockNode';
import { SerializedReferences, serializeReferences } from './serializeReferences';

interface SerializedDocument {
  markdownContent: string;
  bibliography?: SerializedReferences;
}

function stringifyMetadata(metadata: Record<string, string>): string {
  const metadataStrings = Object.entries(metadata).map(([key, value]) => `${key}: ${value}`);

  return ['---', ...metadataStrings, '---'].join('\n') + '\n';
}

export class MarkdownSerializer {
  private editor: Editor;
  private referencesById: Record<string, ReferenceItem>;
  private turndownService: TurndownService;

  private usedReferenceIds = new Set<string>();

  constructor(editor: Editor, references: ReferenceItem[]) {
    this.editor = editor;
    this.referencesById = Object.fromEntries(references.map((reference) => [reference.id, reference]));
    this.turndownService = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-', emDelimiter: '*' });

    this.turndownService.addRule('strikethrough', {
      filter: ['s'],
      replacement: (content) => '~~' + content + '~~',
    });
    this.turndownService.addRule('reference', {
      filter: (node) => node.nodeName === 'SPAN' && node.getAttribute('data-type') === 'reference',
      replacement: (_content, node) => {
        const referenceId = node instanceof HTMLElement ? node.getAttribute('data-id') : null;

        if (!referenceId) {
          return '[INVALID_REFERENCE]';
        }
        const reference = this.referencesById[referenceId] as ReferenceItem | undefined;
        if (reference) {
          this.usedReferenceIds.add(referenceId);
        }

        return reference?.citationKey ? `[@${reference.citationKey}]` : '[INVALID_REFERENCE]';
      },
    });
  }

  private inlineBlockToMarkdown(node: Node): string {
    const nodeType = node.type.name;
    if (nodeType !== 'paragraph' && nodeType !== 'heading') {
      throw new Error('Unexpected node type. Expected an inline block, got ' + nodeType);
    }

    const htmlContent = getHTMLFromFragment(Fragment.from(node), this.editor.schema);
    return this.turndownService.turndown(htmlContent);
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
      const isOrderedList = node.attrs.type === 'orderedList';
      const isCollapsible = node.attrs.type === 'collapsible' || node.attrs.type === 'unorderedList' || isOrderedList;

      if ((nodeIndex > 0 || indentLevel > 0) && (addEmptyLine || !isCollapsible)) {
        lines.push('');
      }

      if (isOrderedList) {
        lines.push(`${' '.repeat(indentLevel * 4)}1. ${this.inlineBlockToMarkdown(node.child(0))}`);
      } else {
        lines.push(
          ' '.repeat(indentLevel * 4) + (isCollapsible ? '- ' : '') + this.inlineBlockToMarkdown(node.child(0)),
        );
      }

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

  serialize(fileName: string): SerializedDocument {
    this.usedReferenceIds = new Set<string>();

    const { doc } = this.editor.state;

    if (doc.childCount === 0) {
      return { markdownContent: '' };
    }
    const notionBlocks: Node[] = [];
    doc.forEach((child, _offset, index) => {
      if (index > 0) {
        notionBlocks.push(child);
      }
    });

    const documentTitle = doc.child(0).textContent;

    let markdownContent = this.notionBlocksToMarkdown(notionBlocks);

    const metadata: Record<string, string> = { title: documentTitle };

    if (this.usedReferenceIds.size === 0) {
      return { markdownContent: `${stringifyMetadata(metadata)}\n${markdownContent}` };
    }

    // Export references as .bib
    const bibliography = serializeReferences(
      [...this.usedReferenceIds.values()].map((referenceId) => this.referencesById[referenceId]).filter(Boolean),
    );

    metadata.bibliography = `${fileName}.bib`;
    // This is for Quarto (cf. https://quarto.org/docs/get-started/authoring/text-editor.html#citations)
    markdownContent += '\n\n## References';

    return {
      markdownContent: `${stringifyMetadata(metadata)}\n${markdownContent}`,
      bibliography,
    };
  }
}
