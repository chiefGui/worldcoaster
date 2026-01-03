import { useSyncExternalStore, useCallback, useRef } from 'react'
import { EventBus } from '../event'
import { World } from '../world'

export function useEntityCount(): number {
  const countRef = useRef(World.entityCount())

  const subscribe = useCallback((onStoreChange: () => void) => {
    const unsubCreate = EventBus.on('entity:created', () => {
      countRef.current = World.entityCount()
      onStoreChange()
    })
    const unsubDestroy = EventBus.on('entity:destroyed', () => {
      countRef.current = World.entityCount()
      onStoreChange()
    })
    return () => {
      unsubCreate()
      unsubDestroy()
    }
  }, [])

  const getSnapshot = useCallback(() => World.entityCount(), [])

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function useWorldRunning(): boolean {
  const subscribe = useCallback((onStoreChange: () => void) => {
    const unsub1 = EventBus.on('world:started', onStoreChange)
    const unsub2 = EventBus.on('world:stopped', onStoreChange)
    return () => {
      unsub1()
      unsub2()
    }
  }, [])

  const getSnapshot = useCallback(() => World.isRunning(), [])

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
