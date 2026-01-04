import { defineBuilding } from '@game/building/building.component'
import carouselIcon from './carousel.svg?url'

export const carousel = defineBuilding({
  id: 'carousel',
  name: 'Carousel',
  icon: carouselIcon,
  category: 'ride',
  capacity: 12,
  duration: 3,
  appeal: 10,
  noveltyBoost: 40,
  tags: { family: 0.8, gentle: 0.6 },
  on: {
    build: { park: { money: -500 } },
    tick: { park: { money: -10 } },
    visit: {
      park: { money: 5 },
      guest: { happiness: 10, energy: -5 },
    },
  },
})
