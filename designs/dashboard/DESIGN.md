# Design System Specification: High-Energy Athleticism

## 1. Overview & Creative North Star
**Creative North Star: "Kinetic Precision"**

This design system moves away from the static, boxy layouts of traditional fitness apps and adopts an editorial, high-velocity aesthetic. The goal is to capture the feeling of a high-end boutique performance center: clean, intense, and hyper-focused. 

By leveraging **Space Grotesk** for its mechanical, technical edge and **Manrope** for its humanist clarity, we create a layout that feels like a professional training log. We break the "template" look through **Intentional Asymmetry**—using oversized display type that occasionally bleeds off-center and generous negative space to let the high-energy primary yellow act as a directional "bolt" of energy rather than a mere accent.

## 2. Colors & Surface Logic

The palette is built on high-contrast tension between deep neutrals and a radioactive, high-energy primary.

### Palette Highlights
- **Primary (#586000 / #e4f725):** Our energy source. Use `primary_container` (#e4f725) for high-impact CTAs to ensure the "vibrant yellow" vibe is maintained.
- **Surface Neutrals:** We use a refined greyscale (`surface` #f9f6f5 to `surface_container_highest` #dfdcdc) to create professional depth.
- **The "No-Line" Rule:** Under no circumstances should 1px solid borders be used to separate sections. Boundaries are defined strictly through background shifts. For example, a workout log entry (`surface_container_lowest`) sits on a `surface_container_low` dashboard background.
- **The "Glass & Gradient" Rule:** To avoid a flat, "cheap" feel, floating action buttons or progress overlays should utilize a subtle gradient from `primary` to `primary_container`. For high-end "Pro" features, use Glassmorphism: `surface_container_low` at 60% opacity with a `20px` backdrop-blur.

## 3. Typography

The typography strategy relies on the interplay between the technical "Space Grotesk" and the functional "Manrope."

| Level | Token | Font Family | Size | Intent |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | Space Grotesk | 3.5rem | Huge PR numbers, "Start Workout" headers. |
| **Headline** | `headline-md` | Space Grotesk | 1.75rem | Exercise names (e.g., "Barbell Back Squat"). |
| **Title** | `title-lg` | Manrope | 1.375rem | Section headers within a workout. |
| **Body** | `body-md` | Manrope | 0.875rem | General instructions, notes, and metrics. |
| **Label** | `label-md` | Manrope | 0.75rem | "Sets," "Reps," and "Weight" sub-headers. |

**Editorial Note:** Use `display-lg` with tight letter-spacing (-0.02em) for a more aggressive, athletic stance.

## 4. Elevation & Depth: The Layering Principle

We reject the traditional "drop shadow" in favor of **Tonal Layering**.

- **Stacking Surfaces:** Create hierarchy by nesting. A `surface_container_highest` card should host `surface_container_lowest` inner elements (like individual sets) to create a natural, "physical" lift.
- **Ambient Shadows:** Shadows are reserved for elements that literally float (e.g., a "Pause Workout" modal). Use the `on_surface` color at 6% opacity with a `40px` blur and `20px` Y-offset. It should feel like an ambient glow, not a dark smudge.
- **The Ghost Border:** If high-density data requires a container (e.g., a complex graph), use the `outline_variant` at 15% opacity. It should be barely perceptible.

## 5. Components

### Buttons
- **Primary:** Background: `primary_container` (#e4f725) | Text: `on_primary_container`. Radius: `md` (0.75rem).
- **Secondary:** Background: `secondary_container` | Text: `on_secondary_container`.
- **Tertiary:** No background. Bold `headline-sm` text with a `primary` underline.
- **States:** On hover/active, apply a 10% black tint to the background.

### Cards & Tracking Lists
- **The "No-Divider" Rule:** Forbid the use of line dividers between list items. Use the **Spacing Scale** `4` (1rem) or `6` (1.5rem) to separate content. 
- **Active State:** An active exercise card should transform its background to `primary_container` with `on_primary_container` text to signal "High Energy/Focus."

### Input Fields
- **Design:** Use `surface_container_high` as the background. No borders.
- **Focus State:** Instead of a border, the background shifts to `surface_container_highest`, and the label color changes to `primary`.

### Specialized Gym Components
- **The "Power Gauge":** A progress bar using a gradient from `primary_dim` to `primary`. Height should be exactly `2.5rem` (`spacing-10`) to feel substantial and athletic.
- **Metric Chips:** Use `secondary_fixed` background with `on_secondary_fixed` text. Roundedness: `full`. These are used for "Rest Time" or "Difficulty" tags.

## 6. Do’s and Don’ts

### Do
- **Do** use intentional asymmetry. Align a "Workout Summary" headline to the far left, while the "Total Volume" metric sits tucked at the bottom right.
- **Do** use large, aggressive type scales for performance metrics. 
- **Do** lean into the "surface-on-surface" nesting for data-heavy screens.

### Don’t
- **Don’t** use 1px solid black borders. It destroys the premium, editorial feel.
- **Don’t** use standard blue/red for success/error unless absolutely necessary. Use `error` (#b02500) sparingly, and let the absence of `primary` yellow signal a "neutral" or "stopped" state.
- **Don’t** crowd the interface. If a screen feels busy, increase the spacing from `4` (1rem) to `8` (2rem). Space is a luxury feature in this system.