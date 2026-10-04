import { getDb, SETTINGS_STORE } from './db';
import type { AppSettings } from './types';

export async function getSetting<K extends keyof AppSettings>(key: K): Promise<AppSettings[K] | undefined> {
  const db = await getDb();
  return (await db.get(SETTINGS_STORE, key)) as AppSettings[K] | undefined;
}

export async function setSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<void> {
  const db = await getDb();
  await db.put(SETTINGS_STORE, value, key);
}
