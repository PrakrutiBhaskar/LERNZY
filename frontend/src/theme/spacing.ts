export const spacing = {
  space1: 4,
  space2: 8,
  space3: 12,
  space4: 16,
  space5: 20, // Screen horizontal padding standard
  space6: 24,
  space8: 32,
  space12: 48,
} as const;

export type SpacingType = typeof spacing;
