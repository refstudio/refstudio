import './MenuBar.css';

import { Editor } from '@tiptap/react';
import * as React from 'react';
import {
  AiOutlineAlignLeft as IconParagraph,
  AiOutlineBold as IconBold,
  AiOutlineCode as IconCode,
  AiOutlineItalic as IconItalic,
  AiOutlineLine as IconHorizontalRule,
  // AiOutlineOrderedList as IconOrderedList,
  AiOutlineRedo as IconRedo,
  AiOutlineStrikethrough as IconStrikethrough,
  AiOutlineUndo as IconUndo,
  AiOutlineUnorderedList as IconUnorderedList,
} from 'react-icons/ai';
import {
  LuCode2 as IconDebug,
  LuHeading1 as IconH1,
  LuHeading2 as IconH2,
  LuHeading3 as IconH3,
  LuRemoveFormatting as IconClearMarks,
} from 'react-icons/lu';

import { cx } from '../../../lib/cx';

export function MenuBar({ editor }: { editor: Editor }) {
  const [markdownMode, setMarkdownMode] = React.useState(false);
  const handleToggleMarkdown = React.useCallback(() => {
    if (!markdownMode) {
      const markdown = editor.storage.markdown.getMarkdown() as string;
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
    <menu className="toolbar menu-bar x-hide-scrollbars">
      <button
        className="toolbar-item"
        disabled={!editor.can().chain().focus().undo().run()}
        title="Undo"
        onClick={() => editor.chain().focus().undo().run()}
      >
        <IconUndo />
      </button>

      <button
        className={cx('toolbar-item')}
        disabled={!editor.can().chain().focus().redo().run()}
        title="Redo"
        onClick={() => editor.chain().focus().redo().run()}
      >
        <IconRedo />
      </button>
      <Divider />
      <button
        className={cx('toolbar-item', {
          active: editor.isActive('bold'),
        })}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        title="Bold"
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <IconBold />
      </button>
      <button
        className={cx('toolbar-item', {
          active: editor.isActive('italic'),
        })}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        title="Italic"
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <IconItalic />
      </button>
      <button
        className={cx('toolbar-item', {
          active: editor.isActive('strike'),
        })}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        title="Strikethrough"
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <IconStrikethrough />
      </button>
      <button
        className="toolbar-item"
        title="Clear Formatting"
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
      >
        <IconClearMarks />
      </button>
      <button
        className={cx('toolbar-item', {
          active: editor.isActive('code'),
        })}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        title="Code Formatting"
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <IconCode />
      </button>

      <Divider />

      <button
        className={cx('toolbar-item', {
          active: editor.isActive('heading', { level: 1 }),
        })}
        title="Heading Level 1"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <IconH1 />
      </button>
      <button
        className={cx('toolbar-item', {
          active: editor.isActive('heading', { level: 2 }),
        })}
        title="Heading Level 2"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <IconH2 />
      </button>
      <button
        className={cx('toolbar-item', {
          active: editor.isActive('heading', { level: 3 }),
        })}
        title="Heading Level 3"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <IconH3 />
      </button>
      <button
        className={cx('toolbar-item', {
          active: editor.isActive('paragraph'),
        })}
        title="Paragraph Text"
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        <IconParagraph />
      </button>
      <Divider />

      <button
        className={cx('toolbar-item', {
          active: editor.isActive('bulletList'),
        })}
        title="Bulleted List"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <IconUnorderedList />
      </button>
      {/* <button
        className={cx('toolbar-item', {
          active: editor.isActive('orderedList'),
        })}
        title="Ordered List"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <IconOrderedList />
      </button> */}
      <button
        className={cx('toolbar-item')}
        title="Horizontal Rule"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <IconHorizontalRule />
      </button>

      <div className="ml-auto flex">
        <Divider />
        <button className="toolbar-item" title="Debug View" onClick={handleToggleMarkdown}>
          <IconDebug className="opacity-50" />
        </button>
      </div>
    </menu>
  );
}

function Divider({ className = '' }: { className?: string }) {
  return <div className={cx('divider', className)} />;
}
