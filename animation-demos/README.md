# Six code-drawn animation checks

These examples use Studio Toolkit 0.4+ as the source dependency, without duplicating its skill implementations. They render four short JSON-driven inserts (graph, line art, map and device layers) and two original four-second character calibrations (Canvas stick figure and Three.js cartoon).

```bash
# Clone the canonical toolkit beside this demos checkout and install its Python requirements.
cd ../studio-toolkit
bash skills/studio-toolkit/references/animation-runtime/kit/setup.sh
.venv/bin/python -m playwright install chromium
cd ../studio-toolkit-demos
python3 animation-demos/run.py --output work/animation-gallery
# Faster representative captures:
python3 animation-demos/run.py --output work/animation-stills --stills-only
```

Set CHROMIUM for an existing compatible browser. --toolkit PATH selects a different checkout. Use a new output directory on another run to preserve reviewed results. Outputs include source specs/projects, snapshots or MP4s, media QA and an execution summary. The canonical examples/animation-specs and runtime/starters contain the exact source; no stock footage or external media acquisition is required. Font MIT/OFL notices remain with the canonical source.

These are silent visual calibrations, not narrated documentaries or proof of scientific accuracy. Maps are seeded scenery, the device is generic and the 3D character engine captures at 720×1280 then upscales to 1080×1920. All other sample output is native vertical 1080×1920/30 fps. Toolkit timing import connects an approved take to the cartoon engines; new production speech follows the ElevenLabs preference and requires your account/voice. No model or paid API runs during this demonstration.
