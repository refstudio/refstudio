import './MenuBar.css';

import { MarkType } from '@tiptap/pm/model';
import { Editor } from '@tiptap/react';
import * as React from 'react';

import { cx } from '../../../lib/cx';
import {
  BoldIcon,
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ItalicIcon,
  OrderedListIcon,
  RedoIcon,
  StrikethroughIcon,
  UndoIcon,
  UnorderedListIcon,
} from './icons';
import { BlockSelection } from './tipTapNodes/notionBlock/selection/BlockSelection';
import { isNotionBlockTypeActive } from './tipTapNodes/notionBlock/utils/isNotionBlockTypeActive';

export function MenuBar({ editor }: { editor: Editor }) {
  // const [markdownMode, setMarkdownMode] = React.useState(false);
  // const handleToggleMarkdown = React.useCallback(() => {
  //   if (!markdownMode) {
  //     const markdown = editor.storage.markdown.getMarkdown() as string;
  //     editor.commands.setContent({
  //       type: 'codeBlock',
  //       attrs: { language: 'markdown' },
  //       content: [{ type: 'text', text: markdown }],
  //     });
  //     setMarkdownMode(true);
  //   } else {
  //     editor.commands.setContent(editor.state.doc.child(0).content.firstChild?.text ?? '');
  //     setMarkdownMode(false);
  //   }
  // }, [editor, markdownMode]);

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

  const { selection } = editor.state;
  const isActive = (mark: MarkType) => selection instanceof BlockSelection ? selection.isMarkActive(mark) : editor.isActive(mark.name);

  return (
    <menu className="toolbar">
      <button
        className="toolbar-item"
        disabled={!editor.can().chain().focus().undo().run()}
        title="Undo"
        onClick={() => editor.chain().focus().undo().run()}
      >
        <UndoIcon />
      </button>

      <button
        className={cx('toolbar-item')}
        disabled={!editor.can().chain().focus().redo().run()}
        title="Redo"
        onClick={() => editor.chain().focus().redo().run()}
      >
        <RedoIcon />
      </button>
      <Divider />
      <button
        className={cx('toolbar-item', {
          active: isActive(editor.schema.marks.bold),
        })}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        title="Bold"
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <BoldIcon />
      </button>
      <button
        className={cx('toolbar-item', {
          active: isActive(editor.schema.marks.italic),
        })}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        title="Italic"
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <ItalicIcon />
      </button>
      <button
        className={cx('toolbar-item', {
          active: isActive(editor.schema.marks.strike),
        })}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        title="Strikethrough"
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <StrikethroughIcon />
      </button>
      <button
        className={cx('toolbar-item', {
          active: isActive(editor.schema.marks.code),
        })}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        title="Code Formatting"
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <CodeIcon />
      </button>

      <Divider />

      <button
        className={cx('toolbar-item', {
          active: editor.isActive('heading', { level: 1 }),
        })}
        title="Heading Level 1"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1Icon />
      </button>
      <button
        className={cx('toolbar-item', {
          active: editor.isActive('heading', { level: 2 }),
        })}
        title="Heading Level 2"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2Icon />
      </button>
      <button
        className={cx('toolbar-item', {
          active: editor.isActive('heading', { level: 3 }),
        })}
        title="Heading Level 3"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3Icon />
      </button>
      <Divider />

      <button
        className={cx('toolbar-item', {
          active: isNotionBlockTypeActive(editor.state.selection, 'unorderedList'),
        })}
        title="Bulleted List"
        onClick={() => editor.chain().focus().toggleUnorderedList().run()}
      >
        <UnorderedListIcon />
      </button>
      <button
        className={cx('toolbar-item', {
          active: isNotionBlockTypeActive(editor.state.selection, 'orderedList'),
        })}
        title="Ordered List"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <OrderedListIcon />
      </button>

      {/* <div className="ml-auto flex">
        <Divider />
        <button className="toolbar-item" title="Debug View" onClick={handleToggleMarkdown}>
          <IconDebug className="opacity-50" />
        </button>
      </div> */}
    </menu>
  );
}

function Divider() {
  return <div className="h-6 w-[1px] bg-card-border-primary" />;
}
