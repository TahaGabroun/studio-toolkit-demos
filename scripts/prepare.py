#!/usr/bin/env python3
"""Compile original demonstration briefs into frame-locked production artifacts.

Default uses the locally installed eSpeak NG shared library. --pulses supplies a
clearly labelled test track when speech synthesis is unavailable. No paid API.
"""
import argparse
import ctypes
import ctypes.util
import hashlib
import json
import math
import os
import shutil
import sys
from pathlib import Path
import numpy as np

ROOT=Path(__file__).resolve().parents[1]
TOOLKIT=Path(os.environ.get('STUDIO_TOOLKIT_ROOT',str(ROOT.parent/'studio-toolkit')))
sys.path.insert(0,str(TOOLKIT/'skills/studio-toolkit/scripts'))
from studio import init,write,read,frame,digest,align,validate,script_report,complete,STAGES
from media import wav,mix

DATA={
 'documentary':{
  'title':'Where does a tree get its mass?', 'language':'en', 'format':'landscape',
  'promise':'Explain how carbon from air becomes a major part of a tree’s dry mass.',
  'sources':{'plant':'https://openstax.org/books/biology-2e/pages/8-1-overview-of-photosynthesis'},
  'lines':[
   ('sunlight','A tree grows heavier each year. But much of its dry mass begins as an invisible gas in the air, not as soil.'),
   ('air-and-water','Leaves take in carbon dioxide. Roots supply water. Light energy powers reactions that let plants build organic molecules.'),
   ('sugars','Photosynthesis incorporates carbon into sugars. The plant uses these molecules as fuel and as building blocks for growth.'),
   ('biomass','Wood contains carbon that came from carbon dioxide. Water contributes much fresh mass, while minerals remain essential in smaller amounts.')],
  'visuals':['Open with a tree silhouette, then isolate the question of dry mass.','Construct labelled input arrows for carbon dioxide, water and light.','Trace carbon into a sugar unit; distinguish energy from matter.','Build a trunk from linked carbon units; retain a mineral side note.']},
 'vertical':{
  'title':'من الهواء إلى الخشب', 'language':'ar', 'format':'vertical',
  'promise':'Explain photosynthetic carbon fixation in an Arabic short with mixed scientific terminology.',
  'sources':{'plant':'https://openstax.org/books/biology-2e/pages/8-1-overview-of-photosynthesis'},
  'lines':[
   ('السؤال','من أين تأتي كتلة الشجرة؟ جزء كبير من كتلتها الجافة يبدأ من الهواء.'),
   ('الفكرة','تأخذ الأوراق ثاني أكسيد الكربون، أو CO2، وتستخدم طاقة الضوء.'),
   ('الدليل','يثبت البناء الضوئي الكربون في مركبات عضوية، منها السكريات.'),
   ('الخلاصة','يساهم هذا الكربون في بناء الخشب. والماء والمعادن ضروريان أيضا.')],
  'visuals':['Pose a clear question in Arabic.','Isolate CO₂ in an LTR span inside an RTL sentence.','Build an original molecule schematic.','Show material flow into a stylized trunk.']},
 'graphics':{
  'title':'Make the explanation visible.', 'language':'en', 'format':'square',
  'promise':'Show a reusable voice-to-frame mechanism with progressive typography and a shared camera.',
  'sources':{'design':'https://www.remotion.dev/docs/animating-properties'},
  'lines':[
   ('voice','Start with the voice. The explanation decides which object deserves attention.'),
   ('cue','Mark the exact cue. Store it once, on a shared frame timeline.'),
   ('focus','Build the relationship. Reveal the next connection while the current label stays readable.'),
   ('frame','Resolve into one composition. Voice, captions, and motion now share the same timing contract.')],
  'visuals':['Reveal a circular voice token with masked typography.','Draw a connector to a frame cue.','Move the shared camera slightly as a focus token activates.','Reveal the complete system and settle into a reading hold.']},
 'inflammation':{
  'title':'Acute inflammation, in focus', 'language':'en', 'format':'landscape',
  'promise':'Explain vascular changes, neutrophil recruitment and resolution using anatomically identified structures.',
  'sources':{'innate':'https://www.ncbi.nlm.nih.gov/books/NBK27122/','review':'https://pmc.ncbi.nlm.nih.gov/articles/PMC7123337/'},
  'lines':[
   ('injury-signal','Local injury activates resident cells. Their inflammatory mediators signal nearby vessels and recruit immune defenses.'),
   ('arteriolar-dilation','Arterioles dilate, increasing local blood flow. This contributes to the redness and warmth of acute inflammation.'),
   ('venular-permeability','Increased permeability, especially in postcapillary venules, lets fluid and plasma proteins enter tissue, contributing to swelling.'),
   ('neutrophil-recruitment','Neutrophils roll, adhere, and cross the venular wall. They then follow chemical signals toward the injury.'),
   ('resolution','When the trigger is controlled, active resolution limits recruitment and clears debris. These overlapping processes are compressed here for teaching.')],
  'visuals':['Identify a local injury above the vessel; dim the surrounding tissue.','Focus the arteriolar inflow and widen its lumen without calling a capillary an arteriole.','Identify postcapillary venule; show protein-rich fluid crossing into tissue.','Track a segmented-nucleus neutrophil through rolling, adhesion and transmigration.','Fade to a restrained repair state; label teaching-time compression, not a literal biological clock.']},
}

class Speech:
 def __init__(self):
  name=ctypes.util.find_library('espeak-ng')
  if not name:raise RuntimeError('eSpeak NG library missing. Install espeak-ng locally or rerun with --pulses.')
  self.lib=ctypes.CDLL(name);self.lib.espeak_Initialize.argtypes=[ctypes.c_int,ctypes.c_int,ctypes.c_char_p,ctypes.c_int]
  self.sr=self.lib.espeak_Initialize(2,0,None,0)
  if self.sr<1:raise RuntimeError('eSpeak initialization failed')
  self.samples=[]
  callback=ctypes.CFUNCTYPE(ctypes.c_int,ctypes.POINTER(ctypes.c_short),ctypes.c_int,ctypes.c_void_p)
  def collect(data,count,events):
   if count:self.samples.append(np.ctypeslib.as_array(data,shape=(count,)).copy())
   return 0
  self.callback=callback(collect);self.lib.espeak_SetSynthCallback(self.callback)
  self.lib.espeak_Synth.argtypes=[ctypes.c_void_p,ctypes.c_size_t,ctypes.c_uint,ctypes.c_int,ctypes.c_uint,ctypes.c_uint,ctypes.c_void_p,ctypes.c_void_p]
 def say(self,text,language):
  self.samples=[];self.lib.espeak_SetVoiceByName(language.encode());self.lib.espeak_SetParameter(1,145,0)
  value=text.encode()+b'\0';buf=ctypes.create_string_buffer(value)
  code=self.lib.espeak_Synth(buf,len(value),0,1,0,1,None,None)
  if code:raise RuntimeError(f'eSpeak failed: {code}')
  self.lib.espeak_Synchronize()
  if not self.samples:raise RuntimeError('No synthesized samples')
  x=np.concatenate(self.samples).astype(np.float32)/32768
  # Render each phrase separately; boundaries are measured from actual synthesized files.
  return np.interp(np.arange(round(len(x)*48000/self.sr))*self.sr/48000,np.arange(len(x)),x).astype(np.float32)

def prepare(name,speech,pulses=False):
 config=DATA[name];root=ROOT/'projects'/name
 if root.exists():
  # Source artifacts can be edited by a user. Rebuild requires an explicit flag at CLI.
  raise ValueError(f'Project exists: {root}; use --rebuild for these generated demo projects')
 init(root,config['title'],config['format'],30,120,config['language'])
 p=read(root/'project.json');p['engine']='remotion'
 fps=30;segments=[];samples=[];cursor=.4
 samples.append(np.zeros(round(cursor*48000),np.float32))
 for i,(target,text) in enumerate(config['lines']):
  if pulses:
   length=max(3,len(text.split())/2.4);audio=np.zeros(round(length*48000),np.float32)
   tt=np.arange(2400)/48000;audio[:2400]=.4*np.sin(2*np.pi*1200*tt)*np.sin(np.linspace(0,np.pi,2400))**2
  else:audio=speech.say(text,config['language'])
  start=cursor;end=start+len(audio)/48000
  segments.append({'id':f'cue-{i+1}','start_s':round(start,6),'end_s':round(end,6),'text':text})
  samples += [audio,np.zeros(24000,np.float32)];cursor=end+.5
 total=math.ceil(cursor*fps);all_samples=np.concatenate(samples);all_samples=np.pad(all_samples,(0,round(total/fps*48000)-len(all_samples)))
 p['duration_frames']=total;write(root/'project.json',p)
 wav(root/'assets/narration.wav',all_samples)
 write(root/'segments.json',{'segments':segments})
 script={'title':config['title'],'promise':config['promise'],'language':config['language'],'scenes':[]};story=[];scenes=[];events=[]
 for i,((target,text),segment,visual) in enumerate(zip(config['lines'],segments,config['visuals'])):
  sid=f'scene-{i+1}';start=0 if i==0 else frame(segment['start_s'],fps);end=frame(segments[i+1]['start_s'],fps) if i+1<len(segments) else total
  script['scenes'].append({'id':sid,'role':'hook' if i==0 else 'payoff' if i==len(segments)-1 else 'development','narration':text,'visual':visual,'source_ids':list(config['sources'])})
  story.append({'id':sid,'composition':visual,'targets':[target],'focus':target,'transition':'persistent-object handoff; settle during speech'})
  scenes.append({'id':sid,'start_frame':start,'end_frame':end})
  events.append({'id':f'event-{i+1}','start_frame':frame(segment['start_s'],fps),'end_frame':frame(segment['end_s'],fps),'target':target,'cue_id':segment['id'],'effect':'focus' if i!=3 else 'track'})
 write(root/'script.json',script);write(root/'storyboard.json',{'scenes':story});write(root/'timeline.json',{'fps':fps,'duration_frames':total,'scenes':scenes,'events':events})
 align(root,'assets/narration.wav',root/'segments.json','synthetic-test')
 write(root/'assets.json',{'assets':[{'id':'narration','path':'assets/narration.wav','sha256':digest(root/'assets/narration.wav'),'license':'CC0-1.0 generated demo audio','source':'Local eSpeak NG synthesis; original Studio Toolkit demo text' if not pulses else 'Original deterministic test pulses; not speech'}]})
 write(root/'mix.json',{'target_lufs':-16,'true_peak_db':-1.5,'tracks':[{'path':'assets/narration.wav','role':'narration','start_frame':0,'gain_db':0}]})
 write(root/'render-config.json',{'engine':'remotion','composition':{'documentary':'Documentary','vertical':'Vertical','graphics':'Graphics','inflammation':'Inflammation'}[name],**{k:p[k] for k in ['width','height','fps','duration_frames']},'codec':'h264','source_files':['animation.md']})
 (root/'brief.md').write_text(f"# {config['title']}\n\n{config['promise']}\n\nOriginal educational demonstration. Audience: curious general viewers. {p['width']} × {p['height']}, 30 fps.\n")
 (root/'research.md').write_text('# Research and limitations\n\n'+''.join(f'- {k}: {v}\n' for k,v in config['sources'].items())+'\nAll visuals are original schematics. Teaching time is compressed; the inflammation phases overlap in biology. No measured patient data.\n')
 (root/'script.md').write_text(f"# {config['title']}\n\nPromise: {config['promise']}\n\n"+'\n\n'.join(f"## {s['id']} — {seg['start_s']:.3f}–{seg['end_s']:.3f}s\n\n{s['narration']}\n\n[VISUAL: {s['visual']}]" for s,seg in zip(script['scenes'],segments)))
 (root/'strategy.md').write_text('# Packaging\n\nAudience promise: '+config['promise']+'\n\nThumbnail: one labelled mechanism and the central question. Test comprehension, not fabricated performance predictions.\n')
 (root/'design.md').write_text('# Design\n\nWarm paper, ink, one restrained rust accent. Noto Sans / Noto Sans Arabic (OFL). Large labels, narrative focus, mobile-safe captions, stable reading holds.\n')
 (root/'animation.md').write_text('# Renderer contract\n\nSource: src/StudioFilm.tsx with src/visuals/Biology.tsx and Mechanism.tsx in the demos repository. Events resolve cue IDs and exact target IDs from timeline.json. All animation is a pure function of frame. Full source-tree hashes are recorded separately by render.mjs.\n')
 (root/'publication.md').write_text('# Publication package\n\nTitle: '+config['title']+'\n\nDescription: '+config['promise']+'\n\nAttach captions.srt, sources, original schematic notice and generated test narration notice. Human visual, audio and scientific approval remain pending. No YouTube upload performed.\n')
 report=validate(root)
 if report['errors']:raise ValueError(report['errors'])
 mix(root)
 public=ROOT/'public'/name;public.mkdir(parents=True,exist_ok=True);shutil.copy2(root/'render/mix.wav',public/'mix.wav')
 write(root/'qa/script-check.json',script_report(script,fps))
 for stage in list(STAGES)[:10]:complete(root,stage)
 return {'demo':name,'duration_s':total/fps,'frames':total,'audio':'synthetic timing pulses' if pulses else 'local eSpeak generated speech','validation':report}

def main():
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--pulses',action='store_true');parser.add_argument('--rebuild',action='store_true');parser.add_argument('--only',choices=DATA)
 a=parser.parse_args();speech=None if a.pulses else Speech();results=[]
 for name in ([a.only] if a.only else DATA):
  target=ROOT/'projects'/name
  if a.rebuild and target.exists():shutil.rmtree(target)
  results.append(prepare(name,speech,a.pulses))
 print(json.dumps(results,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
