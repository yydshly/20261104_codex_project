import {RenderPass} from './vendor/addons/postprocessing/RenderPass.js';

/** Shared camera/depth, separate lighting rigs. Both layers occupy the same continuous world. */
export class ReadingLayerPass extends RenderPass{
 constructor(scene,camera,layer,{clear=true}={}){super(scene,camera);this.layer=layer;this.clear=clear;}
 render(...args){const mask=this.camera.layers.mask,background=this.scene.background,renderer=args[0],autoClear=renderer.autoClear;
  try{this.camera.layers.set(this.layer);if(!this.clear)this.scene.background=null;super.render(...args);}
  finally{this.camera.layers.mask=mask;this.scene.background=background;renderer.autoClear=autoClear;}
 }
}
