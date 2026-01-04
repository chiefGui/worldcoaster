export const CONFIG = {
  novelty: {
    max: 100,
    decayRate: 0.5, // per second
  },
  spawn: {
    factor: 0.1, // guests per point of (attractiveness + novelty) per second
  },
} as const
