import { Editor } from '@tiptap/react';

import { REFERENCES } from '../../../../../../references/__tests__/test-fixtures';
import { EDITOR_EXTENSIONS } from '../../../../tipTapEditorConfigs';
import { MarkdownSerializer } from '../MarkdownSerializer';

describe('MarkdownSerializer', () => {
  const editor = new Editor({
    extensions: EDITOR_EXTENSIONS,
  });
  const serializer = new MarkdownSerializer(editor, REFERENCES);
  const bibliographyFileName = 'bibliography';

  it('should correctly serialize paragraph', () => {
    const content = `<notionblock>
    <h1>
      Title
    </h1>
  </notionblock>
  <notionblock>
      <paragraph>
        Hello world!
      </paragraph>
    </notionblock>`;
    editor.commands.setContent(content);

    const serializedContent = serializer.serialize(bibliographyFileName);

    expect(serializedContent.bibliography).toBeUndefined();
    expect(serializedContent.markdownContent).toMatchInlineSnapshot(`
      "---
      title: Title
      ---

      Hello world!"
    `);
  });

  it.each([1, 2, 3, 4, 5, 6])('should correctly serialize heading with level %d', (headingLevel) => {
    const content = `<notionblock>
    <h1>
      Title
    </h1>
  </notionblock>
  <notionblock>
      <h${headingLevel}>
        Hello world!
      </h${headingLevel}>
    </notionblock>`;
    editor.commands.setContent(content);

    const serializedContent = serializer.serialize(bibliographyFileName);

    expect(serializedContent.bibliography).toBeUndefined();
    expect(serializedContent.markdownContent).toBe(
      `---
title: Title
---

${'#'.repeat(headingLevel)} Hello world!`,
    );
  });

  it('should correctly serialize citation with reference', () => {
    const content = `<notionblock>
    <h1>
      Title
    </h1>
  </notionblock>
  <notionblock>
      <paragraph>
        Citation with a reference <span data-type="reference" data-id="${REFERENCES[0].id}" />
      </paragraph>
    </notionblock>`;
    editor.commands.setContent(content);

    const serializedContent = serializer.serialize(bibliographyFileName);

    expect(serializedContent.bibliography).toBeDefined();
    expect(serializedContent.bibliography!.textContent).toMatchInlineSnapshot(`
      "@ARTICLE{doe2023,
      	TITLE = {REF1 A Few Useful Things to Know about Machine Learning},
      	AUTHOR = {Joe Doe},
      	YEAR = 2023,
      	MONTH = 8,
      }"
    `);
    expect(serializedContent.markdownContent).toMatchInlineSnapshot(`
      "---
      title: Title
      bibliography: bibliography.bib
      ---

      Citation with a reference @doe2023

      ## References"
    `);
  });

  it('should serialize invalid reference with "INVALID_REFERENCE" citation key', () => {
    const content = `<notionblock>
    <h1>
      Title
    </h1>
  </notionblock>
  <notionblock>
      <paragraph>
        Citation with an invalid reference <span data-type="reference" data-id="testId" />
      </paragraph>
    </notionblock>`;
    editor.commands.setContent(content);

    const serializedContent = serializer.serialize(bibliographyFileName);

    expect(serializedContent.bibliography).toBeUndefined();
    expect(serializedContent.markdownContent).toMatchInlineSnapshot(`
      "---
      title: Title
      ---

      Citation with an invalid reference @INVALID_REFERENCE"
    `);
  });

  it('should serialize paragraph with italic mark', () => {
    const content = `<notionblock>
    <h1>
      Title
    </h1>
  </notionblock>
  <notionblock>
      <paragraph>
        <em>Italic</em>
      </paragraph>
    </notionblock>`;
    editor.commands.setContent(content);

    const serializedContent = serializer.serialize(bibliographyFileName);

    expect(serializedContent.bibliography).toBeUndefined();
    expect(serializedContent.markdownContent).toMatchInlineSnapshot(`
      "---
      title: Title
      ---

      *Italic*"
    `);
  });

  it('should serialize paragraph with bold mark', () => {
    const content = `<notionblock>
    <h1>
      Title
    </h1>
  </notionblock>
  <notionblock>
      <paragraph>
        <strong>Bold</strong>
      </paragraph>
    </notionblock>`;
    editor.commands.setContent(content);

    const serializedContent = serializer.serialize(bibliographyFileName);

    expect(serializedContent.bibliography).toBeUndefined();
    expect(serializedContent.markdownContent).toMatchInlineSnapshot(`
      "---
      title: Title
      ---

      **Bold**"
    `);
  });

  it('should serialize paragraph with strikethrough mark', () => {
    const content = `<notionblock>
    <h1>
      Title
    </h1>
  </notionblock>
  <notionblock>
      <paragraph>
        <s>Strikethrough</s>
      </paragraph>
    </notionblock>`;
    editor.commands.setContent(content);

    const serializedContent = serializer.serialize(bibliographyFileName);

    expect(serializedContent.bibliography).toBeUndefined();
    expect(serializedContent.markdownContent).toMatchInlineSnapshot(`
      "---
      title: Title
      ---

      ~~Strikethrough~~"
    `);
  });

  it('should serialize paragraph with mixed marks', () => {
    const content = `<notionblock>
    <h1>
      Title
    </h1>
  </notionblock>
  <notionblock>
      <paragraph>
        <em>Italic</em>
        <br />
        <strong>B<s>ol</s>d</strong>
      </paragraph>
    </notionblock>`;
    editor.commands.setContent(content);

    const serializedContent = serializer.serialize(bibliographyFileName);

    expect(serializedContent.bibliography).toBeUndefined();
    expect(serializedContent.markdownContent).toMatchInlineSnapshot(`
      "---
      title: Title
      ---

      *Italic*  
      **B~~ol~~d**"
    `);
  });

  it('should indent collapsible children', () => {
    const content = `<notionblock>
    <h1>
      Title
    </h1>
  </notionblock>
  <notionblock type='collapsible'>
      <paragraph>
        Collapsible header
      </paragraph>
      <notionblock>
        <p>Child 1</p>
      </notionblock>
      <notionblock>
        <p>Child 2</p>
      </notionblock>
    </notionblock>`;
    editor.commands.setContent(content);

    const serializedContent = serializer.serialize(bibliographyFileName);

    expect(serializedContent.bibliography).toBeUndefined();
    expect(serializedContent.markdownContent).toMatchInlineSnapshot(`
      "---
      title: Title
      ---

      - Collapsible header

          Child 1

          Child 2"
    `);
  });

  it('should not indent children of non-collapsible node', () => {
    const content = `<notionblock>
    <h1>
      Title
    </h1>
  </notionblock>
  <notionblock>
      <paragraph>
        Collapsible header
      </paragraph>
      <notionblock>
        <p>Child 1</p>
      </notionblock>
      <notionblock>
        <p>Child 2</p>
      </notionblock>
    </notionblock>`;
    editor.commands.setContent(content);

    const serializedContent = serializer.serialize(bibliographyFileName);

    expect(serializedContent.bibliography).toBeUndefined();
    expect(serializedContent.markdownContent).toMatchInlineSnapshot(`
      "---
      title: Title
      ---

      Collapsible header
      Child 1

      Child 2"
    `);
  });

  it('should indent children of bullet list item', () => {
    const content = `<notionblock>
    <h1>
      Title
    </h1>
  </notionblock>
  <notionblock type='unorderedList'>
      <paragraph>
        Collapsible header
      </paragraph>
      <notionblock>
        <p>Child 1</p>
      </notionblock>
      <notionblock>
        <p>Child 2</p>
      </notionblock>
    </notionblock>`;
    editor.commands.setContent(content);

    const serializedContent = serializer.serialize(bibliographyFileName);

    expect(serializedContent.bibliography).toBeUndefined();
    expect(serializedContent.markdownContent).toMatchInlineSnapshot(`
      "---
      title: Title
      ---

      - Collapsible header

          Child 1

          Child 2"
    `);
  });
});
