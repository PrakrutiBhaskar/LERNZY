export const radius = {
  sm: 6,   // Chips, tags, small buttons
  md: 12,  // Cards, input fields, interactive options
  lg: 18,  // Bottom sheets, large cards, tutor speech bubbles
  full: 9999, // Pills, avatars, FAB
} as const;

export type RadiusType = typeof radius;
