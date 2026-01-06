import { definePerk } from '@game/perk'

export const efficientOperations = definePerk({
  id: 'efficient-operations',
  name: 'Efficient Operations',
  description: 'Streamline your park operations. Reduce building upkeep costs by 10%.',
  category: 'economy',
  cost: 750,
  requirements: {
    minDay: 5,
  },
})
