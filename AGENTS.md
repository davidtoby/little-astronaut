# Working on Little Astronaut

Read README.md first. The site is a buildless HTML/CSS/JS application served from public/; Python only serves static files. Do not add live cloud synthesis or credentials to the browser.

Preserve bilingual UI, canvas labels and spoken narration, existing touch interactions, and the distinction between 7.9 km/s near-surface first cosmic velocity and about 7.8 km/s for the example low orbit. Sizes, timing and trajectories are educational illustrations.

translations.json is the translation source. Run `python3 scripts/build_i18n.py` after editing it. Narration text lives in public/narration-content.json; regenerate changed audio with scripts/generate_narration.py and retain complete Chinese/English voice coverage. Keep existing Chinese narration keys stable unless updating all callers and indexes together.

Verify changes with `npm ci && npm test && npm run check` and `python3 -m unittest discover -s tests -p '*_test.py'`. When the tools are available, also check touch layouts, real audio playback and the complete launch flow in a browser. State any verification limits honestly.

Keep logs, virtual environments, local diagnostic files and credentials out of Git. LaunchAgents are generated locally by manage.py and are not repository assets. Avoid absolute user-specific paths in tracked code or docs. User-authorized publication is handled through their GitHub account.
