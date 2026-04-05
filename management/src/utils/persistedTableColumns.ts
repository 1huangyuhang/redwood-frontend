/** 列表「列设置」localStorage 读写，key 为列 dataIndex/key */

export function loadColumnVisibility(
  storageKey: string,
  keys: readonly string[],
  defaultVisible = true
): Record<string, boolean> {
  const base: Record<string, boolean> = {};
  for (const k of keys) base[k] = defaultVisible;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    for (const k of keys) {
      if (typeof parsed[k] === 'boolean') base[k] = parsed[k];
    }
    return base;
  } catch {
    return base;
  }
}

export function saveColumnVisibility(
  storageKey: string,
  vis: Record<string, boolean>
): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(vis));
  } catch {
    /* quota / private mode */
  }
}
