import { defineBuilding } from '@game/building/building.component'
import carouselIcon from './carousel.svg?url'

export const carousel = defineBuilding({
  id: 'carousel',
  name: 'Carousel',
  icon: carouselIcon,
  category: 'ride',
  capacity: 12,
  duration: 3,
  on: {
    build: { park: { money: -500 } },
    tick: { park: { money: -10 } },
    visit: {
      park: { money: 5 },
      guest: { happiness: 10, energy: -5 },
    },
  },
})
