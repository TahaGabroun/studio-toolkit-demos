import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const python=process.env.STUDIO_PYTHON||path.join(root,'../studio-toolkit/.venv/bin/python');
const result=spawnSync(python,[path.join(root,'scripts/prepare.py'),...process.argv.slice(2)],{stdio:'inherit'});
if(result.error)console.error(result.error.message);
process.exit(result.status??1);
