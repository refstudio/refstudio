import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UnlistenFn } from '@tauri-apps/api/event';
import { render } from '@testing-library/react';
import { default as userEvent } from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';

import { listenEvent, RefStudioEventCallback, RefStudioEventName, RefStudioEventPayload } from '../events';

function customRender(ui: React.ReactElement, options = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return render(ui, {
    // wrap provider(s) here if needed
    wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    ...options,
  });
}

export * from '@testing-library/react';
// override render export
export { customRender as render };

export { userEvent };

export function setup(jsx: React.ReactElement) {
  return {
    user: userEvent.setup(),
    ...customRender(jsx),
  };
}

/** Renders given fragment with a jotai store wrapped context */
export function setupWithJotaiProvider(jsx: React.ReactNode, store?: ReturnType<typeof createStore>) {
  store = store ?? createStore();
  return {
    store,
    ...setup(<Provider store={store}>{jsx}</Provider>),
  };
}

/**
 * Utility method to mock the listenEvent method.
 *
 * This method will register the mock with a custom implementation of the listen
 * that captures (and returns) the registered eventName and returns a fireEvent
 * function that simulates the event being fired.
 *
 * Usage:
 *
 *   const mock = mockListenEvent();                              // create the mock
 *   render(...)                                                  // render a component that listen to events
 *   expect(mock.registerEventName).toBe("expected-event-name")   // expect the registry of the correct name
 *   act(() => mock.trigger())                                    // To simulate the registered event to be triggered
 *
 */
export function mockListenEvent() {
  const current: {
    [Event in RefStudioEventName]?: {
      id: number;
      handler: (payload?: RefStudioEventPayload<Event>) => void;
      deleted?: boolean;
    }[];
  } = {};
  let currentId = 0;

  vi.mocked(listenEvent).mockImplementation(
    <Event extends RefStudioEventName>(event: Event, handler: RefStudioEventCallback<Event>): Promise<UnlistenFn> => {
      if (!(event in current)) {
        current[event] = [];
      }
      const id = currentId++;
      current[event]!.push({
        id,
        handler: (payload) => handler({ event, windowLabel: '', id: 0, payload } as Parameters<typeof handler>[0]),
      });

      return Promise.resolve(() => {
        current[event]!.find((eventHandler) => eventHandler.id === id)!.deleted = true;
      });
    },
  );

  const trigger = <Event extends RefStudioEventName>(eventName: Event, payload?: RefStudioEventPayload<Event>) => {
    if (eventName in current) {
      current[eventName]!.filter((eventHandler) => !eventHandler.deleted).forEach((eventHandler) =>
        eventHandler.handler(payload),
      );
    } else {
      throw new Error(`Received unexpected event ${eventName}`);
    }
  };

  return {
    trigger,
    get registeredEventNames() {
      return (Object.keys(current) as RefStudioEventName[]).filter((event) =>
        current[event]!.some((eventHandler) => !eventHandler.deleted),
      );
    },
  };
}
