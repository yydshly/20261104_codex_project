/* Full-scene GIF playback with exact pause/hold. Motion comes from GIF frames, never from a puppet rig. */
(function(root){
 'use strict';
 const canvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
 class StoryGif{
  static async load(url){const response=await fetch(url);if(!response.ok)throw new Error('GIF未能载入');const bytes=await response.arrayBuffer();const player=new StoryGif(GifuctDecoder.parseGIF(bytes));player.url=new URL(url,document.baseURI).href;player.bytes=bytes.byteLength;player.seek(0);return player;}
  constructor(parsed){
   this.parsed=parsed;this.frames=parsed.frames.filter(f=>f.image);if(!this.frames.length)throw new Error('GIF没有画帧');
   this.width=parsed.lsd.width;this.height=parsed.lsd.height;this.surface=canvas(this.width,this.height);this.ctx=this.surface.getContext('2d',{willReadFrequently:true});this.patch=canvas(1,1);this.pc=this.patch.getContext('2d');this.backup=canvas(this.width,this.height);this.bc=this.backup.getContext('2d');this.ends=[];this.duration=0;
   for(const frame of this.frames){this.duration+=Math.max(20,(frame.gce?.delay||10)*10);this.ends.push(this.duration);}this.index=-1;this.previous=null;
  }
  reset(){this.ctx.clearRect(0,0,this.width,this.height);this.index=-1;this.previous=null;}
  next(){
   const previous=this.previous;if(previous?.disposalType===2){const d=previous.dims;this.ctx.clearRect(d.left,d.top,d.width,d.height);const bg=this.parsed.lsd.backgroundColorIndex,color=this.parsed.gct?.[bg];if(color&&previous.transparentIndex!==bg){this.ctx.fillStyle='rgb('+color.join(',')+')';this.ctx.fillRect(d.left,d.top,d.width,d.height);}}
   else if(previous?.disposalType===3){this.ctx.clearRect(0,0,this.width,this.height);this.ctx.drawImage(this.backup,0,0);}
   const frame=GifuctDecoder.decompressFrame(this.frames[++this.index],this.parsed.gct,true),d=frame.dims;
   if(frame.disposalType===3){this.bc.clearRect(0,0,this.width,this.height);this.bc.drawImage(this.surface,0,0);}
   this.patch.width=d.width;this.patch.height=d.height;this.pc.putImageData(new ImageData(frame.patch,d.width,d.height),0,0);this.ctx.drawImage(this.patch,d.left,d.top);this.previous={dims:d,disposalType:frame.disposalType,transparentIndex:frame.transparentIndex};
  }
  seek(time){let frame=this.ends.findIndex(end=>time<end);if(frame<0)frame=this.frames.length-1;if(frame<this.index)this.reset();while(this.index<frame)this.next();return this.index;}
  draw(ctx,time){this.seek(time);ctx.fillStyle='#fff';ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);ctx.drawImage(this.surface,0,0,ctx.canvas.width,ctx.canvas.height);}
  info(){return{source:'gif-file',url:this.url,frame:this.index,frameCount:this.frames.length,durationMs:this.duration,width:this.width,height:this.height,bytes:this.bytes};}
 }
 root.StoryGif=StoryGif;
})(window);
