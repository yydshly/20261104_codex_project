# Glasshouse 4.3 / 2026-11-15

Fixed runtime: index.html. In the main project open /glasshouse/releases/4.3-20261115/index.html using node server.mjs from the project root. All automatic runtime requests stay inside this directory; history, editable Blender projects and evidence links remain in the main project.

Verify from the main project: npm run verify:baseline. The release.json hashes all fixed files; glasshouse/releases.json additionally records the manifest hash. Existing fixed versions are verified, never overwritten by the freeze script.

The scene.bundle.js is copied byte-for-byte from reviewed 4.3. This folder contains the active 0597 GLB, speech timing/audio, ambience, CSS, licenses and matching JS source under source/. Original four-person GLB, Blender projects, historical candidate models, screenshots/videos and the 20-effect research library remain in the main project; they are not runtime dependencies and are not duplicated here.

Rebuild only a separate development copy. In that copy's source directory, install three 0.187.0 and esbuild 0.25.12, then npm run build. Move the resulting bundle to the development runtime root so its relative assets resolve correctly. Preview of the fixed bundle needs no package install or cloud service. Do not build over this fixed directory.

Scope: one fitted character, five fitted seats, scene-specific stairs/collision, approximate mouth timing and nearshore wave-group/audio coupling. No arbitrary character/seat support, free dialogue, outfit switching, cloth physics or individual-wave acoustic simulation.
