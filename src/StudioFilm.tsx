import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Biology} from './visuals/Biology';
import {Mechanism} from './visuals/Mechanism';

const palette = {paper:'#f4f0e7', ink:'#172b31', dim:'#516267', accent:'#a8442d', rule:'#c9c9be'};
export const ramp=(f:number,start:number,length=18)=>interpolate(f,[start,start+length],[0,1],{easing:Easing.bezier(.16,1,.3,1),extrapolateLeft:'clamp',extrapolateRight:'clamp'});
export type Event = {id:string;start_frame:number;end_frame:number;target:string;cue_id:string;effect:string};
export type FilmProps = {
  name:string;
  project:{title:string;language:string;direction:string;width:number;height:number;fps:number;duration_frames:number};
  timeline:{fps:number;duration_frames:number;scenes:{id:string;start_frame:number;end_frame:number}[];events:Event[]};
  narration:{audio:string;method:string;segments:{id:string;start_s:number;end_s:number;text:string}[]};
};
const bidiText=(text:string|undefined)=>(text??'').split(/\b(CO2|DNA|RNA|ATP)\b/g).map((part,i)=>/^(CO2|DNA|RNA|ATP)$/.test(part)?<bdi dir="ltr" key={i}>{part}</bdi>:part);

export const StudioFilm:React.FC<FilmProps>=({name,project,timeline,narration})=>{
  const frame=useCurrentFrame();const {width,height,fps}=useVideoConfig();const vertical=height>width;const square=height===width;
  const active=[...timeline.events].reverse().find(e=>frame>=e.start_frame)??timeline.events[0];
  const index=Math.max(0,timeline.events.findIndex(e=>e.id===active?.id));
  const cue=narration.segments.find(c=>frame>=Math.round(c.start_s*fps)&&frame<Math.round(c.end_s*fps));
  const progress=frame/project.duration_frames;const enter=active?ramp(frame,active.start_frame,14):1;
  const ar=project.direction==='rtl';
  return <AbsoluteFill style={{background:palette.paper,color:palette.ink,fontFamily:ar?'StudioArabic, StudioSans, sans-serif':'StudioSans, sans-serif',overflow:'hidden'}}>
    <style>{`
      @font-face{font-family:StudioSans;src:url('${staticFile('fonts/NotoSans-Regular.ttf')}')}
      @font-face{font-family:StudioSans;src:url('${staticFile('fonts/NotoSans-Bold.ttf')}');font-weight:700}
      @font-face{font-family:StudioArabic;src:url('${staticFile('fonts/NotoSansArabic-Regular.ttf')}')}
    `}</style>
    <Audio src={staticFile(`${name}/mix.wav`)}/>
    <div style={{position:'absolute',left:vertical?90:120,right:vertical?90:120,top:vertical?210:74,display:'flex',justifyContent:'space-between',fontSize:vertical?30:25,letterSpacing:ar?0:3,color:palette.dim}}>
      <span>STUDIO / FIELD NOTES</span><span>{String(index+1).padStart(2,'0')}</span>
    </div>
    <div style={{position:'absolute',left:vertical?90:120,right:vertical?90:120,top:vertical?315:145,fontSize:vertical?74:66,fontWeight:700,lineHeight:1.2,direction:ar?'rtl':'ltr'}}>{project.title}</div>
    <div style={{position:'absolute',left:vertical?80:square?90:110,top:vertical?560:square?300:280,width:width-(vertical?160:square?180:220),height:vertical?740:square?470:440}}>
      {name==='inflammation'?<Biology frame={frame} events={timeline.events} activeIndex={index}/>:<Mechanism frame={frame} events={timeline.events} activeIndex={index} variant={name} vertical={vertical||square}/>}
    </div>
    <div dir={ar?'rtl':'ltr'} style={{position:'absolute',left:vertical?90:140,right:vertical?90:140,bottom:vertical?220:square?95:80,fontSize:vertical?43:square?38:56,lineHeight:1.25,unicodeBidi:'plaintext',textAlign:ar?'right':'left'}}>{bidiText(cue?.text)}</div>
    <div style={{position:'absolute',left:0,bottom:0,height:7,width:width*progress,background:palette.accent}}/>
    <div style={{position:'absolute',right:vertical?90:120,bottom:vertical?145:45,fontSize:22,color:palette.dim}}>SCHEMATIC • {narration.method==='synthetic-test'?'TEST AUDIO / TIMING DEMO':'GENERATED NARRATION'}</div>
  </AbsoluteFill>;
};
