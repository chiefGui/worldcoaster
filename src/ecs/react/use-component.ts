import { useState, useEffect } from 'react'
import type { Entity } from '../entity'
import type { ComponentData, ComponentSchema } from '../component'
import { ComponentRegistry } from '../component'

/**
 * Dead simple component hook.
 * - useState to force re-renders
 * - useEffect to subscribe/unsubscribe
 * - React 18 handles batching automatically
 */
export function useComponent<T extends ComponentData>(
  entity: Entity,
  schema: ComponentSchema<T>
): T | undefined {
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    const handler = (e: Entity) => {
      if (e === entity) {
        forceUpdate(v => v + 1)
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
  }, [entity, schema])

  return ComponentRegistry.get(entity, schema)
}
