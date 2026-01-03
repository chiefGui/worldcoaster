import { useSyncExternalStore, useCallback, useRef, useMemo } from 'react'
import type { Entity } from '../entity'
import type { ComponentSchema } from '../component'
import type { QuerySchema } from '../query'
import { World } from '../world'
import { QueryManager } from '../query'

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
        onStoreChange()
      })
    },
    [query]
  )

  const getSnapshot = useCallback(() => {
    const set = QueryManager.get(query)
    const arr = Array.from(set)
    if (
      arr.length !== cacheRef.current.length ||
      arr.some((e, i) => e !== cacheRef.current[i])
    ) {
      cacheRef.current = arr
    }
    return cacheRef.current
  }, [query])

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
