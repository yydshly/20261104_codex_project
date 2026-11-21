# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

For each new interaction, provide a runnable source-inspired demo and a product application that uses the same interaction rules. Keep the source link and the input/state/output notes in the case entry.
The Sources page reads the same case entries as the demo navigation. Link each case directly to its reference and keep general discovery links in the source directory.
The Principle Atlas pairs each case with an actual demo still, its source, the reusable interaction, and the product application. Keep the single-image overview aligned with the webpage when those contents change.
The furniture product journey shares the selected chair and upholstery across selection, 360° inspection, lighting, quote, and showroom lookup. Keep its original-mode references independent.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
