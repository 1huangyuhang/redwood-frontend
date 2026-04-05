import {
  loadColumnVisibility,
  saveColumnVisibility,
} from './persistedTableColumns';

describe('persistedTableColumns', () => {
  const key = 'jest-test-cols-v1';

  beforeEach(() => {
    localStorage.removeItem(key);
  });

  it('returns defaults when storage empty', () => {
    const v = loadColumnVisibility(key, ['a', 'b'], true);
    expect(v).toEqual({ a: true, b: true });
  });

  it('merges stored booleans', () => {
    saveColumnVisibility(key, { a: false, b: true });
    const v = loadColumnVisibility(key, ['a', 'b'], true);
    expect(v.a).toBe(false);
    expect(v.b).toBe(true);
  });

  it('ignores invalid JSON', () => {
    localStorage.setItem(key, '{not json');
    const v = loadColumnVisibility(key, ['x'], true);
    expect(v.x).toBe(true);
  });
});
