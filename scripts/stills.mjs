import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {selectComposition,renderStill} from '@remotion/renderer';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const serveUrl=await bundle({entryPoint:path.join(root,'src/index.ts'),publicDir:path.join(root,'public'),outDir:path.join(root,'work/style-bundle')});
for(const [name,id] of Object.entries({documentary:'Documentary',vertical:'Vertical',graphics:'Graphics',inflammation:'Inflammation'})){
  const composition=await selectComposition({serveUrl,id,browserExecutable:process.env.CHROMIUM});
  const timeline=JSON.parse(fs.readFileSync(path.join(root,`projects/${name}/timeline.json`),'utf8'));
  for(const event of timeline.events){
    const frame=Math.min(event.end_frame-1,event.start_frame+40);
    await renderStill({serveUrl,composition,browserExecutable:process.env.CHROMIUM,frame,output:path.join(root,`work/stills/${name}-${frame}.png`),overwrite:true});
  }
  console.log(`${name}: style frames rendered`);
}
