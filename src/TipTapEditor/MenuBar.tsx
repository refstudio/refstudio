import './MenuBar.css';

import { Editor } from '@tiptap/react';
import * as React from 'react';

import { cx } from '../cx';

export function MenuBar({ editor }: { editor: Editor }) {
  const [markdownMode, setMarkdownMode] = React.useState(false);
  const handleToggleMarkdown = React.useCallback(() => {
    if (!markdownMode) {
      const markdown = editor.storage.markdown.getMarkdown();
      editor.commands.setContent({
        type: 'codeBlock',
        attrs: { language: 'markdown' },
        content: [{ type: 'text', text: markdown }],
      });
      setMarkdownMode(true);
    } else {
      editor.commands.setContent(editor.state.doc.child(0).content.firstChild?.text ?? '');
      setMarkdownMode(false);
    }
  }, [editor, markdownMode]);

  // We need this refresh to allow the UI to update on editor changes
  const [refreshToggle, setRefreshToggle] = React.useState(true);
  React.useEffect(() => {
    const update = () => setRefreshToggle(!refreshToggle);
    editor.on('update', update);
    editor.on('selectionUpdate', update);
    return () => {
      editor.off('update', update);
      editor.off('selectionUpdate', update);
    };
  }, [editor, refreshToggle]);

  return (
    <menu className="toolbar menu-bar">
      <button
        className="toolbar-item"
        disabled={!editor.can().chain().focus().undo().run()}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <i className="format undo" />
      </button>

      <button
        className={cx('toolbar-item')}
        disabled={!editor.can().chain().focus().redo().run()}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <i className="format redo" />
      </button>
      <Divider />
      <button
        className={cx('toolbar-item', {
          active: editor.isActive('bold'),
        })}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <i className="format bold" />
      </button>
      <button
        className={cx('toolbar-item', {
          active: editor.isActive('italic'),
        })}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <i className="format italic" />
      </button>
      <button
        className={cx('toolbar-item', {
          active: editor.isActive('strike'),
        })}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <i className="format strikethrough" />
      </button>
      <button
        className={cx('toolbar-item', {
          active: editor.isActive('code'),
        })}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <i className="format code" />
      </button>

      <Divider />

      <button
        className={cx('toolbar-item', {
          active: editor.isActive('heading', { level: 1 }),
        })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <i className="format h1" />
      </button>
      <button
        className={cx('toolbar-item', {
          active: editor.isActive('heading', { level: 2 }),
        })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <i className="format h2" />
      </button>
      <button
        className={cx('toolbar-item', {
          active: editor.isActive('heading', { level: 3 }),
        })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <i className="format h3" />
      </button>
      <button
        className={cx('toolbar-item', {
          active: editor.isActive('paragraph'),
        })}
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        <i className="format paragraph" />
      </button>
      <Divider />

      <button
        className={cx('toolbar-item', {
          active: editor.isActive('bulletList'),
        })}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <i className="format ul" />
      </button>
      <button
        className={cx('toolbar-item', {
          active: editor.isActive('orderedList'),
        })}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <i className="format ol" />
      </button>
      {/* <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={cx('toolbar-item', {
          active: editor.isActive('codeBlock'),
        })}
      >
        <i className="format code-block" />
      </button> */}
      {/* <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cx('toolbar-item', {
          active: editor.isActive('blockquote'),
        })}
      >
        <i className="format blockquote" />
      </button> */}
      {/* <button onClick={() => editor.chain().focus().setHorizontalRule().run()}>horizontal rule</button>
      <button onClick={() => editor.chain().focus().setHardBreak().run()}>hard break</button> */}

      <Divider />
      <button className="toolbar-item" onClick={handleToggleMarkdown}>
        <i
          className={cx('format', {
            'journal-text': markdownMode,
            'journal-code': !markdownMode,
          })}
        />
      </button>

      {/* <button onClick={() => editor.chain().focus().unsetAllMarks().run()} title="clear marks">
        cm
      </button>
      <button onClick={() => editor.chain().focus().clearNodes().run()} title="clear nodes">
        cn
      </button> */}

      {/* <button
        onClick={() => editor.chain().focus().setColor('#958DF1').run()}
        className={cx('toolbar-item', { active: editor.isActive('textStyle', { color: '#958DF1' }) })}
      >
        purple
      </button> */}
    </menu>
  );
}

function Divider() {
  return <div className="divider" />;
}
