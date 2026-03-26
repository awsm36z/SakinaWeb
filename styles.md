# Sakina Web Style Guide

## Brand Direction

Sakina should feel calm, grounded, reflective, and outdoors-forward. The interface supports the story and photography; it should not feel loud, glossy, or overly technical.

Core adjectives:

- Calm
- Grounded
- Intentional

## Color System

Use a restrained earthy palette built around warm cream surfaces and moss green actions.

Primary tokens:

- `--background`: `#F2EDE3`
- `--surface`: translucent warm ivory for cards and panels
- `--surface-strong`: brighter ivory for hero panels and featured sections
- `--border-soft`: warm low-contrast border
- `--brand-moss`: `#2F5D50`
- `--brand-sand`: `#D8C6A5`
- `--brand-ink`: `#1F2937`
- Accent brass: `#B88A52`

Usage ratio:

- 70% creams and warm neutrals
- 20% moss green
- 10% warm accents

Avoid:

- pure white full-page backgrounds
- cool grays as dominant neutrals
- saturated greens
- bright modern shadows

## Surfaces

Use layered surfaces instead of flat white blocks.

- `brand-panel`: default panel for content sections
- `brand-panel-strong`: emphasized panel for hero sections or primary content blocks
- `brand-card-soft`: warmer elevated card for special content
- `brand-subtle-block`: subdued inset block for metadata, helper content, or readouts

Rules:

- Cards should be ivory or translucent cream, not bright white
- Borders should be warm and low-contrast
- Shadows should be soft and broad, never sharp or glossy

## Typography

Typography should read clean and editorial.

- Body font: Geist Sans
- Accent display: Anton, used sparingly
- Text color: `--brand-ink`, not pure black

Rules:

- Use uppercase tracked kicker text for section labels
- Keep paragraphs generous with line-height
- Use display typography only for rare high-emphasis moments

## Buttons and Links

Shared classes:

- `brand-button`: primary action
- `brand-button-secondary`: secondary action
- `brand-button-accent`: warm highlight action
- `brand-link`: inline and text links

Rules:

- Primary buttons use moss green
- Secondary buttons use translucent ivory with soft borders
- Accent buttons use brass rarely
- Links should not use bright default blue or neon green

## Forms

Shared classes:

- `brand-input`: all text inputs, selects, and textareas

Rules:

- Inputs should sit on soft ivory/white surfaces
- Focus state should use moss, not browser default blue
- Keep form containers inside `brand-panel` or `brand-card-soft`

## Layout

Shared classes:

- `brand-shell`: top-level page wrapper spacing
- `brand-kicker`: standardized eyebrow label

Rules:

- Let the cream atmospheric background show through
- Avoid route-level `bg-white` and `bg-gray-50` wrappers unless intentional
- Prefer fewer, stronger sections over many unrelated boxes

## Component Guidance

Cards:

- rounded corners
- soft warm surface
- warm border
- subtle shadow

Tables and metadata blocks:

- use subdued ivory backgrounds
- use warm separators instead of harsh gray lines

Modals:

- same panel language as cards
- not pure white unless needed for readability

## Implementation Notes

When adding new UI:

1. Start with the palette tokens in `app/globals.css`
2. Prefer shared brand classes before writing one-off styles
3. Check the `/ui-preview` route to validate visual consistency
4. If a component looks too bright, too gray, or too sharp, reduce contrast first
