# WorldCoaster

Theme park simulation with custom ECS optimized for mobile. Target: 60fps, 50K guests.

## Architecture

```
src/
├── ecs/           # Core primitives (no external imports)
├── framework/     # Reusable framework (imports ecs)
├── game/          # Game logic (imports ecs + framework)
├── content/       # Game data (building definitions, etc.)
└── ui/            # Presentation layer (React)
    ├── primitive/ # Headless, state-only components
    ├── component/ # Styled, reusable components
    ├── feature/   # Domain-specific composed features
    └── layout/    # Page-level compositions
```

## Code Conventions

**Use static classes for functions, individual exports only for types:**

```typescript
// ✅ Good - static class
export class StatEffectUtil {
  static sum(effects: StatEffect[], stat: string): number { /* ... */ }
  static find(effects: StatEffect[], stat: string): StatEffect | undefined { /* ... */ }
}

// ❌ Bad - multiple function exports
export function sumEffects(...) { }
export function findEffect(...) { }

// ✅ Types can be individual exports
export type StatEffect = { stat: string; amount: number }
```

## ECS Core

```typescript
// Entity = number
const entity = World.spawn()
World.despawn(entity)

// Component = pure data
const GuestComponent = World.registerComponent<GuestData>('Guest', defaultFn)
World.add(entity, GuestComponent, data)
World.get(entity, GuestComponent)

// Query = cached, incremental
const query = World.createQuery([GuestComponent], [ExcludedComponent])
World.query(query)  // ReadonlySet<Entity>

// System = decorated class
@System('guest')
@After('input')  // topological sort
export class GuestSystem {
  static tick(dt: number): void { /* ... */ }
}
```

## Tags

Lightweight entity labels (no component overhead). Mutually exclusive via `Tag.set`.

```typescript
import { Tag } from '@ecs/tag'

// State tags (colocated with domain)
export const GuestState = {
  idle: 'guest:idle',
  riding: 'guest:riding',
} as const

Tag.add(entity, GuestState.idle)
Tag.has(entity, GuestState.idle)
Tag.set(entity, GuestState.riding, Object.values(GuestState))  // exclusive
Tag.entities('guest:idle')  // all entities with tag
```

## Stats & Modifiers

```typescript
// Stats - symmetrical keys (key === value)
export const GuestStat = { money: 'money', happiness: 'happiness' } as const

Stat.get(entity, GuestStat.money)
Stat.getFinal(entity, 'speed')  // with modifiers applied
StatAction.change({ entity, statId: 'happiness', delta: 10, source: 'ride' })

// Modifiers - entities that affect stat computation
ModifierAction.apply({
  targetEntity, statId: 'speed', phase: 'percent_add', value: 0.25,
  source: 'coffee', tags: [ModifierTag.buff],
})

// Phases: base_add → base_multiply → flat_add → percent_add →
//         percent_multiply → final_add → final_multiply → override → clamps
```

## Domain Structure

```
src/game/guest/
├── guest.component.ts   # Data + read helpers + state tags
├── guest.action.ts      # Mutations (via EffectProcessor)
└── guest.system.ts      # Tick logic
```

**Read helpers** = pure reads. **Actions** = mutations through EffectProcessor.

## React Integration

```typescript
const guests = useQuery([GuestComponent])
const data = useComponent(entity, GuestComponent)
```

## Content Definitions

Building definitions live in `content/building/`. Use `defineBuilding` for type-safe definitions with hook support:

```typescript
// content/building/carousel.ts
import { defineBuilding } from '@game/building/building.component'

export const carousel = defineBuilding({
  id: 'carousel',
  name: 'Carousel',
  input: [{ stat: 'money', amount: 5 }],
  output: [{ stat: 'happiness', amount: 10 }],
  capacity: 12,
  duration: 3,
  // Optional hooks
  onBuild: (entity) => { /* ... */ },
  onDestroy: (entity) => { /* ... */ },
})
```

## Quick Reference

| Add stat | `StatAction.set({ entity, statId, value, source })` |
|----------|-----------------------------------------------------|
| Add modifier | `ModifierAction.apply({ targetEntity, statId, phase, value, source })` |
| Add system | `@System('name')` + `static tick(dt)` |
| Add tag | `Tag.add(entity, 'mytag')` |
| State machine | `Tag.set(entity, newState, allStates)` |
| Add building | `defineBuilding({ id, name, input, output, capacity, duration })` |
