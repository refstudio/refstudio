import { useEffect, useRef, useState } from 'react';

import { chatWithAI } from '../../../api/chat';
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
  const [text, setText] = useState('');

  const [chatThread, setChatThread] = useState<ChatThread>([
    // {
    //   id: '1',
    //   question: 'What is your name?',
    //   answer:
    //     'I am an AI language model and do not have a name. How may I assist you with your query related to the given context?',
    // },
    // {
    //   id: '2',
    //   question: 'What can you tell me about hidden feedback loops in machine learning?',
    //   answer:
    //     'Hidden feedback loops in machine learning refer to situations where two systems indirectly influence each other through the world, leading to changes in behavior that may not be immediately visible. These loops may exist between completely disjoint systems and can make analyzing the effect of proposed changes extremely difficult, adding cost to even simple improvements. It is recommended to look carefully for hidden feedback loops and remove them whenever feasible.',
    // },
  ]);
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
    setCurrentChatThreadItem({ id: String(chatThread.length + 1), question: text });
    setText('');
    chatWithAI(question)
      .then((reply) => {
        setChatThread([...chatThread, { id: String(chatThread.length + 1), question: text, answer: reply[0] }]);
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
      className={cx('g-2 flex items-center self-stretch p-4', {
        'bg-side-bar-bg-secondary': actor === 'ai',
      })}
    >
      {text ?? <LoadingIcon />}
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
        'g-2 flex items-end justify-end self-stretch p-2',
        'rounded-default border border-solid border-input-border',
      )}
    >
      <textarea
        className={cx(
          'g-2 flex flex-1 resize-none items-end justify-end p-2 outline-none',
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
        aria-disabled={disabled}
        className={cx(
          'flex h-8 w-8 items-center justify-center rounded-default',
          'bg-btn-bg-primary-default text-btn-ico-primary-default',
          { 'bg-btn-bg-primary-disabled text-btn-ico-primary-disabled': disabled },
        )}
        disabled={disabled}
        title="Send"
        onClick={() => onChat(value)}
      >
        <SendIcon />
      </button>
    </div>
  );
}
