# Requirement-driven production example

Studio Toolkit 0.5 adds a production-director flow. Its executable landscape insert demonstrates interpretation → renderer/scene selection → content review → native visual proof → final media QA → publication package. It uses explicit calibration data and no speech/API.

With the canonical toolkit beside this checkout:

```bash
../studio-toolkit/.venv/bin/python ../studio-toolkit/examples/run_director_example.py --output work/directed-film --phase prepare
```

Read the generated production-plan.md and run studio.py next. Inspect the evidence and record genuine review observations, then use the same command with --phase proof and --phase finish. Proof/finish require preceding reviews to be current; the script does not manufacture approval. See the canonical [production-director workflow](https://github.com/TahaGabroun/studio-toolkit/blob/main/skills/studio-toolkit/references/production-director.md) and [example instructions](https://github.com/TahaGabroun/studio-toolkit/blob/main/examples/director/README.md).

A short insert can reuse its approved full-length proof as the final encoded master. The original dataset's decrease must remain visible; a visually prettier monotonic curve would fail source fidelity. Motion, typography and semantic reviews remain separate from automated media decoding. Skill/runtime implementation stays exclusively in the canonical repository.
