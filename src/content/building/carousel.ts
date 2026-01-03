import { defineBuilding } from '@game/building/building.component'
import carouselIcon from './carousel.svg?url'

export const carousel = defineBuilding({
  id: 'carousel',
  name: 'Carousel',
  icon: carouselIcon,
  input: [{ stat: 'money', amount: 5 }],
  output: [{ stat: 'happiness', amount: 10 }],
  capacity: 12,
  duration: 3,
})
