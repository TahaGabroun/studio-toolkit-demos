#!/usr/bin/env python3
"""Run the six code-drawn Studio animations from the canonical installed source."""
import argparse
from pathlib import Path
import subprocess
import sys
p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--toolkit',type=Path,default=Path(__file__).resolve().parents[2]/'studio-toolkit')
p.add_argument('--output',type=Path,required=True)
p.add_argument('--stills-only',action='store_true')
a=p.parse_args();toolkit=a.toolkit.resolve()
if not (toolkit/'examples/run_animation_smoke.py').is_file():p.error('Choose the Studio Toolkit 0.4+ checkout with --toolkit')
python=toolkit/'.venv/bin/python'
if not python.is_file():p.error('Create the toolkit project-local .venv and install its requirements first')
cmd=[str(python),str(toolkit/'examples/run_animation_smoke.py'),'--output',str(a.output.resolve())]
if a.stills_only:cmd+=['--stills-only']
subprocess.run(cmd,check=True)
