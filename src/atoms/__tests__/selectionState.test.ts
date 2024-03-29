import { useAtom } from 'jotai';

import { act, renderHook } from '../../test/test-utils';
import { selectionAtom } from '../selectionState';

describe('selectionState', () => {
  it('should be empty by default', () => {
    // Note: We need to use `renderHook` to test atoms outside of react/provider
    // https://github.com/pmndrs/jotai/blob/main/docs/guides/testing.mdx#custom-hooks
    const { result } = renderHook(() => useAtom(selectionAtom));
    const [selection] = result.current;
    expect(selection).toBe('');
  });

  it('should change to string value', () => {
    const { result } = renderHook(() => useAtom(selectionAtom));
    const [selection, setSelection] = result.current;
    expect(selection).toBe('');

    act(() => setSelection('Some text that is selected'));

    const [newSelection] = result.current;
    expect(newSelection).toBe('Some text that is selected');
  });
});
