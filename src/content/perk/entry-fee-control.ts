import { definePerk } from '@game/perk'

export const entryFeeControl = definePerk({
  id: 'entry-fee-control',
  name: 'Entry Fee Control',
  description: 'Unlock the ability to set custom entry fees for your park. Increase revenue by charging guests at the gate.',
  category: 'management',
  cost: 1000,
  requirements: {
    minDay: 3,
    minAttractiveness: 5,
  },
})
