import { defineBuilding } from '@game/building/building.component'

export const carousel = defineBuilding({
  id: 'carousel',
  name: 'Carousel',
  input: [{ stat: 'money', amount: 5 }],
  output: [{ stat: 'happiness', amount: 10 }],
  capacity: 12,
  duration: 3,
})
