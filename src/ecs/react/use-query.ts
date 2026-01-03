import { useSyncExternalStore, useCallback, useRef, useMemo } from 'react'
import type { Entity } from '../entity'
import type { ComponentSchema } from '../component'
import type { QuerySchema } from '../query'
import { World } from '../world'
import { QueryManager } from '../query'
import { ReactBatch } from './batch'

export function useQuery(
  withSchemas: readonly ComponentSchema[],
  without?: readonly ComponentSchema[]
): readonly Entity[] {
  const query = useMemo(
    () => World.createQuery(withSchemas, without),
    [withSchemas, without]
  )

  return useQuerySchema(query)
}

export function useQuerySchema(query: QuerySchema): readonly Entity[] {
  const versionRef = useRef(0)
  const cacheRef = useRef<readonly Entity[]>([])

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      return QueryManager.subscribe(query, () => {
        versionRef.current++
        ReactBatch.schedule(onStoreChange)
      })
    },
    [query]
  )

  const getSnapshot = useCallback(() => {
    const set = QueryManager.get(query)
    if (set.size !== cacheRef.current.length) {
      cacheRef.current = Array.from(set)
    } else {
      let i = 0
      let dirty = false
      for (const entity of set) {
        if (cacheRef.current[i] !== entity) {
          dirty = true
          break
        }
        i++
      }
      if (dirty) {
        cacheRef.current = Array.from(set)
      }
    }
    return cacheRef.current
  }, [query])

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
