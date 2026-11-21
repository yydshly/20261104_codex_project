// Shared bathymetry: terrain, wet sand and surf all use the same shoreline.
export function coastRadius(angle) {
  return .752 + .015*Math.sin(angle*3+.4) + .008*Math.sin(angle*7-.8) + .003*Math.sin(angle*13+1.2);
}
export function groundHeight(x,z) {
  const px=(x+16)/30,pz=(z-14)/22;
  const radius=coastRadius(Math.atan2(pz,px));
  return 1.5*(radius*radius-px*px-pz*pz);
}
export const COAST_GLSL = /* glsl */`
float coastRadius(float a){return .752+.015*sin(a*3.+.4)+.008*sin(a*7.-.8)+.003*sin(a*13.+1.2);}
float bedHeight(vec2 p){vec2 q=(p-vec2(-16.,14.))/vec2(30.,22.);float r=coastRadius(atan(q.y,q.x));return 1.5*(r*r-dot(q,q));}
float shoreDistance(vec2 p){vec2 q=(p-vec2(-16.,14.))/vec2(30.,22.);return (length(q)-coastRadius(atan(q.y,q.x)))*26.;}
`;
