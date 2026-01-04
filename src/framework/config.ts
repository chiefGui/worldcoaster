export const CONFIG = {
  park: {
    name: 'My Park',
    initial: {
      money: 20000,
      attractiveness: 0,
      entryFee: 5,
      novelty: 0,
    },
  },
  novelty: {
    max: 100,
    decayRate: 0.5, // per second
    boost: {
      base: 40,  // first of its kind
      floor: 2,  // minimum boost no matter how many duplicates
    },
  },
  spawn: {
    factor: 0.01, // guests per point of (attractiveness + novelty) per second
  },
} as const
