export const loadSeedJson = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`failed to load seed ${url}: ${res.status}`);
  return res.json();
};

const getKey = (key: string) => `mockdb:${key}:v1`;

export const ensureSeeded = async (key: string, seedUrl: string) => {
  const storageKey = getKey(key);
  const s = localStorage.getItem(storageKey);
  if (s) return JSON.parse(s);
  try {
    const data = await loadSeedJson(seedUrl);
    localStorage.setItem(storageKey, JSON.stringify(data));
    return data;
  } catch (e) {
    // fallback to empty array/object depending on seed
    const fallback = Array.isArray(dataPlaceholder(seedUrl)) ? [] : {};
    localStorage.setItem(storageKey, JSON.stringify(fallback));
    return fallback;
  }
};

const dataPlaceholder = (seedUrl: string) => {
  // rough heuristic: clients/chats are arrays, users/tenants are objects
  if (seedUrl.includes('clients') || seedUrl.includes('chats')) return [];
  return {};
};

export const readTable = async <T>(key: string, seedUrl: string): Promise<T> => {
  const storageKey = getKey(key);
  const s = localStorage.getItem(storageKey);
  if (s) return JSON.parse(s) as T;
  const data = await ensureSeeded(key, seedUrl);
  return data as T;
};

export const writeTable = <T>(key: string, data: T) => {
  const storageKey = getKey(key);
  localStorage.setItem(storageKey, JSON.stringify(data));
};

export const createRecord = async <T extends { id?: string }>(
  key: string,
  seedUrl: string,
  payload: Omit<T, 'id'>,
): Promise<T> => {
  const list = ((await readTable<T[]>(key, seedUrl)) as unknown) as T[];
  const id = `${key}-${Date.now()}`;
  const item = { ...(payload as any), id } as T;
  list.push(item);
  writeTable<T[]>(key, list);
  return item;
};

export const updateRecord = async <T extends { id: string }>(
  key: string,
  seedUrl: string,
  id: string,
  patch: Partial<T>,
): Promise<T> => {
  const list = ((await readTable<T[]>(key, seedUrl)) as unknown) as T[];
  const idx = list.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error('not found');
  const updated = { ...list[idx], ...patch } as T;
  list[idx] = updated;
  writeTable<T[]>(key, list);
  return updated;
};

export const deleteRecord = async <T extends { id: string }>(
  key: string,
  seedUrl: string,
  id: string,
): Promise<T> => {
  const list = ((await readTable<T[]>(key, seedUrl)) as unknown) as T[];
  const idx = list.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error('not found');
  const removed = list.splice(idx, 1)[0];
  writeTable<T[]>(key, list);
  return removed;
};
