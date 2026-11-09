#!/usr/bin/env python3
"""Restore local stage records from validated, checked-in demo artifacts."""
import os
from pathlib import Path
import shutil
import sys
ROOT=Path(os.environ.get('STUDIO_DEMOS_ROOT',str(Path(__file__).resolve().parents[1])))
TOOLKIT=Path(os.environ.get('STUDIO_TOOLKIT_ROOT',str(ROOT.parent/'studio-toolkit')))
sys.path.insert(0,str(TOOLKIT/'skills/studio-toolkit/scripts'))
from studio import validate,write,complete,STAGES

def restore(root,name):
    project=Path(root)/'projects'/name
    if (project/'state.json').exists():return False
    public=Path(root)/'public'/name/'mix.wav'
    if not public.is_file():raise ValueError(f'Missing sample mix for {name}; run prepare-demos or restore the checked-in asset')
    report=validate(project)
    if report['errors']:raise ValueError(report['errors'])
    (project/'render').mkdir(exist_ok=True);shutil.copy2(public,project/'render/mix.wav')
    write(project/'state.json',{'version':1,'stages':{}})
    for stage in list(STAGES)[:10]:complete(project,stage)
    print(f'{name}: restored validated local stage records; human approval remains separate')
    return True

if __name__=='__main__':
    for name in ['documentary','vertical','graphics','inflammation']:restore(ROOT,name)
