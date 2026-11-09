import React from 'react';
import {interpolate,Easing} from 'remotion';
import type {Event} from '../StudioFilm';

export const Mechanism:React.FC<{frame:number;events:Event[];activeIndex:number;variant:string;vertical:boolean}>=({frame,events,activeIndex,variant,vertical})=>{
  const points=vertical?[[170,105],[720,105],[720,345],[170,345]]:[[200,260],[630,260],[1060,260],[1490,260]];
  const labels=variant==='graphics'?['VOICE','CUE','FOCUS','FRAME']:variant==='vertical'?['سؤال','فكرة','دليل','خلاصة']:['SUNLIGHT','AIR + WATER','SUGARS','BIOMASS'];
  const event=events[activeIndex];const travel=event?interpolate(frame,[event.start_frame,event.start_frame+24],[0,1],{easing:Easing.inOut(Easing.cubic),extrapolateLeft:'clamp',extrapolateRight:'clamp'}):1;
  const zoom=variant==='graphics'?1+Math.sin(Math.PI*travel)*.035:1;
  const centerX=vertical?450:850;const centerY=255;
  return <svg viewBox={vertical?'0 0 900 510':'0 0 1700 510'} width="100%" height="100%" role="img" aria-label="Progressively constructed explanatory mechanism">
    <g transform={`translate(${centerX} ${centerY}) scale(${zoom}) translate(${-centerX} ${-centerY})`}>
      {points.slice(0,-1).map(([x,y],i)=>{
        const [nx,ny]=points[i+1];const length=Math.hypot(nx-x,ny-y);
        const e=events[Math.min(i+1,events.length-1)];const draw=interpolate(frame,[e.start_frame,e.start_frame+24],[0,1],{easing:Easing.inOut(Easing.cubic),extrapolateLeft:'clamp',extrapolateRight:'clamp'});
        const dx=(nx-x)/length,dy=(ny-y)/length;
        const route=vertical&&i===1?`M${x+82} ${y} H855 V${ny} H${nx+82}`:`M${x+dx*82} ${y+dy*82} L${nx-dx*82} ${ny-dy*82}`;
        return <path key={i} d={route} pathLength="1" stroke="#75887c" fill="none" strokeWidth="6" strokeDasharray="1" strokeDashoffset={1-draw}/>;
      })}
      {points.map(([x,y],i)=>{
        const e=events[Math.min(i,events.length-1)];const reveal=interpolate(frame,[e.start_frame,e.start_frame+22],[0,1],{easing:Easing.bezier(.16,1,.3,1),extrapolateLeft:'clamp',extrapolateRight:'clamp'});
        const focused=i===Math.min(activeIndex,3);
        return <g key={i} transform={`translate(${x} ${y+(1-reveal)*24}) scale(${.85+.15*reveal})`} opacity={reveal*(focused?1:.55)}>
          <circle r="76" fill={focused?'#a8442d':'#e3e2d6'} stroke={focused?'#a8442d':'#a6afa4'} strokeWidth="3"/>
          {variant==='documentary'?<g stroke={focused?'#fff8e9':'#172b31'} fill="none" strokeWidth="4">
            {i===0?<><circle r="29"/>{Array.from({length:8},(_,n)=><path key={n} d="M0 -42 v-13" transform={`rotate(${n*45})`}/>)}</>:i===1?<><circle r="18"/><circle cx="-45" r="13"/><circle cx="45" r="13"/><path d="M-32 0 h14 M18 0 h14"/></>:i===2?<><path d="m0-45 39 23 v44 l-39 23-39-23 v-44Z"/><path d="M0 45 v12 M39-22 l12-7 M-39-22 l-12-7"/></>:<><path d="M-8 50 V5 H8 V50 M0 5 l-28-20 M0-5 l25-20"/><path d="M-49-14 Q-67-57-25-58 Q0-88 27-57 Q72-49 49-12 Q23 10 0-1 Q-34 8-49-14Z"/></>}
          </g>:<text textAnchor="middle" y="17" fontSize="48" fontWeight="700" fill={focused?'#fff8e9':'#172b31'}>{String(i+1).padStart(2,'0')}</text>}
          <text textAnchor="middle" y="140" fontSize={vertical?39:60} fontWeight="700" fill="#172b31">{labels[i]}</text>
        </g>;
      })}
    </g>
  </svg>;
};
