import { useState } from 'react';
import { VscMegaphone, VscRunAll, VscWand } from 'react-icons/vsc';

import { chatWithAI } from '../../api/chat';
import { PanelSection } from '../../components/PanelSection';
import { cx } from '../../cx';

interface ChatThreadItem {
  id: string;
  question: string;
  answer?: string;
}
type ChatThread = ChatThreadItem[];

export function ChatPanelSection() {
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

  function handleKeyDown(evt: React.KeyboardEvent<HTMLTextAreaElement>): void {
    if (!evt.shiftKey && evt.code === 'Enter') {
      evt.preventDefault();
      handleChat(text);
      return;
    }
  }

  function handleChat(question: string) {
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
      });
  }

  return (
    <PanelSection grow title="Chat">
      <div className="ml-4 mr-6 grid min-h-[400px] grid-rows-[1fr_auto] gap-4">
        <ChatThreadBlock
          className="border border-slate-100 bg-slate-50"
          thread={currentChatThreadItem ? [...chatThread, currentChatThreadItem] : chatThread}
        />
        <div className="flex grow gap-2 rounded-xl border border-slate-200 p-2 shadow-lg shadow-slate-200">
          <textarea
            className="grow resize-none p-2 outline-none"
            disabled={!!currentChatThreadItem}
            placeholder="Send a message."
            rows={3}
            value={text}
            onChange={(evt) => setText(evt.currentTarget.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex grow-0 items-end">
            <VscRunAll
              className="cursor-pointer hover:text-primary-hover"
              size={20}
              title="Send"
              onClick={() => handleChat(text)}
            />
          </div>
        </div>
      </div>
    </PanelSection>
  );
}

function ChatThreadBlock({ thread, className = '' }: { className?: string; thread: ChatThread }) {
  if (thread.length === 0) {
    return (
      <div className={cx(className, 'p-4 text-sm text-slate-500')}>
        <em>Your chat history will be shown here.</em>
      </div>
    );
  }
  return (
    <div className={className}>
      {thread.map((chat) => (
        <div key={chat.id}>
          <ChatThreadItemBlock actor="user" text={chat.question} />
          <ChatThreadItemBlock actor="ai" text={chat.answer} />
        </div>
      ))}
    </div>
  );
}

function ChatThreadItemBlock({ text, actor }: { text?: string; actor: 'user' | 'ai' }) {
  return (
    <div
      className={cx('grid grid-cols-[auto_1fr] items-center gap-2 p-2 pb-4', {
        'bg-gray-200': actor === 'ai',
      })}
    >
      <div className="flex shrink-0 items-start self-start">
        {actor === 'user' && <VscMegaphone size="24" />}
        {actor === 'ai' && <VscWand size="24" />}
      </div>
      <div>
        <div>{text ?? '...'}</div>
      </div>
    </div>
  );
}
