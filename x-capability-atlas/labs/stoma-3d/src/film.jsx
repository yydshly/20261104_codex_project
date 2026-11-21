import React from 'react';
import {AbsoluteFill, Composition, Easing, Html5Audio, interpolate, registerRoot, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Specimen} from './scene.jsx';
import chapters from './chapters.json';

const FPS = 24;
const DURATION = 16 * FPS;
const interpolateOptions = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)};

function Lesson({revision}) {
  const frame = useCurrentFrame();
  const index = chapters.findLastIndex(({start}) => start <= frame);
  const chapter = chapters[index];
  const aperture = interpolate(frame, [88, 154], [.015, 1], interpolateOptions);
  const tilt = interpolate(frame, [231, 315], [7, 40], interpolateOptions);
  const yaw = interpolate(frame, [231, 315], [10, 36], interpolateOptions);
  const span = interpolate(frame, [0, 88, 160, 320], [4.75, 4.15, 3.9, 3.7], interpolateOptions);
  const measure = frame >= 154;

  return <AbsoluteFill style={{background: '#11271f', color: '#eff4e7', fontFamily: 'Microsoft YaHei, sans-serif'}}>
    <div style={{position: 'absolute', left: 42, top: 37, fontSize: 16, letterSpacing: '0.15em', color: '#c7df9f'}}>显微观察 / LEAF LAB 05</div>
    <div style={{position: 'absolute', right: 39, top: 38, fontSize: 15, color: '#bbcfbe'}}>结构示意 · 3D 模型 {revision === 'before' ? 'V1' : 'V2'}</div>
    <div style={{position: 'absolute', top: 83, left: 386, width: 855, height: 548, overflow: 'hidden', border: '1px solid #426757', borderRadius: 16}}>
      <ThreeCanvas width={855} height={548} orthographic gl={{antialias: true}}>
        <Specimen url={staticFile(`assets/stoma-${revision === 'before' ? 'v1' : 'v2'}.glb`)} aperture={aperture} tilt={tilt} yaw={yaw} span={span} measure={measure}/>
      </ThreeCanvas>
    </div>
    <div style={{position: 'absolute', left: 42, top: 110, width: 308}}>
      <div style={{fontSize: 62, lineHeight: 1, color: '#c7df9f', fontWeight: 750}}>0{index + 1}</div>
      <h1 style={{fontSize: 42, lineHeight: 1.23, margin: '25px 0 16px'}}>看见叶片气孔</h1>
      <h2 style={{fontSize: 26, lineHeight: 1.25, margin: 0, color: '#d2e6a8'}}>{chapter.title}</h2>
      <p style={{fontSize: 21, color: '#c6d7c8', margin: '12px 0'}}>{chapter.subtitle}</p>
      <div style={{display: 'flex', gap: 5, marginTop: 40}}>
        {chapters.map((step, i) => <div key={step.start} style={{height: 4, width: 45, borderRadius: 3, background: i === index ? '#d9ec9e' : '#4e675b'}}/>)}
      </div>
    </div>
    <div style={{position: 'absolute', left: 404, bottom: 34, color: '#f1f6e9', fontSize: 21}}>{chapter.cue}</div>
    <div style={{position: 'absolute', right: 39, bottom: 36, fontSize: 15, color: '#c7df9f', fontVariantNumeric: 'tabular-nums'}}>开合 {Math.round(aperture * 100)}%</div>
    {chapters.map((step, i) => <Sequence key={step.start} from={step.start + 7} layout="none">
      <Html5Audio src={staticFile(`narration/step-${i + 1}.wav`)}/>
    </Sequence>)}
  </AbsoluteFill>;
}

const settings = {component: Lesson, width: 1280, height: 720, fps: FPS, durationInFrames: DURATION};
registerRoot(() => <>
  <Composition id="StomaLesson" {...settings} defaultProps={{revision: 'after'}}/>
  <Composition id="StomaBaseline" {...settings} defaultProps={{revision: 'before'}}/>
</>);
