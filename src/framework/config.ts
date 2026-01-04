export const CONFIG = {
  park: {
    name: 'My Park',
    initialMoney: 20000,
    initialAttractiveness: 10,
    initialEntryFee: 10,
    initialNovelty: 0,
  },
  novelty: {
    max: 100,
    decayRate: 0.5, // per second
  },
  spawn: {
    factor: 0.1, // guests per point of (attractiveness + novelty) per second
  },
} as const
