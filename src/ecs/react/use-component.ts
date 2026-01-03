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

      const unsubAdd = ComponentRegistry.subscribeAdd(schema, (e) => {
        if (e === entity) {
          cacheRef.current.version++
          batchedUpdate()
        }
      })
      const unsubRemove = ComponentRegistry.subscribeRemove(schema, (e) => {
        if (e === entity) {
          cacheRef.current.version++
          batchedUpdate()
        }
      })
      return () => {
        unsubAdd()
        unsubRemove()
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
