# The timeline mockup: current version

**Current: v12**, 15 November 2026. `timeline-v12-craft.html`, published at https://claude.ai/artifact/MNfUA3g4RB6TrvzmtqX8bE (private to the owner). The element library it is built from: https://claude.ai/artifact/UqdAH5E4nwtSJdxcATBp3W (version 7), source in `../library/`.

Each version is a layer over the one before, so behaviour stays fixed unless the owner asks for a change:

| Version | Layer | What it adds |
|---|---|---|
| v8 | (whole page) | The Craft-style restyle of v5's behaviour |
| v9 | build-v9/ | The library's second pass: Phosphor icons, glass, legible blues |
| v10 | build-v10/ | Named project chips, raised a little |
| v11 | build-v11/ (with options-motion-lines/source/) | Opening a project is a push from the left; the track is a groove |
| v12 | build-v12/ | Milestones open in place as lanes; the agent's plan between events; numbers from phase to action |

## What v12 holds, and the owner's word for each
All verbatim in `decisions/questions/P-005-rebrand-style.md` and `decisions/questions/P-005-design-round-2.md`.

- **Look:** the Craft references, neutral greys and one blue for selected or now. Colour is on hold, except red, used only for problems.
- **The seven kinds** (branch, commit, pull request, check, review, merge, deploy) are the constants, shown as icon shapes. States are neutral words. There is no key, no branch pills and no state colour; the timeline basis's change log has not yet been updated to say so.
- **Several branches at once:** lanes, each open branch beside main. Main stands out with a wider, darker groove and dark icons.
- **Motion:** a push. The plan slides in from the left, already on Now. Nothing draws from the top down.
- **The work between events:** each action is the agent's plan, with why, any problem and what was done about it. Concise, planned ahead and ticked off with checks. A blue dot marks the one under way and open dots those to come. Newest at the top. Each agent writes its own lines.
- **Numbers:** phase, then milestone, sprint, step and action, each counted inside the one above and never reused.

## Not settled
- How gate, decision, research and stop show now that only the seven kinds are kept. v12 leaves their own icons in place.
- Colour beyond red; the milestone and sprint shapes; how planned work is drawn.
- Real action records: a change to the operating model, written up for the building session in `../requests/2026-11-15-agent-action-records.md`.
