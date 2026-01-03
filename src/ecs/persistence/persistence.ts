import { Database } from './database'
import { WorldSerializer } from './serializer'
import { World } from '../world'
import { Tag } from '../tag'

export class Persistence {
  private static autoSaveInterval: number | null = null
  private static readonly DEFAULT_SLOT = 'autosave'

  static async save(slot = this.DEFAULT_SLOT): Promise<void> {
    const data = WorldSerializer.serialize()
    await Database.save(slot, data)
  }

  static async load(slot = this.DEFAULT_SLOT): Promise<boolean> {
    const data = await Database.load(slot)
    if (!data) return false
    World.clear()
    Tag.clear()
    WorldSerializer.deserialize(data)
    return true
  }

  static async delete(slot = this.DEFAULT_SLOT): Promise<void> {
    await Database.delete(slot)
  }

  static async hasSave(slot = this.DEFAULT_SLOT): Promise<boolean> {
    const data = await Database.load(slot)
    return data !== undefined
  }

  static startAutoSave(intervalMs = 30000): void {
    this.stopAutoSave()
    this.autoSaveInterval = window.setInterval(() => {
      this.save().catch(console.error)
    }, intervalMs)
  }

  static stopAutoSave(): void {
    if (this.autoSaveInterval !== null) {
      clearInterval(this.autoSaveInterval)
      this.autoSaveInterval = null
    }
  }
}
