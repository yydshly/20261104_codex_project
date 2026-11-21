import fs from 'node:fs/promises';
import {MeshoptSimplifier} from '../.tools/geometry/node_modules/meshoptimizer/index.js';

await MeshoptSimplifier.ready;
const root=new URL('../assets/v9/island_tree_01/',import.meta.url);
const source=JSON.parse(await fs.readFile(new URL('island_tree_01_1k.gltf',root),'utf8'));
const original=await fs.readFile(new URL(source.buffers[0].uri,root));
const components={SCALAR:1,VEC2:2,VEC3:3,VEC4:4};
const types={5126:Float32Array,5125:Uint32Array,5123:Uint16Array,5121:Uint8Array};
function read(id){
  const a=source.accessors[id],view=source.bufferViews[a.bufferView],Type=types[a.componentType],width=components[a.type],bytes=Type.BYTES_PER_ELEMENT;
  const result=new Type(a.count*width),start=(view.byteOffset??0)+(a.byteOffset??0),stride=view.byteStride??width*bytes;
  for(let i=0;i<a.count;i++)new Uint8Array(result.buffer,i*width*bytes,width*bytes).set(original.subarray(start+i*stride,start+i*stride+width*bytes));
  return result;
}
const report=[];
for(const [lod,ratios]of [['near',[.42,.20,.07]],['far',[.20,.075,.025]]]){
  const buffers=[],views=[],accessors=[];let offset=0;
  function accessor(data,template,target){
    const bytes=Buffer.from(data.buffer,data.byteOffset,data.byteLength);const pad=(4-offset%4)%4;if(pad){buffers.push(Buffer.alloc(pad));offset+=pad;}
    const view=views.push({buffer:0,byteOffset:offset,byteLength:bytes.length,target})-1;buffers.push(bytes);offset+=bytes.length;
    const info={...template,bufferView:view,byteOffset:0,count:data.length/components[template.type]};delete info.sparse;
    if(template.type==='VEC3'&&template.min){const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(let i=0;i<data.length;i++) {min[i%3]=Math.min(min[i%3],data[i]);max[i%3]=Math.max(max[i%3],data[i]);}info.min=min;info.max=max;}
    return accessors.push(info)-1;
  }
  let total=0;
  const meshes=source.meshes.map(mesh=>({...mesh,primitives:mesh.primitives.map((p,part)=>{
    const positions=read(p.attributes.POSITION),input=new Uint32Array(read(p.indices));
    const target=Math.floor(input.length*ratios[part]/3)*3;
    const [indices,error]=MeshoptSimplifier.simplify(input,positions,3,target,.035,['Prune','Permissive']);
    const [remap,count]=MeshoptSimplifier.compactMesh(indices),attributes={};
    for(const [key,id]of Object.entries(p.attributes)){
      const values=read(id),width=components[source.accessors[id].type],compact=new values.constructor(count*width);
      for(let old=0;old<remap.length;old++)if(remap[old]!==0xffffffff)for(let k=0;k<width;k++)compact[remap[old]*width+k]=values[old*width+k];
      attributes[key]=accessor(compact,source.accessors[id],34962);
    }
    const index=accessor(indices,{componentType:5125,type:'SCALAR'},34963);total+=indices.length/3;
    report.push({lod,part,sourceTriangles:input.length/3,triangles:indices.length/3,error});
    return {...p,attributes,indices:index};
  })}));
  const binary=Buffer.concat(buffers),gltf={...source,meshes,buffers:[{uri:`island_tree_01_${lod}.bin`,byteLength:binary.length}],bufferViews:views,accessors};
  await fs.writeFile(new URL(`island_tree_01_${lod}.bin`,root),binary);
  await fs.writeFile(new URL(`island_tree_01_${lod}.gltf`,root),JSON.stringify(gltf));
  console.log(lod,total,'triangles',binary.length,'bytes');
}
await fs.writeFile(new URL('optimization.json',root),JSON.stringify({tool:'meshoptimizer',source:'island_tree_01_1k.gltf',levels:report},null,2));
