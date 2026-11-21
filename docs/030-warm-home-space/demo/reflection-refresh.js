// Two buffers prevent the window shader from sampling the cube face currently
// being rendered. Rapid lighting changes replace pending work, not queue it.
export function createCubeRefresh({renderFace,complete,invalidate}){
  let front=0,back=1,face=6,captures=0;
  return {
    request(){face=0;},
    reset(){front=0;back=1;face=0;invalidate();},
    update(){
      if(face===6)return;
      renderFace(back,face);face++;
      if(face===6){[front,back]=[back,front];captures++;complete(front);}
    },
    status:()=>({pending:face<6,face,captures}),
  };
}
