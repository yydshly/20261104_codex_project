import fs from 'node:fs';
import {GLTFLoader} from '../vendor/addons/loaders/GLTFLoader.js';
export function loadReadingMotions(){
 const bytes=fs.readFileSync(new URL('../assets/reading/motions/reading-mocap.glb',import.meta.url));
 return new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
}
