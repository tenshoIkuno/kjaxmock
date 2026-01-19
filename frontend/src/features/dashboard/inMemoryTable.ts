import { mockBusinessRecords, BusinessRecord } from './mockBusinessRecords';

const STORAGE_KEY = 'mock_business_records_v1';

const readStorage = (): BusinessRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...mockBusinessRecords];
    return JSON.parse(raw) as BusinessRecord[];
  } catch (e) {
    return [...mockBusinessRecords];
  }
};

const writeStorage = (rows: BusinessRecord[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch (e) {
    // ignore
  }
};

export const getTableRecords = (): BusinessRecord[] => readStorage();

export const setTableRecords = (rows: BusinessRecord[]) => {
  writeStorage(rows);
  return getTableRecords();
};

// add new records at the front, avoiding duplicates by 整理番号
export const addTableRecords = (newRows: BusinessRecord[]) => {
  const cur = readStorage();
  const existingNos = new Set(cur.map((r) => r.整理番号));
  const merged = [...newRows.filter((r) => !existingNos.has(r.整理番号)), ...cur];
  writeStorage(merged);
  return merged;
};

export const clearTableRecords = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
};

export default {
  getTableRecords,
  setTableRecords,
  addTableRecords,
  clearTableRecords,
};
