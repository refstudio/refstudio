import { renderHook } from '@testing-library/react';
import { useAtom, useAtomValue } from 'jotai';
import { describe, expect, test } from 'vitest';

import { selectionAtom } from './selectionState';

describe('selectionState', () => {
  test('should be empty by default', () => {
    // Note: We need to use `renderHook` to test atoms outside of react/provider
    // https://github.com/pmndrs/jotai/blob/main/docs/guides/testing.mdx#custom-hooks
    const { result } = renderHook(() => useAtom(selectionAtom));
    const [selection] = result.current;
    expect(selection).toBe('');
  });

  test('should change to string value', () => {
    const {
      result: {
        current: [selection, setSelection],
      },
    } = renderHook(() => useAtom(selectionAtom));
    setSelection('Some text that is selected');

    // Note that the atom value here is the default ("")
    expect(selection).toBe('');

    // The updated setSelection value needs to be read again with useAtomValue
    const {
      result: { current: newSelection },
    } = renderHook(() => useAtomValue(selectionAtom));
    expect(newSelection).toBe('Some text that is selected');
  });
});
