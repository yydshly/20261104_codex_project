import React, {useLayoutEffect, useMemo} from 'react';
import {useLoader, useThree} from '@react-three/fiber';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

function midpoint(cell, left, fullyOpen) {
  let edge = left ? -Infinity : Infinity;
  cell.traverse((part) => {
    const vertices = part.geometry?.attributes.position;
    const delta = part.geometry?.morphAttributes.position?.[part.morphTargetDictionary?.Aperture];
    if (!vertices || !delta) return;
    for (let index = 0; index < vertices.count; index++) {
      if (Math.abs(vertices.getZ(index)) > .0001) continue;
      const x = vertices.getX(index) + (fullyOpen ? delta.getX(index) : 0);
      edge = left ? Math.max(edge, x) : Math.min(edge, x);
    }
  });
  return edge;
}

export function useSpecimen(url) {
  const asset = useLoader(GLTFLoader, url);
  return useMemo(() => {
    const model = asset.scene.clone(true);
    const left = model.getObjectByName('GuardCell_L');
    const right = model.getObjectByName('GuardCell_R');
    const guardParts = [];
    for (const cell of [left, right]) {
      cell.traverse((part) => {
        if (part.morphTargetDictionary?.Aperture !== undefined) guardParts.push(part);
      });
    }
    const closed = midpoint(right, false, false) - midpoint(left, true, false);
    const open = midpoint(right, false, true) - midpoint(left, true, true);
    if (!guardParts.length || !Number.isFinite(open) || open <= closed) throw new Error('The GLB has no readable aperture shape');
    return {model, guardParts, closed, open};
  }, [asset]);
}

function CameraRig({tilt, yaw, span}) {
  const {camera, size, invalidate} = useThree();
  useLayoutEffect(() => {
    const angle = tilt * Math.PI / 180;
    const direction = yaw * Math.PI / 180;
    const offset = Math.sin(angle) * 8;
    camera.position.set(Math.sin(direction) * offset, Math.cos(angle) * 8, Math.cos(direction) * offset + .001);
    camera.up.set(0, 0, -1);
    camera.lookAt(0, .08, 0);
    camera.zoom = size.height / span;
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, size.height, tilt, yaw, span, invalidate]);
  return null;
}

export function Specimen({url, aperture, tilt = 14, yaw = 18, span = 4.1, measure = false, onLoad}) {
  const specimen = useSpecimen(url);
  const invalidate = useThree((state) => state.invalidate);
  const width = specimen.closed + (specimen.open - specimen.closed) * aperture;
  useLayoutEffect(() => {
    for (const part of specimen.guardParts) part.morphTargetInfluences[part.morphTargetDictionary.Aperture] = aperture;
    invalidate();
  }, [specimen, aperture, invalidate]);
  useLayoutEffect(() => {
    onLoad?.({closed: specimen.closed, open: specimen.open});
  }, [specimen, onLoad]);
  return <>
    <CameraRig tilt={tilt} yaw={yaw} span={span}/>
    <color attach="background" args={['#0c221a']}/>
    <ambientLight intensity={.58}/>
    <directionalLight position={[-3, 6, -4]} intensity={2.1} color="#fff1c9"/>
    <directionalLight position={[2, 2, 4]} intensity={.85} color="#b4ead9"/>
    <primitive object={specimen.model}/>
    {measure && aperture > .055 && <group position={[0, .34, 0]}>
      <mesh>
        <boxGeometry args={[width, .009, .015]}/>
        <meshBasicMaterial color="#fff2ac"/>
      </mesh>
      {[-1, 1].map((side) => <mesh key={side} position={[side * width / 2, 0, 0]}>
        <boxGeometry args={[.016, .012, .11]}/>
        <meshBasicMaterial color="#fff2ac"/>
      </mesh>)}
    </group>}
  </>;
}
