// Authored viewpoints share the same coast, sunset and animated character.
export const GUIDE_FRAMES = {
  shore:{
    desktop:{position:[-3.8,3.05,11.8],target:[6.5,2.45,-.5],fov:50},
    mobile:{position:[-4.2,3.0,11.8],target:[-.2,2.55,6.0],fov:55}
  },
  tide:{
    desktop:{position:[1.7,1.85,12.7],target:[17,1.15,-7.5],fov:49},
    mobile:{position:[1.0,1.9,12.3],target:[4.3,1.1,6.8],fov:55}
  }
};
export const PORTRAIT_FRAME={offset:[-.65,1.42,2.7],target:[.12,1.22,-.08],fov:33};
export const PORTRAIT_DETAILS={
 face:{offset:[-.28,1.63,1.0],target:[.006,1.60,-.01],fov:27},
 side:{offset:[.78,1.60,.8],target:[.006,1.60,-.01],fov:27},
 hands:{offset:[-.22,.87,1.3],target:[0,.86,0],fov:35}
};
export function guideFrame(stop,mobile=false){return GUIDE_FRAMES[stop]?.[mobile?'mobile':'desktop'];}
