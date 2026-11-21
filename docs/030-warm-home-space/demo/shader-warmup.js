// Compile both cutout variants before navigation resumes. Main colour targets
// use MSAA, while cube probes do not; seeing a previously hidden room should
// not trigger its first expensive material compilation after recovery.
export async function prewarmSceneShaders(renderer,scenes,camera,target){
  const previous=renderer.getRenderTarget(),face=renderer.getActiveCubeFace(),mip=renderer.getActiveMipmapLevel(),cutouts=new Map();
  for(const scene of scenes)scene.traverse(node=>{
    const materials=Array.isArray(node.material)?node.material:[node.material];
    for(const material of materials)if(material?.alphaTest>0&&!cutouts.has(material))cutouts.set(material,material.alphaToCoverage);
  });
  try{
    renderer.setRenderTarget(target);
    for(const coverage of [false,true]){
      for(const material of cutouts.keys())if(material.alphaToCoverage!==coverage){material.alphaToCoverage=coverage;material.needsUpdate=true;}
      for(const scene of scenes){
        if(renderer.getContext().isContextLost())throw Error('Context lost during shader warmup');
        await renderer.compileAsync(scene,camera);
      }
    }
  }finally{
    for(const [material,coverage]of cutouts)if(material.alphaToCoverage!==coverage){material.alphaToCoverage=coverage;material.needsUpdate=true;}
    renderer.setRenderTarget(previous,face,mip);
  }
}
