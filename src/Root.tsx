import React from 'react';
import {Composition} from 'remotion';
import {StudioFilm} from './StudioFilm';
import documentary from '../projects/documentary/project.json';
import vertical from '../projects/vertical/project.json';
import graphics from '../projects/graphics/project.json';
import inflammation from '../projects/inflammation/project.json';
import docTimeline from '../projects/documentary/timeline.json';
import vertTimeline from '../projects/vertical/timeline.json';
import gfxTimeline from '../projects/graphics/timeline.json';
import infTimeline from '../projects/inflammation/timeline.json';
import docNarration from '../projects/documentary/narration.json';
import vertNarration from '../projects/vertical/narration.json';
import gfxNarration from '../projects/graphics/narration.json';
import infNarration from '../projects/inflammation/narration.json';

export const Root: React.FC = () => <>
  {[
    ['Documentary', 'documentary', documentary, docTimeline, docNarration],
    ['Vertical', 'vertical', vertical, vertTimeline, vertNarration],
    ['Graphics', 'graphics', graphics, gfxTimeline, gfxNarration],
    ['Inflammation', 'inflammation', inflammation, infTimeline, infNarration],
  ].map(([id, name, p, timeline, narration]) => {
    const config = p as typeof documentary;
    return <Composition key={id as string} id={id as string} component={StudioFilm}
      width={config.width} height={config.height} fps={config.fps} durationInFrames={config.duration_frames}
      defaultProps={{name: name as string, project: config, timeline: timeline as typeof docTimeline, narration: narration as typeof docNarration}}/>;
  })}
</>;
