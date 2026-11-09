import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
test('clean checkout restores stage records without regeneration or paid services',()=>{
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'studio-clean-'));
  try{
    for(const name of ['documentary','vertical','graphics','inflammation']){
      fs.cpSync(path.join(root,'projects',name),path.join(temp,'projects',name),{recursive:true,filter:source=>!['state.json','render','qa'].includes(path.basename(source))});
      fs.mkdirSync(path.join(temp,'public',name),{recursive:true});
      fs.copyFileSync(path.join(root,'public',name,'mix.wav'),path.join(temp,'public',name,'mix.wav'));
    }
    const result=spawnSync(process.execPath,[path.join(root,'scripts/checkpoint.mjs')],{encoding:'utf8',env:{...process.env,STUDIO_DEMOS_ROOT:temp}});
    assert.equal(result.status,0,result.stdout+result.stderr);
    for(const name of ['documentary','vertical','graphics','inflammation']){
      const state=JSON.parse(fs.readFileSync(path.join(temp,'projects',name,'state.json'),'utf8'));
      assert.equal(Object.keys(state.stages).length,10);
      assert.ok(fs.statSync(path.join(temp,'projects',name,'render/mix.wav')).size>48000);
    }
  }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
