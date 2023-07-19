import { waitFor } from '@testing-library/react';
import { createStore } from 'jotai';

import { getIngestedReferences } from '../../api/ingestion';
import { runGetAtomHook } from '../../atoms/__tests__/test-utils';
import { getReferencesAtom } from '../../atoms/referencesState';
import { RefStudioEventName } from '../../events';
import { REFERENCES } from '../../features/references/__tests__/test-fixtures';
import { act, mockListenEvent, setupWithJotaiProvider } from '../../test/test-utils';
import { EventsListener } from '../EventsListener';

vi.mock('../../events');
vi.mock('../../api/ingestion');

vi.mocked(getIngestedReferences).mockResolvedValue(REFERENCES);

const loadReferencesEvent: RefStudioEventName = 'refstudio://references/load';

describe('EventsListener.references', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it(`should listen to ${loadReferencesEvent} event`, () => {
    const mockData = mockListenEvent();

    setupWithJotaiProvider(<EventsListener />, store);

    expect(mockData.registeredEventNames).toContain<RefStudioEventName>(loadReferencesEvent);
  });

  it(`should set ingested references when ${loadReferencesEvent} event is triggered`, async () => {
    const mockData = mockListenEvent();
    const references = runGetAtomHook(getReferencesAtom, store);

    setupWithJotaiProvider(<EventsListener />, store);

    expect(references.current).toHaveLength(0);

    act(() => mockData.trigger(loadReferencesEvent));

    await waitFor(() => expect(references.current).toHaveLength(REFERENCES.length));
  });
});
