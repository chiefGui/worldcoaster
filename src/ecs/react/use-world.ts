import { useState, useEffect } from 'react'
import { EventBus, EcsEvent } from '../event'
import { World } from '../world'

export function useEntityCount(): number {
  const [count, setCount] = useState(World.entityCount())

  useEffect(() => {
    const update = () => setCount(World.entityCount())
    const unsub1 = EventBus.on(EcsEvent.ENTITY_CREATED, update)
    const unsub2 = EventBus.on(EcsEvent.ENTITY_DESTROYED, update)
    return () => {
      unsub1()
      unsub2()
    }
  }, [])

  return count
}

export function useWorldRunning(): boolean {
  const [running, setRunning] = useState(World.isRunning())

  useEffect(() => {
    const unsub1 = EventBus.on(EcsEvent.WORLD_STARTED, () => setRunning(true))
    const unsub2 = EventBus.on(EcsEvent.WORLD_STOPPED, () => setRunning(false))
    return () => {
      unsub1()
      unsub2()
    }
  }, [])

  return running
}

export function useTick<T>(getValue: () => T): T {
  const [value, setValue] = useState<T>(getValue)

  useEffect(() => {
    const unsub = EventBus.on(EcsEvent.WORLD_TICK, () => {
      setValue(getValue())
    })
    return unsub
  }, [getValue])

  return value
}
