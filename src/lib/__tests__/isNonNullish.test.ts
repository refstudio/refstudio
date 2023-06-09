import { isNonNullish } from '../isNonNullish';

describe('isNonNullish', () => {
  it('should filter null values', () => {
    const out = [1, 2, null, 3].filter(isNonNullish);
    expect(out.length).toBe(3);
  });

  it('should filter undefined values', () => {
    const out = [1, 2, null, 3, undefined, 4].filter(isNonNullish);
    expect(out.length).toBe(4);
  });
});
