import { openDB, type IDBPDatabase } from 'idb'
import type { SerializedWorld } from './serializer'

const DB_NAME = 'worldcoaster'
const DB_VERSION = 1
const STORE_NAME = 'saves'

export class Database {
  private static db: IDBPDatabase | null = null
  private static initPromise: Promise<void> | null = null

  static async init(): Promise<void> {
    if (this.db) return
    if (this.initPromise) return this.initPromise
    this.initPromise = this.doInit()
    return this.initPromise
  }

  private static async doInit(): Promise<void> {
    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME)
        }
      },
    })
  }

  static async save(slot: string, data: SerializedWorld): Promise<void> {
    await this.init()
    await this.db!.put(STORE_NAME, data, slot)
  }

  static async load(slot: string): Promise<SerializedWorld | undefined> {
    await this.init()
    return this.db!.get(STORE_NAME, slot)
  }

  static async delete(slot: string): Promise<void> {
    await this.init()
    await this.db!.delete(STORE_NAME, slot)
  }

  static async listSlots(): Promise<string[]> {
    await this.init()
    const keys = await this.db!.getAllKeys(STORE_NAME)
    return keys as string[]
  }

  static async clear(): Promise<void> {
    await this.init()
    await this.db!.clear(STORE_NAME)
  }
}
