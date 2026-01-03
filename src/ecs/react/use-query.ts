import { useState, useEffect, useMemo } from 'react'
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
  const [entities, setEntities] = useState<readonly Entity[]>(() =>
    Array.from(QueryManager.get(query))
  )

  useEffect(() => {
    const unsub = QueryManager.subscribe(query, () => {
      setEntities(Array.from(QueryManager.get(query)))
    })
    return unsub
  }, [query])

  return entities
}
