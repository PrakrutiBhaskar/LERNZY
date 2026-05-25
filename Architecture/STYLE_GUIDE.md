# Style Guide — Design Tokens, Colours & Typography
> Single source of truth for all visual design decisions in the lernzy app.
> Every developer and AI building UI must use these tokens. Do not hardcode values.

---

## 1. Design Philosophy

The app is used by children aged 11–14 on low-end phones, often in bright outdoor light. The visual design follows three principles:

**Warm & Welcoming** — rounded shapes, encouraging colours, no cold greys. The UI should feel like a friendly notebook, not a corporate tool.

**Readable First** — high contrast, generous font sizes, short line lengths. Young readers and non-native language readers need clarity above all else.

**Lightweight** — no heavy shadows, no large gradients, no animations longer than 300ms. Performance on 2 GB RAM devices is non-negotiable.

---

## 2. Colour Palette

### Primary Brand Colours

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | `#5B4FCF` | CTAs, active states, links, primary buttons |
| `--color-primary-light` | `#8B80E8` | Hover/pressed state, subtle highlights |
| `--color-primary-subtle` | `#EEECfB` | Background tints, selected cards |

### Accent Colours (per subject)

| Subject | Token | Hex |
|---------|-------|-----|
| Mathematics | `--color-subject-math` | `#E8760A` |
| Science | `--color-subject-science` | `#2A9D5C` |
| Social Studies | `--color-subject-social` | `#D4500F` |
| English | `--color-subject-english` | `#1A7AB5` |
| Kannada | `--color-subject-kannada` | `#B5320A` |

Use the subject accent colour for chapter card borders, progress bars, and subject badges only.

### Semantic Colours

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-success` | `#2A9D5C` | Correct answers, completed topics |
| `--color-warning` | `#F4A40A` | Caution states, "try again" prompts |
| `--color-error` | `#D63B2F` | Errors only — never for wrong quiz answers |
| `--color-info` | `#1A7AB5` | Tips, neutral informational states |

**Rule:** Never use `--color-error` for incorrect quiz answers. Wrong answers use `--color-warning` with a gentle message — shaming is prohibited.

### Neutral / Surface Colours

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg` | `#FAFAF8` | App background |
| `--color-surface` | `#FFFFFF` | Cards, modals, input fields |
| `--color-surface-alt` | `#F2F1ED` | Secondary surfaces, dividers |
| `--color-border` | `#DDD9CE` | Borders, separators |
| `--color-text-primary` | `#1C1B18` | Body text, headings |
| `--color-text-secondary` | `#6B6860` | Labels, captions, placeholders |
| `--color-text-disabled` | `#AEABA0` | Disabled UI elements |
| `--color-text-on-primary` | `#FFFFFF` | Text on primary-coloured backgrounds |

---

## 3. Typography

### Font Families

```
Noto Sans            → English UI and body text
Noto Sans Devanagari → Hindi text
Noto Sans Kannada    → Kannada text
```

All three fonts are bundled in `assets/fonts/`. The app switches the active font family based on the student's selected language. Never use a system font for lesson or quiz content — Noto Sans ensures consistent rendering across all Android devices and supports all three scripts.

### Type Scale

| Token | Size (sp) | Weight | Line Height | Usage |
|-------|-----------|--------|-------------|-------|
| `--text-display` | 28sp | Bold (700) | 1.3 | Screen titles (onboarding, progress) |
| `--text-heading-1` | 22sp | Bold (700) | 1.35 | Chapter titles, major headings |
| `--text-heading-2` | 18sp | SemiBold (600) | 1.4 | Topic titles, card headings |
| `--text-body-lg` | 16sp | Regular (400) | 1.6 | Lesson body text, tutor responses |
| `--text-body` | 15sp | Regular (400) | 1.6 | Standard UI text |
| `--text-body-sm` | 13sp | Regular (400) | 1.5 | Captions, labels, metadata |
| `--text-caption` | 11sp | Regular (400) | 1.4 | Timestamps, fine print |
| `--text-button` | 15sp | SemiBold (600) | 1 | Button labels |

**Rule:** Lesson and quiz text uses `--text-body-lg` (16sp) as the minimum. Never go below 13sp for any text a student needs to read.

---

## 4. Spacing & Layout

### Spacing Scale (multiples of 4)

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Icon-text gap, tight padding |
| `--space-2` | 8px | Inner element padding |
| `--space-3` | 12px | List item padding |
| `--space-4` | 16px | Standard card padding, section gap |
| `--space-5` | 20px | Screen horizontal padding |
| `--space-6` | 24px | Section vertical gap |
| `--space-8` | 32px | Major section separation |
| `--space-12` | 48px | Screen-level vertical rhythm |

**Screen horizontal padding:** `--space-5` (20px) on all screens.

### Grid

Single-column layout. Maximum content width: `100%` (full bleed). No grid system needed — linear scrollable screens only.

---

## 5. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 6px | Chips, tags, small buttons |
| `--radius-md` | 12px | Cards, input fields |
| `--radius-lg` | 18px | Bottom sheets, large cards |
| `--radius-full` | 9999px | Pills, avatar circles, FAB |

All interactive cards use `--radius-md`. The tutor response bubble uses `--radius-lg` for a softer, speech-bubble feel.

---

## 6. Elevation / Shadows

Shadows are used sparingly on low-end devices (shadow rendering has a GPU cost).

| Token | Style | Usage |
|-------|-------|-------|
| `--shadow-none` | none | Default — most elements |
| `--shadow-card` | `0 1px 4px rgba(0,0,0,0.10)` | Subject cards, quiz option cards |
| `--shadow-modal` | `0 4px 16px rgba(0,0,0,0.15)` | Bottom sheets, modals only |
| `--shadow-fab` | `0 2px 8px rgba(0,0,0,0.20)` | Floating action button |

**Rule:** No more than 2 shadowed surfaces visible on any screen simultaneously.

---

## 7. Iconography

- Icon library: **Lucide React Native** (already a dependency)
- Default icon size: `24px` (touch target `44×44px` minimum)
- Small icon size: `20px` (for inline use within text labels)
- Icon colour defaults to `--color-text-secondary`; active/selected icons use `--color-primary`

Subject icons, interest grid icons, and badge images are custom SVGs in `assets/images/`.

---

## 8. Component Tokens

### Buttons

```
Primary Button
  background:    --color-primary
  text:          --color-text-on-primary, --text-button
  border-radius: --radius-md
  padding:       12px 24px
  min-height:    48px (touch target)

Secondary Button (outline)
  background:    transparent
  border:        1.5px solid --color-primary
  text:          --color-primary, --text-button
  border-radius: --radius-md
  padding:       11px 24px

Ghost Button
  background:    transparent
  text:          --color-primary, --text-button
  no border
  padding:       12px 16px

Disabled state (all buttons)
  background:    --color-surface-alt
  text:          --color-text-disabled
  no shadow
```

### Cards

```
Standard Card
  background:    --color-surface
  border-radius: --radius-md
  shadow:        --shadow-card
  padding:       --space-4

Active / Selected Card
  background:    --color-primary-subtle
  border:        1.5px solid --color-primary
  border-radius: --radius-md
  padding:       --space-4
```

### Input Fields

```
background:    --color-surface
border:        1.5px solid --color-border
border-radius: --radius-md
padding:       12px 14px
font:          --text-body-lg
color:         --color-text-primary

Focus state:
  border-color: --color-primary

Error state:
  border-color: --color-error
```

### Tutor Bubble (TutorBubble.tsx)

```
background:    #F0EEFD  (fixed — slight purple tint, always)
border-radius: 4px 18px 18px 18px  (top-left stays flat — "speech bubble from top-left")
padding:       --space-4
max-width:     90%
font:          --text-body-lg
color:         --color-text-primary
```

### Quiz Option Button (QuizOption.tsx)

```
Default:
  background:    --color-surface
  border:        1.5px solid --color-border
  border-radius: --radius-md

Selected (before submit):
  background:    --color-primary-subtle
  border-color:  --color-primary

Correct (after submit):
  background:    #E8F7EE
  border-color:  --color-success
  text:          --color-success

Incorrect (after submit):
  background:    #FEF5E7
  border-color:  --color-warning
  text:          --color-warning
```

---

## 9. Animation & Motion

| Use case | Duration | Easing |
|----------|----------|--------|
| Button press feedback | 100ms | `ease-in` |
| Card appear | 200ms | `ease-out` |
| Screen transition | 250ms | `ease-in-out` |
| Flashcard flip | 300ms | `ease-in-out` |
| Progress bar fill | 400ms | `ease-out` |
| Bottom sheet open | 280ms | `spring (damping 18)` |

**Rule:** Never animate longer than 300ms for screen transitions. Disable all animations if `AccessibilityInfo.isReduceMotionEnabled()` returns true.

---

## 10. Dark Mode

Dark mode is **out of scope for v1**. All CSS variable values are light-mode only. Design with future dark mode in mind — always reference tokens, never hardcoded hex values, so a dark theme can be added by swapping token values.

---

## 11. Internationalisation Notes

- Kannada and Devanagari scripts are taller than Latin — add `2px` extra line height when rendering in `hi` or `kn` mode. Use `--text-body-lg` at minimum for these scripts.
- Some Kannada characters can be visually heavy; avoid bold weight for long passages in Kannada.
- RTL: not required (none of the three supported languages are RTL).
- Number formatting: use locale-aware formatting — Kannada and Hindi prefer `1,00,000` style (Indian numbering system).
