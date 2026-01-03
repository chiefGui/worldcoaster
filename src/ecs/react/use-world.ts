import { useSyncExternalStore, useCallback, useRef } from 'react'
import { EventBus, EcsEvent } from '../event'
import { World } from '../world'
import { ReactBatch } from './batch'

export function useEntityCount(): number {
  const countRef = useRef(World.entityCount())

  const subscribe = useCallback((onStoreChange: () => void) => {
    const batchedUpdate = () => ReactBatch.schedule(onStoreChange)

    const unsubCreate = EventBus.on(EcsEvent.ENTITY_CREATED, () => {
      countRef.current = World.entityCount()
      batchedUpdate()
    })
    const unsubDestroy = EventBus.on(EcsEvent.ENTITY_DESTROYED, () => {
      countRef.current = World.entityCount()
      batchedUpdate()
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
    const batchedUpdate = () => ReactBatch.schedule(onStoreChange)

    const unsub1 = EventBus.on(EcsEvent.WORLD_STARTED, batchedUpdate)
    const unsub2 = EventBus.on(EcsEvent.WORLD_STOPPED, batchedUpdate)
    return () => {
      unsub1()
      unsub2()
    }
  }, [])

  const getSnapshot = useCallback(() => World.isRunning(), [])

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
