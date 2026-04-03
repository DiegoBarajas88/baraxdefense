# BARAX Website Implementation Notes

## Main Entry

`index.html`

## What Was Kept From V3

- Primary section order, narrative flow, and bilingual EN/ES structure
- Layout composition, spacing rhythm, canvases, motion system, and overall dark institutional direction
- Core content, positioning, and capability stack storytelling

## What Was Inherited From V1

- Primary site typography direction for interface text:
  - `Space Grotesk` for headlines and body hierarchy
  - `Space Mono` for labels, metadata, buttons, and technical UI language
- V1-inspired text scale adjustments across hero, section titles, buttons, metrics, and body copy
- Cleaner V1-style hierarchy for supporting text and navigation labels

## Logo Assets Added

Location: `assets/logos/`

- `barax-logo-primary-dark.svg`
- `barax-logo-primary-light.svg`
- `barax-logo-primary-dark.png`
- `barax-logo-primary-light.png`
- `barax-symbol-dark.svg`
- `barax-symbol-light.svg`
- `barax-symbol-dark.png`
- `barax-symbol-light.png`

## Symbol Correction

- The BARAX symbol was rebuilt from a single master geometry
- The outer shield/octagon now uses a square `viewBox` and equal width/height proportions
- Site usage now references the same normalized symbol asset instead of multiple inline distortable variants
- CSS usage enforces `aspect-ratio: 1 / 1` and `height: auto` on the symbol to avoid stretching
