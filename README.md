# Studio Toolkit Demos

Four runnable, original video projects that exercise [Studio Toolkit](https://github.com/TahaGabroun/studio-toolkit). This repository contains demonstrations, not duplicated skills.

| Project / Remotion ID | Format | Mechanism |
|---|---|---|
| documentary / Documentary | 1920×1080 | Scientific explainer: atmospheric carbon → sugars → biomass |
| vertical / Vertical | 1080×1920 | Arabic short with mixed scientific terminology and RTL captions |
| graphics / Graphics | 1080×1080 | Progressive typography, connected explanatory nodes and shared camera |
| inflammation / Inflammation | 1920×1080 | Injury signals, arteriolar dilation, venular permeability, neutrophil recruitment and resolution |

## Reproduce

Clone the toolkit beside this checkout, prepare its Python venv, and install Node dependencies locally:

```bash
git clone https://github.com/TahaGabroun/studio-toolkit.git
git clone https://github.com/TahaGabroun/studio-toolkit-demos.git
cd studio-toolkit
python3 -m venv .venv
.venv/bin/pip install -r requirements-lock.txt
cd ../studio-toolkit-demos
npm ci
npm run typecheck
npm test
npm run render -- all
```

Checked-in projects include sample generated audio and structured artifacts; no asset acquisition or paid API is required to render them. Remotion needs a compatible Chromium; set `CHROMIUM=/path/to/chromium` if auto-download is unavailable. The tested host used /opt/google/chrome/chrome. STUDIO_TOOLKIT_ROOT and STUDIO_PYTHON override the sibling checkout/venv locations. Use a writable npm cache if your home directory is read-only.

To regenerate original demo artifacts, `npm run prepare-demos -- --rebuild` uses the local eSpeak NG shared library. Linux eSpeak NG generated speech is deliberately labelled test narration; natural delivery and Arabic pronunciation need human listening approval. `--pulses` substitutes clearly identified test tones where speech synthesis is unavailable. Regeneration overwrites only these generated demo projects and needs explicit --rebuild. It is not a general project-overwrite command.

Source: src/Root.tsx registers compositions; StudioFilm.tsx reads project/timeline/narration data; visuals/Biology.tsx and Mechanism.tsx draw original diagrams. scripts/prepare.py compiles briefs through script, storyboard, assets, narration alignment and mixing. scripts/render.mjs renders stills/master, caches by source/input/media/lockfile hashes, then runs full QA. Altered source or audio invalidates render cache. On a clean clone, the render command first validates checked-in artifacts and restores local stage records and the working mix without regenerating narration.

## Outputs and review

Each project contains brief.md, research.md, strategy.md, script.md/JSON, storyboard.json, design.md, assets.json, timeline.json, narration.json, captions.srt, mix.json, render-config.json, publication.md and QA evidence. Generated video masters live in projects/NAME/render/final.mp4. Contact sheets and selected inspected frames are under gallery/; automated summaries are under each project's qa/. [Validation report](VALIDATION.md) lists actual execution status.

The complete master is rebuilt locally; dependency folders, Webpack output, redundant raw audio and temporary frames are excluded. Small final example masters are included under gallery/ for direct review. Automated checks, agent frame inspection and human approval are separately recorded.

## Scientific and rights notes

The inflammation drawing is a compressed teaching schematic, not patient data, a literal biological clock or an exhaustive molecular model. Dilation is assigned to arterioles, permeability and leukocyte exit especially to postcapillary venules. These processes overlap. Primary teaching sources are listed in each research.md; retain those caveats when adapting. Tree mass refers to carbon incorporation and dry mass; water contributes much fresh mass and minerals are still essential.

All diagrams and demo text are original MIT material. Generated narration/test signals are dedicated to CC0. Noto fonts retain SIL OFL 1.1 notices in public/fonts/NOTICES.txt. No private recordings, copyrighted footage, music, logos or credentials are included. Remotion and the installed eSpeak engine retain their own licenses; no engine binary is redistributed. See [asset notes](ASSETS.md). No YouTube upload was performed.
