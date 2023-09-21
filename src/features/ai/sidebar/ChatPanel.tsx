import { useAtom, useAtomValue } from 'jotai';
import { useEffect, useRef, useState } from 'react';

import { chatInteraction } from '../../../api/chat';
import { chatThreadAtom } from '../../../atoms/chatState';
import { projectIdAtom } from '../../../atoms/projectState';
import { PanelWrapper } from '../../../components/PanelWrapper';
import { cx } from '../../../lib/cx';
import { LoadingIcon, SendIcon } from '../../components/icons';

interface ChatThreadItem {
  id: string;
  question: string;
  answer?: string;
}
type ChatThread = ChatThreadItem[];

export function ChatbotPanel() {
  const projectId = useAtomValue(projectIdAtom);
  const [text, setText] = useState('');

  const [chatThread, setChatThread] = useAtom(chatThreadAtom);
  const [currentChatThreadItem, setCurrentChatThreadItem] = useState<ChatThreadItem | null>(null);

  const handleKeyDown = (evt: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (!evt.shiftKey && evt.code === 'Enter') {
      evt.preventDefault();
      handleChat(text);
      return;
    }
  };

  const handleChat = (question: string) => {
    if (!question || currentChatThreadItem) {
      return;
    }

    const chatId = String(chatThread.length + 1);
    setCurrentChatThreadItem({ id: chatId, question: text });
    setText('');

    chatInteraction(projectId, question, (_, fullAnswer) => {
      setCurrentChatThreadItem({ id: chatId, question: text, answer: fullAnswer });
    })
      .then((answer) => {
        setChatThread([...chatThread, { id: String(chatThread.length + 1), question: text, answer }]);
        setCurrentChatThreadItem(null);
      })
      .catch((err) => {
        console.error('Error calling chat', err);
        setChatThread([
          ...chatThread,
          { id: String(chatThread.length + 1), question: text, answer: `ERROR: ${String(err)}` },
        ]);
        setCurrentChatThreadItem(null);
      });
  };

  return (
    <PanelWrapper title="Chatbot">
      <div className="flex flex-1 flex-col items-center justify-end self-stretch overflow-y-hidden pt-2">
        <ChatThreadBlock thread={currentChatThreadItem ? [...chatThread, currentChatThreadItem] : chatThread} />
      </div>
      <div className="flex flex-col items-start justify-end self-stretch p-4">
        <MessageBox
          disabled={!!currentChatThreadItem}
          value={text}
          onChange={setText}
          onChat={handleChat}
          onKeyDown={handleKeyDown}
        />
      </div>
    </PanelWrapper>
  );
}

function ChatThreadBlock({ thread }: { thread: ChatThread }) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Despite what typescript says, scrollIntoView is undefined when running unit tests
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    messagesEndRef.current?.scrollIntoView?.();
  }, [thread]);

  return (
    <div className="w-full overflow-y-auto">
      {thread.map((chat) => (
        <div key={chat.id}>
          <ChatThreadItemBlock actor="user" text={chat.question} />
          <ChatThreadItemBlock actor="ai" text={chat.answer} />
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

function ChatThreadItemBlock({ text, actor }: { text?: string; actor: 'user' | 'ai' }) {
  return (
    <div
      className={cx('flex items-center gap-2 self-stretch p-4', {
        'bg-side-bar-bg-secondary': actor === 'ai',
      })}
    >
      {text ?? (
        <div data-testid="chatLoadingAnimation">
          <LoadingIcon />
        </div>
      )}
    </div>
  );
}

interface MessageBoxProps {
  disabled: boolean;
  value: string;
  onChange: (newValue: string) => void;
  onChat: (question: string) => void;
  onKeyDown: (evt: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}
function MessageBox({ disabled, value, onChange, onChat, onKeyDown }: MessageBoxProps) {
  return (
    <div
      className={cx(
        'flex items-end justify-end gap-2 self-stretch p-2',
        'rounded-default border border-solid border-input-border-default',
      )}
    >
      <textarea
        className={cx(
          'flex flex-1 resize-none items-end justify-end gap-2 p-2 outline-none',
          'text-input-txt-primary placeholder:text-input-txt-placeholder',
          { 'text-input-txt-disabled placeholder:text-input-txt-disabled': disabled },
        )}
        disabled={disabled}
        placeholder="Ask questions about your references to start chatting..."
        rows={3}
        value={value}
        onChange={(evt) => onChange(evt.currentTarget.value)}
        onKeyDown={onKeyDown}
      />
      <button
        aria-disabled={!value}
        className={cx(
          'flex h-8 w-8 items-center justify-center rounded-default',
          'bg-btn-bg-primary-default text-btn-ico-primary-default',
          { 'bg-btn-bg-primary-disabled text-btn-ico-primary-disabled': !value },
        )}
        disabled={!value}
        title="Send"
        onClick={() => onChat(value)}
      >
        <SendIcon />
      </button>
    </div>
  );
}
