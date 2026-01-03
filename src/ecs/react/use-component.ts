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
          cacheRef.current.version++
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

    if (cache.data === data) {
      return cache
    }

    cache.data = data
    return cache
  }, [entity, schema])

  const result = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return result.data
}
