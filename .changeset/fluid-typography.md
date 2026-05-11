---
"@lmfaole/basics": minor
---

Make the typography tokens fluid. `--basic-font-size`, `--basic-font-size-small`, and `--basic-font-size-title` now resolve through `clamp(min, lerp, max)` and scale between viewport endpoints. The same `--basic-font-size-*` tokens components already consume keep working — they just respond to viewport width now.

Consumers tune the fluidity with three new knobs:

- `--basic-fluid-scale` (default `1`) — single multiplier for fluid intensity. Set to `0` to disable fluidity entirely (every size pins to its min), to `0.5` for gentler scaling, or to `>1` for bolder scaling.
- `--basic-fluid-min-viewport` (default `20rem` / 320px) — viewport width where fluid scaling starts.
- `--basic-fluid-max-viewport` (default `80rem` / 1280px) — viewport width where each size reaches its max.

Per-size bounds are also overridable: `--basic-font-size-{small,title}-{min,max}` and `--basic-font-size-{min,max}`. The `Overview/Base Tokens` Storybook page now shows the fluid range for each size and includes a side-by-side comparison of different fluid-scale settings.
