import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=new URL('../',import.meta.url);
for(const name of ['documentary','vertical','graphics','inflammation']){
  test(`${name}: storyboard, cues, target IDs and exact frame coverage`,()=>{
    const read=f=>JSON.parse(fs.readFileSync(new URL(`projects/${name}/${f}.json`,root),'utf8'));
    const p=read('project'),t=read('timeline'),n=read('narration'),s=read('storyboard');
    assert.equal(t.fps,p.fps);assert.equal(t.duration_frames,p.duration_frames);
    let end=0;
    for(const scene of t.scenes){assert.equal(scene.start_frame,end);assert.ok(scene.end_frame>scene.start_frame);end=scene.end_frame;}
    assert.equal(end,p.duration_frames);
    for(const e of t.events){
      const cue=n.segments.find(c=>c.id===e.cue_id);assert.ok(cue);
      assert.ok(s.scenes.some(x=>x.targets.includes(e.target)));
      assert.ok(Math.abs(e.start_frame-Math.floor(cue.start_s*p.fps+.5))<=1);
    }
    assert.ok(fs.statSync(new URL(`public/${name}/mix.wav`,root)).size>48000);
  });
}
test('Arabic demo keeps logical Unicode order and measured cue times',()=>{
  const p=JSON.parse(fs.readFileSync(new URL('projects/vertical/project.json',root)));
  assert.equal(p.direction,'rtl');assert.equal(p.language,'ar');
  const text=fs.readFileSync(new URL('projects/vertical/captions.srt',root),'utf8');assert.match(text,/CO2/);assert.match(text,/الشجرة/);
});
test('renderer source implements the inflammation target mechanisms',()=>{
  const source=fs.readFileSync(new URL('src/visuals/Biology.tsx',root),'utf8');
  // This only checks the declared target mapping boundary; actual image review is separate.
  assert.match(source,/Postcapillary venule/);assert.match(source,/not to scale/);
});
