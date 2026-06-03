export const radius = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
  full: 9999, // Pills, avatars, FAB
} as const;

export type RadiusType = typeof radius;
