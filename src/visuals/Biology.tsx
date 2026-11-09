import React from 'react';
import {interpolate,Easing} from 'remotion';
import type {Event} from '../StudioFilm';

const progress=(f:number,a:number,b:number)=>interpolate(f,[a,b],[0,1],{easing:Easing.inOut(Easing.cubic),extrapolateLeft:'clamp',extrapolateRight:'clamp'});
export const Biology:React.FC<{frame:number;events:Event[];activeIndex:number}>=({frame,events,activeIndex})=>{
  const cue=(index:number)=>events[index]??events[0];
  const dilation=progress(frame,cue(1).start_frame,cue(1).start_frame+24);
  const leak=progress(frame,cue(2).start_frame,cue(2).end_frame);
  const recruitment=progress(frame,cue(3).start_frame,cue(3).end_frame);
  const resolution=progress(frame,cue(4).start_frame,cue(4).end_frame);
  const vesselY=210-dilation*20;
  const cellX=recruitment<.4?900+recruitment/.4*180:recruitment<.65?1080:1080+(recruitment-.65)/.35*130;
  const cellY=recruitment<.65?310:310+(recruitment-.65)/.35*105;
  const focus=(index:number)=>{
    const entered=progress(frame,cue(index).start_frame,cue(index).start_frame+12);
    const left=index+1<events.length?progress(frame,cue(index+1).start_frame,cue(index+1).start_frame+12):0;
    return .25+.75*entered*(1-left);
  };
  return <svg viewBox="0 0 1700 510" width="100%" height="100%" role="img" aria-label="Schematic arteriolar dilation and postcapillary venule recruitment, compressed teaching sequence">
    <defs>
      <pattern id="tissue" width="70" height="70" patternUnits="userSpaceOnUse"><path d="M8 25 Q35 8 59 34 T65 65" fill="none" stroke="#c6c5b8" strokeWidth="2"/></pattern>
    </defs>
    <rect x="0" y="0" width="1700" height="510" fill="url(#tissue)" opacity=".35"/>
    <text x="55" y="55" fontSize="55" fontWeight="700" fill="#172b31">{['Local injury signal','Arteriolar dilation','Venular permeability','Neutrophil recruitment','Active resolution'][activeIndex]}</text>
    <g opacity={1-resolution*.4}>
      <path d={`M50 ${vesselY} H720 V350 H50 Z`} fill="#e7b3a1" stroke="#a8503e" strokeWidth="5"/>
      <path d="M720 235 H880 V325 H720" fill="#e7b3a1" stroke="#a8503e" strokeWidth="3" opacity=".5"/>
      <path d="M880 210 H1640 V350 H880 Z" fill="#e7b3a1" stroke="#a8503e" strokeWidth="5"/>
      <path d={`M50 ${vesselY+16} H720 M50 334 H720 M880 226 H1640 M880 334 H1640`} stroke="#fff4e8" strokeWidth="4"/>
      {[180,430,650,1220,1450].map((x,i)=><ellipse key={x} cx={x+(frame%240)/240*40} cy={260+i%2*35} rx="31" ry="16" fill="#a8503e" opacity={activeIndex===1?1:.45}/>) }
      <g opacity={focus(1)}><path d="M130 165 h460" stroke="#a8442d" strokeWidth="5"/><path d="m570 152 24 13-24 13" fill="none" stroke="#a8442d" strokeWidth="5"/><text x="130" y="125" fontSize="36" fill="#172b31">Arteriole: increased flow</text></g>
      <g opacity={focus(2)}>
        {[0,1,2,3].map(i=><g key={i}><path d={`M${1030+i*110} 350 v${leak*80}`} stroke="#4e7b8e" strokeWidth="5" strokeDasharray="8 6"/>
          <circle cx={1030+i*110} cy={355+leak*80} r="7" fill="#4e7b8e"/></g>)}
        <text x="1070" y="495" fontSize="34" fill="#172b31">Protein-rich exudate</text>
      </g>
      <g opacity={focus(3)}>
        <path d="M900 310 H1080 Q1080 380 1210 415" fill="none" stroke="#5e7961" strokeWidth="4" strokeDasharray="9 8"/>
        <circle cx={cellX} cy={cellY} r="37" fill="#e8e4d6" stroke="#59715d" strokeWidth="6"/>
        {[[-13,-5],[4,-10],[13,8]].map(([x,y],i)=><ellipse key={i} cx={cellX+x} cy={cellY+y} rx="10" ry="15" fill="#6f6281"/>)}
        <text x="600" y="115" fontSize="38" fill="#172b31">Roll → adhere → cross</text>
        <path d="M800 134 800 180" stroke="#59715d" strokeWidth="3"/>
      </g>
    </g>
    <g opacity={focus(0)*(1-resolution)}>
      <path d="m1470 32 25 23-16 22 38 23" fill="none" stroke="#a8442d" strokeWidth="8"/>
      <circle cx="1485" cy="120" r="18" fill="#a8442d"/>
      <text x="1190" y="110" fontSize="35" fill="#172b31">Resident-cell signal</text>
    </g>
    <g opacity={resolution}>
      <rect x="240" y="100" width="1220" height="290" rx="12" fill="#f4f0e7" stroke="#5e7961" strokeWidth="3"/>
      <text x="310" y="205" fontSize="58" fill="#172b31">Resolution is active.</text>
      <text x="310" y="285" fontSize="38" fill="#516267">Debris clearance • mediator shutdown • repair</text>
      <path d="M310 325 H1360" stroke="#5e7961" strokeWidth="5" strokeDasharray="1050" strokeDashoffset={1050*(1-resolution)}/>
    </g>
    <g opacity={1-resolution}>
      <text x="55" y="400" fontSize="27" fill="#516267">Arteriole: dilation</text>
      <text x="900" y="180" fontSize="27" fill="#516267">Postcapillary venule: permeability + exit</text>
    </g>
    <text x="55" y="490" fontSize="23" fill="#516267">Schematic • connecting microcirculation compressed • not to scale</text>
  </svg>;
};
