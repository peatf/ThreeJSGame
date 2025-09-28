# AI Agent Guide – Messenger: Tiny Planet Delivery

## Quick Start
1. Serve locally (module imports require HTTP):
   ```bash
   cd ThreeJSGame
   python3 -m http.server 4173
   # or: npx --yes serve -l 4173
   ```
2. Open `http://localhost:4173` in a desktop browser; click once in the canvas to unlock audio.
3. Use DevTools → Performance/Memory if you touch rendering or physics.
4. Rapid searches stay snappy with:
   ```bash
   rg 'startQuest' index.html
   rg 'TODO' index.html
   ```

## Repository Map
- `index.html`: everything lives here.
  - `<style>`: responsive HUD layout, joystick/jump button, soft pastel palette.
  - `<script type="importmap">`: pins `three@0.159.0` and example add-ons from unpkg CDN.
  - `<script type="module">`:
    - Helpers (`rand`, `softNoise3`, `makeTextSprite`, textures).
    - Scene bootstrapping (renderer, camera, OrbitControls, fog).
    - Environment builders (planet deformation, trees, ponds, lanterns, petals).
    - Player mesh + physics on a sphere (`updatePhysics`, `updateCamera`).
    - Quest flow (`QUESTS`, `startQuest`, `nextQuest`, `tryInteract`).
    - Particles and victory overlay.
    - Mobile inputs (virtual joystick, jump button) and audio (`userAudioInit`, `startMusic`).
    - Animation loop, resize handler, accessibility shortcuts.

## Agent Workflow
- **Plan first**: scan the module script’s section headers to confirm which systems you’ll touch (environment, quests, controls, audio). Note shared constants (`PLANET_R`, `COLORS`) before editing.
- **Baseline run**: keep a browser tab hot while you iterate; use Live Reload extensions or manually refresh after edits.
- **Search precisely**: `rg 'function add' index.html -n` surfaces environment helpers, `rg 'QUESTS' -n` highlights delivery data.
- **Small diffs**: duplicate functions before big refactors so you can diff behavior in DevTools Sources.
- **Physics tweaks**: adjust `accel`, `maxSpeed`, `gravity`, `friction` in one place; they feed both keyboard and joystick control paths.
- **Quest design**: targets come from `houses[]`; extend `QUESTS` or decorate deliveries near `makeQuestTargets`.
- **UI overlays**: DOM is wired at the top of the module. HUD copy lives in-line; keep accessibility text mirrored if you localize.
- **Audio**: music is procedurally scheduled. Change tempo/scale in `startMusic`; keep gain low to avoid clipping.

## Systems Notes
- Rendering pipeline uses `EffectComposer` with bloom and optional bokeh (disabled on mobile UA). Resize logic updates all passes—ensure new passes also handle `setSize`.
- Particles (`spawnBurst`, `updateParticles`) store velocity buffers per `Points` in `userData`. Respect that pattern if you add effects.
- Mobile inputs rely on pointer events (`joyActive`) and clamp helper; keep `pointer-events` CSS aligned with joystick HUD.
- Win modal toggles via `winEl` display; quest completion triggers bursts + overlay. `resetBtn` and `keepExploring` listeners sit near quest logic.
- AudioContext instantiates lazily on first interaction to satisfy autoplay policies; call `userAudioInit()` whenever you add new interactive entry points.

## Debugging & Performance
- Use Chrome’s WebGL inspector (WebGL tab in DevTools → Rendering) to visualize draw calls if scene complexity climbs.
- FPS drops? Toggle `OrbitControls` off and check `composer` passes individually; you can render directly with `renderer.render` while profiling.
- Physics jitter often comes from high `dt`; clamp already limits to 0.033s—preserve that guard if you modify the loop.
- Audio glitches: ensure `startMusic` only runs when `musicOn` and `audioCtx` exist; reuse the existing `setTimeout` pattern.

## Before You Ship
- Confirm no console errors/warnings in Chrome and Safari (audio + pointer events work on both).
- Test keyboard, mouse, touch joystick, and jump tap on at least one mobile-sized viewport.
- Validate quests cycle correctly, reset works, and win modal buttons respond.
- If you tweak colors or lighting, check color contrast for HUD text against background.
- Document follow-up tasks (e.g., future resource splitting) in your PR or commit message.
