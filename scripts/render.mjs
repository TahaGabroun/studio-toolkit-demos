import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {renderMedia,renderStill,selectComposition} from '@remotion/renderer';
import {spawnSync} from 'node:child_process';

const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const mapping={documentary:'Documentary',vertical:'Vertical',graphics:'Graphics',inflammation:'Inflammation'};
const selected=process.argv[2]||'all';
if(selected!=='all'&&!mapping[selected])throw new Error('Choose all, documentary, vertical, graphics or inflammation');
const toolkit=process.env.STUDIO_TOOLKIT_ROOT||path.join(root,'../studio-toolkit');
const python=process.env.STUDIO_PYTHON||path.join(toolkit,'.venv/bin/python');
const browser=process.env.CHROMIUM||undefined;
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const sourceFiles=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?sourceFiles(path.join(dir,e.name)):[path.join(dir,e.name)]);
const sources=Object.fromEntries(sourceFiles(path.join(root,'src')).map(p=>[path.relative(root,p),hash(p)]));
const serveUrl=await bundle({entryPoint:path.join(root,'src/index.ts'),publicDir:path.join(root,'public'),outDir:path.join(root,'work/bundle')});
for(const [name,id] of Object.entries(mapping)){
  if(selected!=='all'&&name!==selected)continue;
  const project=path.join(root,'projects',name);
  const inputs=Object.fromEntries(['project','timeline','narration','assets','render-config'].map(n=>[n,hash(path.join(project,`${n}.json`))]));
  const publicInputs=Object.fromEntries(sourceFiles(path.join(root,'public')).map(p=>[path.relative(root,p),hash(p)]));
  const fingerprint=hash(path.join(root,'package-lock.json'))+JSON.stringify({sources,inputs,publicInputs,renderer:hash(path.join(root,'scripts/render.mjs'))});
  const recordFile=path.join(project,'qa/render.json');const output=path.join(project,'render/final.mp4');
  const previous=fs.existsSync(recordFile)?JSON.parse(fs.readFileSync(recordFile,'utf8')):null;
  const cached=previous?.fingerprint===fingerprint&&fs.existsSync(output)&&previous.video_sha256===hash(output);
  if(cached)console.log(`${name}: verified render cache hit`);
  const composition=await selectComposition({serveUrl,id,browserExecutable:browser});
  const frames=[0,Math.round(composition.durationInFrames*.25),Math.round(composition.durationInFrames*.55),composition.durationInFrames-1];
  if(!cached){
    for(const frame of frames)await renderStill({serveUrl,composition,browserExecutable:browser,output:path.join(project,`qa/frame-${frame}.png`),frame,overwrite:true});
    await renderMedia({serveUrl,composition,codec:'h264',crf:18,pixelFormat:'yuv420p',outputLocation:output,browserExecutable:browser,concurrency:2,overwrite:true});
    for(const [file,sha] of Object.entries(sources))if(hash(path.join(root,file))!==sha)throw new Error('Source changed during render; rerun to capture consistent evidence');
    fs.writeFileSync(recordFile,JSON.stringify({fingerprint,sources,inputs,video_sha256:hash(output),rendered_at:new Date().toISOString()},null,2)+'\n');
  }
  for(const args of [[path.join(toolkit,'scripts/studio.py'),'complete',project,'render'],[path.join(toolkit,'skills/studio-toolkit/scripts/media.py'),'qa',project,output]]){
    const result=spawnSync(python,args,{stdio:'inherit'});if(result.status!==0)throw new Error(`${name}: validation failed`);
  }
  console.log(`${name}: rendered ${composition.width}x${composition.height}, ${composition.durationInFrames} frames`);
}
