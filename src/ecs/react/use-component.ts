import { useSyncExternalStore, useCallback, useRef } from 'react'
import type { Entity } from '../entity'
import type { ComponentData, ComponentSchema } from '../component'
import { ComponentRegistry } from '../component'
import { ReactBatch } from './batch'

export function useComponent<T extends ComponentData>(
  entity: Entity,
  schema: ComponentSchema<T>
): T | undefined {
  const cacheRef = useRef<{ version: number; data: T | undefined }>({ version: 0, data: undefined })

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const batchedUpdate = () => ReactBatch.schedule(onStoreChange)

      const handler = (e: Entity) => {
        if (e === entity) {
          batchedUpdate()
        }
      }

      const unsubAdd = ComponentRegistry.subscribeAdd(schema, handler)
      const unsubRemove = ComponentRegistry.subscribeRemove(schema, handler)
      const unsubChange = ComponentRegistry.subscribeChange(schema, handler)
      return () => {
        unsubAdd()
        unsubRemove()
        unsubChange()
      }
    },
    [entity, schema]
  )

  const getSnapshot = useCallback(() => {
    const data = ComponentRegistry.get(entity, schema)
    const cache = cacheRef.current

    // Return same cache if data unchanged (reference equality)
    if (cache.data === data) {
      return cache
    }

    // Create NEW cache object when data changes - React compares by reference
    const newCache = { version: cache.version + 1, data }
    cacheRef.current = newCache
    return newCache
  }, [entity, schema])

  const result = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return result.data
}
