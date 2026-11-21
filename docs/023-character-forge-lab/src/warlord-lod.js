/** Share one skin/material set across precomputed geometry LODs. */
export async function loadGeometryLODs(loader, highModel, urls) {
  const high = new Map(); highModel.traverse(o => { if(o.isMesh) high.set(o.name,o); });
  const lookup = new Map([...high].map(([name,mesh])=>[name,[mesh.geometry]]));
  for (const url of urls) {
    const gltf = await loader.loadAsync(url);
    const matched = new Set();
    gltf.scene.traverse(mesh => {
      if(!mesh.isMesh) return;
      const original = high.get(mesh.name);
      if (!original) throw new Error(`LOD网格名称不匹配：${mesh.name}`);
      if (mesh.isSkinnedMesh && original.isSkinnedMesh && mesh.skeleton.bones.map(b=>b.name).join('|') !== original.skeleton.bones.map(b=>b.name).join('|')) throw new Error('LOD骨骼顺序不一致');
      lookup.get(mesh.name).push(mesh.geometry); matched.add(mesh.name);
      (Array.isArray(mesh.material)?mesh.material:[mesh.material]).forEach(m=>m.dispose());
    });
    for(const name of high.keys()) if(!matched.has(name)) throw new Error(`LOD缺少网格：${name}`);
  }
  return lookup;
}

export function attachGeometryLOD(model, lookup) {
  const parts=[]; let current=-1;
  model.traverse(mesh=>{if(mesh.isMesh && lookup.has(mesh.name)) parts.push({mesh,levels:lookup.get(mesh.name)});});
  return { set(level) { if(level===current)return; current=level; for(const part of parts) part.mesh.geometry=part.levels[Math.min(level,part.levels.length-1)]; }, get level(){return current;}, parts:parts.length };
}
