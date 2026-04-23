# StepAudio 2.5 ASR Model Card Visual Refresh Design

Date: 2026-04-23

## Goal

Refresh the visual presentation of `/step-audio-2.5-asr/model-card/` so it reads like a cold-white research launch page rather than a rendered markdown document, while preserving the current content, section order, information density, and bilingual behavior.

## Locked Constraints

- Keep the existing section structure and content scope:
  - Overview
  - Model Information
  - Training Data
  - Evaluation
  - Distribution
  - Intended Usage and Limitations
  - Ethics and Content Safety
- Do not expand, reduce, or rewrite the information architecture as part of this task.
- Do not add hero proof-point cards or metric chips below the title.
- Keep the locale switch and anchor navigation behavior, but visually weaken the document-style sidebar.
- Keep the three evaluation tables, but restyle them as unboxed appendix-style tables.

## Approved Visual Direction

The page should move to a `Research Launch / Cold White` direction:

- cold white base rather than warm paper
- minimal chrome, minimal card treatment
- large vertical rhythm
- title, short intro, and CTA only in the hero
- whitespace as the primary separator between sections
- evidence presented as broad editorial bands rather than boxed widgets
- weaker document navigation, stronger continuous-page reading flow

## Visual Principles

### 1. Continuous Page, Not Card Stack

The page should feel like one long designed surface instead of a stack of repeated containers. Most section wrappers should lose their bordered or panelized appearance. Separation should come from:

- section spacing
- horizontal hairlines
- type hierarchy
- width changes between hero copy, body copy, and tables

### 2. Editorial Hierarchy

Headings should feel more like a research release than a technical report template:

- larger, cleaner section headings
- stronger spacing between heading and body
- smaller overline or kicker usage where helpful
- reduced repetition of boxed sub-block titles

### 3. Cold White Technical Tone

The visual palette should be restrained and sharp:

- background: cold white / very light gray-white
- text: dense neutral black and graphite
- dividers: soft gray hairlines
- accent: minimal, likely limited to links, active nav state, and interaction focus

Avoid gradients, glossy fills, tinted panels, and soft product-marketing surfaces.

### 4. Evidence Without Boxes

Evaluation should feel like evidence embedded in the page rather than cards inside cards:

- no outer rounded table cards
- no boxed benchmark modules
- use table captions, spacing, and thin rules instead
- keep enough width for model names and dataset names without awkward wrapping

## Global Shell

### Current Problem

The current layout is dominated by a left sidebar and a central document panel, which creates a strong documentation template feel.

### New Direction

Replace the persistent document-sidebar feeling with a lighter publication shell:

- remove the dominant left-column sidebar layout
- move brand, locale switch, and section navigation into a slim sticky top bar
- keep anchor navigation available, but make it secondary and lightweight
- allow the content column to visually own the page

### Result

The user should perceive:

- a top-led publication page
- weaker tool chrome
- stronger continuous reading flow

## Hero

### Keep

- model title
- model card label
- short intro paragraph
- three public CTAs

### Remove

- no proof-strip
- no three-up hero chips
- no metrics cards
- no extra hero containers under the intro

### Composition

The hero should use:

- large title block
- restrained intro width
- a clean CTA row
- generous whitespace below the CTAs before the first content section begins

This whitespace transition is intentional and should be the first major anti-markdown move.

## Section Treatment

### Section Frames

Each top-level section should shift from `panel` styling to `editorial section` styling:

- reduce or remove section backgrounds
- reduce or remove rounded outlines
- keep only very light separators where necessary
- allow sections to breathe vertically

### Internal Blocks

Current `field-row` blocks should be restyled to look more like structured editorial rows:

- lighter or no surrounding boxes
- stronger term/body alignment
- less repeated border treatment
- more spacing between rows

The goal is to preserve readability for developers without repeating “box -> heading -> text -> box -> heading -> text” patterns.

## Evaluation Treatment

### Desired Feel

Evaluation should become the clearest example of “evidence page, not markdown page.”

### Table Style

All three benchmark tables should become unboxed appendix tables:

- no full outer border card
- no rounded background panel around the table
- thin horizontal rules
- restrained header styling
- compact, precise type
- consistent width behavior across all three tables

### Width Rule

The `Model` column in the Chinese and English tables should remain visually aligned with the long-form table model column width.

### Surrounding Structure

Before and after each table:

- use section captions and spacing, not panels
- keep `Long-form set construction`, `Accepted length`, and `Ablation` as quieter editorial notes beneath the main evidence
- these note blocks should also avoid card styling

## Navigation Treatment

Anchor navigation remains useful, but it should stop driving the page visually.

### Approved Direction

- weaken the visual weight of section navigation
- move away from a permanently dominant left rail
- use a slim sticky top navigation treatment
- active state should be visible but understated

### Not Desired

- no heavy table-of-contents sidebar
- no large boxed nav stack defining the whole layout

## Typography

Typography should carry more of the page structure.

### Requirements

- larger contrast between page title, section title, and body
- narrower, more intentional intro line length
- sharper body text color and spacing
- quieter metadata text
- fewer repeated bold blocks

### Outcome

Even without changing content, the page should feel authored and designed rather than automatically rendered.

## Responsive Behavior

### Desktop

- top utility/navigation bar
- generous whitespace
- broad content width with clear reading measure
- tables can extend to their designed width without boxed wrappers

### Tablet

- top navigation can wrap or compress
- hero remains open and spacious
- tables stay readable through horizontal containment if needed, but without card framing

### Mobile

- no sidebar pattern
- hero remains title -> intro -> CTA -> whitespace
- section spacing stays generous
- tables remain scrollable and readable

## File-Level Implementation Scope

This visual refresh should stay focused on:

- `step-audio-2.5-asr/model-card/index.html`
- `step-audio-2.5-asr/model-card/styles.css`
- `step-audio-2.5-asr/model-card/app.js`

`content.js` should remain largely unchanged unless minor label or rendering hooks are needed to support the approved visual treatment.

## Acceptance Criteria

- The page no longer reads as a sidebar-led technical document shell.
- Hero contains only title, intro, CTA, and whitespace transition; no proof cards or chip rows.
- Most boxed/card surfaces are removed or greatly weakened.
- Evaluation tables render as unboxed appendix-style tables.
- The overall impression is cold-white, restrained, and research-launch oriented.
- Content order, copy, locale behavior, and benchmark content remain intact.

## Out of Scope

- changing section order
- rewriting large amounts of copy
- introducing sample galleries or demo-like showcases
- adding new data visualizations that change the information model
- changing public links or deployment structure
