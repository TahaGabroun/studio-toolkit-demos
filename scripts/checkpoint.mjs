import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const toolkit=process.env.STUDIO_TOOLKIT_ROOT||path.join(root,'../studio-toolkit');
const python=process.env.STUDIO_PYTHON||path.join(toolkit,'.venv/bin/python');
const result=spawnSync(python,[path.join(root,'scripts/checkpoint.py')],{stdio:'inherit',env:{...process.env,STUDIO_TOOLKIT_ROOT:toolkit}});
if(result.error)console.error(result.error.message);
process.exit(result.status??1);
