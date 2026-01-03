# WorldCoaster

A Planet Coaster-inspired theme park simulation built with a custom ECS (Entity-Component-System) engine optimized for mobile browsers. Target: 60fps with 50K simulated guests.

## Architecture Overview

```
src/
├── ecs/           # Core ECS primitives (never import from framework or game)
├── framework/     # Reusable game framework (can import from ecs)
└── game/          # Game-specific content (can import from ecs and framework)
```

### Layer Rules
- `ecs/` → No external imports (pure primitives)
- `framework/` → Can import from `ecs/`
- `game/` → Can import from `ecs/` and `framework/`

---

## ECS Core (`src/ecs/`)

### Entity
An entity is just a number. No classes, no overhead.

```typescript
import { World } from '@ecs/world'

const entity = World.spawn()  // Returns: number
World.despawn(entity)
```

### Component
Components are pure data. Registered via `World.registerComponent`.

```typescript
// src/game/guest/guest.component.ts
export type GuestData = {
  state: GuestState
  targetEntity: Entity | null
  rideTimeRemaining: number
}

export const GuestComponent = World.registerComponent<GuestData>(
  'Guest',
  () => ({ state: 'idle', targetEntity: null, rideTimeRemaining: 0 })
)

// Read helper class (optional, for convenience)
export class Guest {
  static state(entity: Entity): GuestState {
    return World.get(entity, GuestComponent)?.state ?? 'idle'
  }
}
```

### System
Systems process entities each frame. Use `@System` and `@After` decorators.

```typescript
// src/game/guest/guest.system.ts
import { System, After } from '@ecs/decorator'

@System('guest')
export class GuestSystem {
  private static query: QuerySchema | null = null

  static tick(dt: number): void {
    const guests = World.query(this.query ??= World.createQuery([GuestComponent]))
    for (const entity of guests) {
      // Process guest logic
    }
  }
}

@System('queue')
@After('guest')  // Runs after guest system (dependency injection via topological sort)
export class QueueSystem {
  static tick(dt: number): void { /* ... */ }
}
```

### Query
Queries are cached and incrementally updated.

```typescript
// Cache the query schema (created once)
const guestQuery = World.createQuery([GuestComponent])
const riderQuery = World.createQuery([GuestComponent, RidingComponent])
const idleQuery = World.createQuery([GuestComponent], [RidingComponent])  // with, without

// Get matching entities (returns ReadonlySet<Entity>)
const guests = World.query(guestQuery)
```

---

## Framework (`src/framework/`)

### Stats
Numeric values on entities, tracked through the effect pipeline. Stat IDs are colocated with their domains.

```typescript
// guest.component.ts - Stats colocated with domain (symmetrical: key === value)
export const GuestStat = {
  money: 'money',
  happiness: 'happiness',
  hunger: 'hunger',
} as const

// building.component.ts
export const BuildingStat = {
  capacity: 'capacity',
  rideDuration: 'rideDuration',
  ticketPrice: 'ticketPrice',
} as const
```

```typescript
import { StatComponent, Stat } from '@framework/stat/stat.component'
import { StatAction } from '@framework/stat/stat.action'
import { GuestStat } from '@game/guest/guest.component'

// Add component when spawning
World.add(entity, StatComponent, { values: {} })

// Read base value
const money = Stat.get(entity, GuestStat.money)

// Read final value (with modifiers applied)
const speed = Stat.getFinal(entity, 'speed')

// Write (goes through EffectProcessor)
StatAction.set({ entity, statId: GuestStat.money, value: 100, source: 'spawn' })
StatAction.change({ entity, statId: GuestStat.happiness, delta: 10, source: 'ride' })
```

### Modifiers
Modifiers are entities that affect stat computation. Supports phases, stacking, duration, conditions.

```typescript
// modifier.component.ts - Tags colocated with modifier system (symmetrical)
export const ModifierTag = {
  buff: 'buff',
  debuff: 'debuff',
  consumable: 'consumable',
  permanent: 'permanent',
} as const
```

```typescript
import { ModifierAction } from '@framework/modifier/modifier.action'
import { Modifier, ModifierTag } from '@framework/modifier/modifier.component'

// Apply a modifier (creates a modifier entity)
const modEntity = ModifierAction.apply({
  targetEntity: guestEntity,
  statId: 'speed',
  phase: 'percent_add',      // See phases below
  value: 0.25,               // +25%
  source: 'coffee-buff',
  tags: [ModifierTag.buff, ModifierTag.consumable],
  duration: 30,              // Optional: expires after 30s
  stacking: {                // Optional: stacking behavior
    max: 3,
    behavior: 'refresh',     // 'refresh' | 'extend' | 'independent' | 'replace'
    valuePerStack: 0.10,
  },
  conditions: [              // Optional: only applies when conditions met
    { type: 'stat_above', params: { statId: 'happiness', threshold: 50 } }
  ],
})

// Compute final stat value (applies all modifiers)
const speed = Modifier.compute(guestEntity, 'speed', baseSpeed)

// Remove modifiers
ModifierAction.removeBySource({ source: 'coffee-buff' })
ModifierAction.removeByTag({ tag: 'debuff', targetEntity: guestEntity })
```

#### Modifier Phases (computation order)
1. `base_add` - Added to base value
2. `base_multiply` - Multiply base
3. `flat_add` - Flat addition
4. `percent_add` - Additive percentages (stack additively: +10% +10% = +20%)
5. `percent_multiply` - Multiplicative percentages (stack multiplicatively)
6. `final_add` - Final flat addition
7. `final_multiply` - Final multiplier
8. `override` - Override the value entirely
9. `min_clamp` - Set minimum value
10. `max_clamp` - Set maximum value

### Effect Processor
Intercepts all mutations for tracking, modification, or cancellation.

```typescript
import { EffectProcessor } from '@framework/effect'

// Register a handler (e.g., for achievements)
EffectProcessor.onAfter('guest:pay', (effect) => {
  totalRevenue += effect.payload.amount
  if (totalRevenue >= 10000) unlockAchievement('tycoon')
})

// Register a before handler (can modify or cancel)
EffectProcessor.onBefore('stat:change', (effect) => {
  if (effect.payload.statId === 'happiness' && hasImmunity(effect.entity)) {
    return null  // Cancel the effect
  }
  return effect  // Allow it
})

// Query effect history
const recentPayments = EffectProcessor.query({ type: 'guest:pay', since: Date.now() - 60000 })
```

### Conditions (Extensible)
Register custom condition evaluators for modifiers.

```typescript
import { ConditionRegistry } from '@framework/modifier/modifier.component'

ConditionRegistry.register('stat_above', (entity, params) => {
  const value = Stat.get(entity, params.statId as string)
  return value > (params.threshold as number)
})

ConditionRegistry.register('has_tag', (entity, params) => {
  // Custom logic
})
```

---

## Game Layer (`src/game/`)

### Domain Structure
Each domain has its own folder with colocated files:

```
src/game/guest/
├── guest.component.ts   # GuestComponent + Guest read helpers
├── guest.action.ts      # GuestAction mutations
└── guest.system.ts      # GuestSystem tick logic
```

### Actions vs Read Helpers
- **Actions** = Mutations that go through EffectProcessor (create, update, delete)
- **Read helpers** = Pure reads on component data (no side effects)

```typescript
// guest.component.ts - Read helpers
export class Guest {
  static state(entity: Entity): GuestState { /* read only */ }
  static canAfford(entity: Entity, amount: number): boolean { /* read only */ }
}

// guest.action.ts - Mutations
export class GuestAction {
  static spawn(params: SpawnGuestParams): Entity | null { /* creates entity */ }
  static pay(params: PayParams): boolean { /* modifies state */ }
  static changeState(params: ChangeStateParams): boolean { /* modifies state */ }
}
```

---

## React Integration (`src/ecs/react/`)

Hooks use `useSyncExternalStore` with batched updates (one React render per frame).

```typescript
import { useQuery } from '@ecs/react/use-query'
import { useComponent } from '@ecs/react/use-component'
import { useEntityCount, useWorldRunning } from '@ecs/react/use-world'

function GuestList() {
  const guests = useQuery([GuestComponent])
  return <>{guests.map(id => <GuestCard key={id} entity={id} />)}</>
}

function GuestCard({ entity }: { entity: Entity }) {
  const guest = useComponent(entity, GuestComponent)
  if (!guest) return null
  return <div>{guest.state}</div>
}
```

---

## Game Loop

```typescript
import { Game } from '@framework/setup'

// Start the game (registers systems, starts loop)
Game.start()

// Stop
Game.stop()

// Reset everything
Game.reset()
```

The game loop runs at 60fps via `requestAnimationFrame`. Each frame:
1. Process component change queue (incremental query updates)
2. Run systems in topological order
3. Flush dirty queries (notify React)
4. Batch event dispatches

---

## Patterns for New Gameplay

### Adding a New Stat
Just use it - stats are dynamic:
```typescript
StatAction.set({ entity, statId: 'thirst', value: 0, source: 'spawn' })
```

### Adding a New Modifier Type
Create a modifier with appropriate phase:
```typescript
ModifierAction.apply({
  targetEntity,
  statId: 'speed',
  phase: 'percent_multiply',
  value: 0.5,  // -50% (multiply by 0.5)
  source: 'mud-debuff',
  tags: ['debuff', 'environment'],
})
```

### Adding a New System
1. Create `src/game/domain/domain.system.ts`
2. Use `@System('name')` and optionally `@After('dependency')`
3. Implement `static tick(dt: number): void`
4. Register in `src/framework/setup.ts`

### Adding a New Component
1. Create `src/game/domain/domain.component.ts`
2. Register with `World.registerComponent`
3. Add read helper class if needed
4. Create `domain.action.ts` for mutations

### Adding a New Condition
```typescript
ConditionRegistry.register('is_vip', (entity, _params) => {
  return World.has(entity, VipComponent)
})
```

---

## Performance Guidelines

1. **Cache queries** - Don't call `World.createQuery` in tick, cache it
2. **Avoid allocations** - Don't create arrays/objects in hot paths
3. **Use entity numbers** - Entities are just numbers, no wrapper objects
4. **Batch React updates** - Hooks use `ReactBatch`, one render per frame
5. **Incremental queries** - Query cache updates incrementally, not rebuilt

---

## File Naming Conventions

- Folders: singular, kebab-case (`guest/`, `building/`)
- Files: kebab-case (`guest.component.ts`, `guest.action.ts`)
- One export per file (except types)
- Colocate by domain, not by type

---

## Type Conventions

- Use `type` not `interface`
- Use named parameters (object destructuring) for functions with 2+ params
- Static classes instead of loose exported functions
- Strongly typed events, stats, and tags (see `@ecs/event.ts` pattern)
