import { useSyncExternalStore, useCallback, useRef } from 'react'
import type { Entity } from '../entity'
import type { ComponentData, ComponentSchema } from '../component'
import { ComponentRegistry } from '../component'

export function useComponent<T extends ComponentData>(
  entity: Entity,
  schema: ComponentSchema<T>
): T | undefined {
  const versionRef = useRef(0)

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const unsubAdd = ComponentRegistry.subscribeAdd(schema, (e) => {
        if (e === entity) {
          versionRef.current++
          onStoreChange()
        }
      })
      const unsubRemove = ComponentRegistry.subscribeRemove(schema, (e) => {
        if (e === entity) {
          versionRef.current++
          onStoreChange()
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
    return data ? { version: versionRef.current, data } : undefined
  }, [entity, schema])

  const result = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return result?.data as T | undefined
}
