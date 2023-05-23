import './MenuBar.css';

import { Editor } from '@tiptap/react';
import * as React from 'react';

import { cx } from '../cx';

export function MenuBar({ editor }: { editor: Editor }) {
  const [counter, setCounter] = React.useState(1);
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

  React.useEffect(() => {
    function update() {
      setCounter(counter + 1);
    }
    editor.on('update', update);
    editor.on('selectionUpdate', update);
    return () => {
      editor.off('update', update);
      editor.off('selectionUpdate', update);
    };
  }, [editor, counter]);

  return (
    <menu className="toolbar menu-bar">
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="toolbar-item"
      >
        <i className="format undo" />
      </button>

      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className={cx('toolbar-item')}
      >
        <i className="format redo" />
      </button>
      <Divider />
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={cx('toolbar-item', {
          active: editor.isActive('bold'),
        })}
      >
        <i className="format bold" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={cx('toolbar-item', {
          active: editor.isActive('italic'),
        })}
      >
        <i className="format italic" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={cx('toolbar-item', {
          active: editor.isActive('strike'),
        })}
      >
        <i className="format strikethrough" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={cx('toolbar-item', {
          active: editor.isActive('code'),
        })}
      >
        <i className="format code" />
      </button>

      <Divider />

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={cx('toolbar-item', {
          active: editor.isActive('heading', { level: 1 }),
        })}
      >
        <i className="format h1" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cx('toolbar-item', {
          active: editor.isActive('heading', { level: 2 }),
        })}
      >
        <i className="format h2" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={cx('toolbar-item', {
          active: editor.isActive('heading', { level: 3 }),
        })}
      >
        <i className="format h3" />
      </button>
      <button
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={cx('toolbar-item', {
          active: editor.isActive('paragraph'),
        })}
      >
        <i className="format paragraph" />
      </button>
      <Divider />

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cx('toolbar-item', {
          active: editor.isActive('bulletList'),
        })}
      >
        <i className="format ul" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cx('toolbar-item', {
          active: editor.isActive('orderedList'),
        })}
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
      <button onClick={handleToggleMarkdown} className="toolbar-item">
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
