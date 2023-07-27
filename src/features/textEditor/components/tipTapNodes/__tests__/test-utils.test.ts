import { Editor } from '@tiptap/react';

import { EDITOR_EXTENSIONS } from '../../tipTapEditorConfigs';
import { getPrettyHTML, getPrettyHTMLWithSelection, getSelectedText, setUpEditorWithSelection } from './test-utils';

describe('TipTap test utils', () => {
  const editor = new Editor({
    extensions: EDITOR_EXTENSIONS,
  });

  describe('setUpEditorWithSelection', () => {
    it('should position the cursor based on a marker', () => {
      const pos = setUpEditorWithSelection(editor, `<p>This |is some text content.</p>`);
      expect(pos).toEqual([7]);
      expect(editor.view.state.doc.textBetween(pos[0], pos[0] + 2)).toBe('is');
      expect(getSelectedText(editor)).toBe('');
    });

    it('should select text based on markers', () => {
      const [from, to] = setUpEditorWithSelection(
        editor,
        `<notionblock type='collapsible'>
          <p>He|ader|</p>
          <notionblock>
            <p>Content Line 1</p>
          </notionblock>
          <notionblock>
            <p>Content Line 2</p>
          </notionblock>
        </notionblock>`,
      );
      const sel = editor.view.state.selection;
      const text = editor.view.state.doc.textBetween(sel.from, sel.to);
      expect(sel.from).toEqual(from);
      expect(sel.to).toEqual(to);
      expect(text).toBe('ader');

      expect(getSelectedText(editor)).toBe('ader');
    });
  });

  describe('getPrettyHTML', () => {
    it('should nicely format document HTML', () => {
      editor.commands.setContent(
        `<p
      >some <b
      >text</b
      ></p
      >`,
      );
      expect(getPrettyHTML(editor)).toMatchInlineSnapshot(`
        "<notionblock>
          <p>
            some
            <strong>text</strong>
          </p>
        </notionblock>"
      `);
    });
  });

  describe('getPrettyHTMLWithSelection', () => {
    it('should correctly place cursor corresponding to selection', () => {
      setUpEditorWithSelection(
        editor,
        `<notionblock type='collapsible'>
          <p>He|ader</p>
          <notionblock>
            <p>Content Line 1</p>
          </notionblock>
          <notionblock>
            <p>Content Line 2</p>
          </notionblock>
        </notionblock>`,
      );
      expect(getPrettyHTMLWithSelection(editor)).toMatchInlineSnapshot(`
        "<notionblock type='collapsible' collapsed='false'>
          <p>He|ader</p>
          <notionblock collapsed='false'><p>Content Line 1</p></notionblock>
          <notionblock collapsed='false'><p>Content Line 2</p></notionblock>
        </notionblock>"
      `);
    });

    it('should correctly place markers corresponding to selected text', () => {
      setUpEditorWithSelection(
        editor,
        `<notionblock>
        <p>He|ader</p>
        <notionblock>
          <p>Content| Line 1</p>
        </notionblock>
        <notionblock>
          <p>Content Line 2</p>
        </notionblock>
      </notionblock>`,
      );
      expect(getPrettyHTMLWithSelection(editor)).toMatchInlineSnapshot(`
        "<notionblock collapsed='false'>
          <p>He|ader</p>
          <notionblock collapsed='false'><p>Content| Line 1</p></notionblock>
          <notionblock collapsed='false'><p>Content Line 2</p></notionblock>
        </notionblock>"
      `);
    });
  });
});
