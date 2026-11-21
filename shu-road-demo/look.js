(() => {
  'use strict';

  // The base shaders supply the renderer interface and the shared world-space noise.
  function replaceMain(source, body) {
    const start=source.indexOf('void main()');
    if (start<0) throw new Error('Shu Road fragment shader has no main function');
    return source.slice(0,start)+body;
  }

  function sky(source) {
    return replaceMain(source,`
      void main() {
        vec3 ray=normalize(uForward+uRight*vScreen.x/uLens.x+uUp*vScreen.y/uLens.y);
        float altitude=max(ray.y,0.0);
        float warmth=max(uEffects.z,0.0);
        vec3 daylight=normalize(vec3(-.46,.51,-.72));
        float nearSun=max(0.0,dot(ray,daylight));
        vec3 horizon=mix(vec3(.70,.78,.78),vec3(.94,.79,.59),warmth*.68);
        vec3 zenith=mix(vec3(.265,.46,.59),vec3(.39,.47,.56),warmth*.51);
        vec3 sky=mix(horizon,zenith,pow(clamp(altitude*1.26,0.0,1.0),.58));
        sky=mix(sky,vec3(.96,.86,.67),pow(nearSun,6.0)*(.24+warmth*.26));

        // Sample clouds in world directions so they move independently of the camera.
        vec2 veilPlane=ray.xz / max(.19,ray.y+.23);
        vec3 clouds=vec3(veilPlane.x*1.54-uTime*.018,6.0,veilPlane.y*1.82);
        float vapour=wash(clouds);
        float illuminated=smoothstep(.35,.67,vapour);
        float veil=smoothstep(.44,.75,vapour)*smoothstep(-.16,.12,ray.y);
        vec3 cloudTone=mix(vec3(.57,.67,.71),vec3(.98,.93,.80),illuminated);
        sky=mix(sky,cloudTone,veil*(.48+warmth*.19));
        float sunDisk=smoothstep(.9990,.99948,nearSun);
        sky=mix(sky,vec3(1.0,.91,.70),sunDisk*uSunVisible*(1.0-smoothstep(.08,.48,uEffects.w))*(.80-veil*.52));
        sky=mix(sky,uPaper,.025);

        vec3 moonRay=normalize(vec3(-.30,.36,-.89));
        float moonAngle=dot(ray,moonRay);
        float moonDisk=smoothstep(.9986,.9990,moonAngle);
        float halo=pow(max(moonAngle,0.0),38.0);
        vec3 darkSky=mix(vec3(.093,.164,.224),vec3(.020,.048,.101),pow(altitude,.68));
        darkSky+=vec3(.11,.19,.25)*halo;
        darkSky=mix(darkSky,vec3(.15,.23,.30),veil*.48);
        vec3 starGrid=ray*163.0;
        float stars=step(.991,random(floor(starGrid)))*(1.0-smoothstep(.065,.18,length(fract(starGrid)-.5)));
        darkSky+=vec3(.67,.75,.85)*stars*smoothstep(.06,.22,ray.y)*(1.0-veil*.75);
        darkSky=mix(darkSky,vec3(.88,.91,.83),moonDisk*smoothstep(.32,.72,uEffects.w)*(.94-veil*.38));
        sky=mix(sky,darkSky,uEffects.w);
        if (uStarField.w>.001) sky+=vec3(.98,.85,.57)*constellations(ray);
        sky+=(random(vec3(gl_FragCoord.xy,2.0))-.5)*.009;
        gl_FragColor=vec4(sky,1.0);
      }
    `);
  }

  function mesh(source) {
    return replaceMain(source,`
      float meanValleyDensity(float startHeight,float endHeight) {
        float a=max(startHeight+8.0,0.0);
        float b=max(endHeight+8.0,0.0);
        float heightDelta=b-a;
        float scaleHeight=19.0;
        if (abs(heightDelta)<.35) return exp(-.5*(a+b)/scaleHeight);
        return (exp(-a/scaleHeight)-exp(-b/scaleHeight))*scaleHeight/heightDelta;
      }

      vec3 crag(vec3 p,vec3 n,vec3 lightDirection,float range) {
        float plateau=grain(p*.115+vec3(17,4,8));
        float fracture=grain(p*vec3(.75,.24,.81)+vec3(0,plateau*2.1,3));
        vec3 warped=p+vec3(plateau*3.1,fracture*.74,plateau*1.6);
        float strata=grain(warped*vec3(.19,1.16,.17));
        float seam=smoothstep(.62,.81,strata)
          *smoothstep(.49,.73,grain(p*.29+vec3(2,7,1)));
        float joint=grain(warped*vec3(.81,.09,.72));
        float verticalCrack=(1.0-smoothstep(.010,.042,abs(joint-.46)))
          *smoothstep(.45,.72,grain(p*.22+vec3(9,3,4)));
        float edgeRib=smoothstep(.18,.62,fracture);
        float stoneLight=clamp(.23+plateau*.47+edgeRib*.24-seam*.18-verticalCrack*.12,0.0,1.0);
        vec3 dryStone=mix(vec3(.207,.230,.231),vec3(.60,.565,.476),stoneLight);
        float mineral=smoothstep(.55,.84,grain(p*.47+vec3(3,9,1)));
        dryStone=mix(dryStone,vec3(.63,.542,.422),mineral*.23);
        float shadowing=1.0-seam*.13-(1.0-edgeRib)*.13;

        float mossCover=smoothstep(.49,.82,plateau+max(n.y,0.0)*.26+(fracture-.5)*.39);
        vec3 moss=mix(vec3(.144,.234,.151),vec3(.288,.36,.215),fracture);
        vec3 albedo=mix(dryStone,moss,mossCover*.43);
        float closeup=1.0-smoothstep(15.0,78.0,range);
        if (closeup>.005) {
          // Fine cuts, grit and lichen remain anchored in the cliff as the viewpoint moves.
          float grit=grain(p*3.7+vec3(6,2,9));
          float lichen=grain(p*1.95+vec3(7,19,11));
          float crack=smoothstep(.68,.84,grain(warped*vec3(3.1,.65,2.6)))
            *smoothstep(.48,.72,grit);
          albedo*=1.0+closeup*((grit-.5)*.33-crack*.14);
          albedo=mix(albedo,vec3(.57,.56,.44),smoothstep(.68,.87,lichen)*closeup*.34);
          vec3 perturb=vec3(grit-.5,lichen-.5,fracture-.5);
          n=normalize(n+(perturb-n*dot(perturb,n))*closeup*.34);
        }

        float skyFacing=clamp(n.y*.5+.5,0.0,1.0);
        float direct=max(dot(n,lightDirection),0.0);
        float rim=pow(max(0.0,dot(n,lightDirection)*.64+.36),3.5);
        vec3 diffuse=vec3(.53,.66,.73)*(.73+skyFacing*.24);
        diffuse+=vec3(.67,.50,.32)*(direct*.80+rim*.21);
        return albedo*diffuse*shadowing;
      }

      vec3 timber(vec3 p,vec2 uv,float light,float glint,float range) {
        float age=grain(p*.46+vec3(9,0,0));
        float worn=grain(vec3(uv.x*2.5+age*5.0,uv.y*11.0,age*7.0));
        float growth=sin(uv.y*68.0+worn*4.0+age*5.0)*.5+.5;
        float detail=1.0-smoothstep(10.0,45.0,range);
        float grooves=smoothstep(.57,.92,growth)*detail;
        float warmth=clamp(.19+age*.27+worn*.41-grooves*.19,0.0,1.0);
        vec3 color=mix(vec3(.185,.108,.062),vec3(.515,.347,.206),warmth);
        color*=.68+light*.66;
        return color+vec3(.22,.168,.104)*glint*(.33+age*.49);
      }

      vec3 current(vec2 uv,vec3 p,vec3 n,float range,float glint,float time) {
        float steep=1.0-smoothstep(.30,.82,abs(n.y));
        float columns=grain(vec3(uv.x*34.0,uv.y*3.1-time*.24,7));
        float threads=grain(vec3(uv.x*73.0+columns*2.8,uv.y*19.0-time*4.1,4));
        float foam=smoothstep(.43,.78,columns*.48+threads*.63);
        vec3 waterfall=mix(vec3(.18,.34,.36),vec3(.86,.947,.929),foam*.78+.13);
        waterfall+=vec3(.13,.16,.15)*smoothstep(.68,.88,threads);
        float longitudinal=grain(vec3(uv.x*37.0,uv.y*24.0-time*.72,15));
        float turbulence=grain(vec3(uv.x*12.0+longitudinal*.52,uv.y*39.0-time*1.1,9));
        float banks=(1.0-smoothstep(0.0,.13,min(uv.x,1.0-uv.x)))*.29;
        float flecks=smoothstep(.67,.85,turbulence)*(.3+.7*longitudinal);
        float fresnel=pow(1.0-clamp(abs(dot(normalize(uEye-p),n)),0.0,1.0),3.0);
        vec3 stream=mix(vec3(.059,.155,.159),vec3(.35,.49,.49),fresnel*.65+longitudinal*.19+banks);
        stream=mix(stream,vec3(.78,.862,.83),flecks*.68);
        stream+=vec3(.30,.32,.28)*glint*(.2+.8*longitudinal);
        return mix(stream,waterfall,steep);
      }

      void main() {
        vec3 p=vPoint, n=normalize(vNormal);
        vec3 toEye=uEye-p;
        float range=length(toEye);
        vec3 facing=toEye/max(range,.001);
        vec3 lightDirection=normalize(vec3(-.46,.60,-.66));
        float light=clamp(dot(n,lightDirection)*.69+.42,0.0,1.0);
        float glint=pow(max(0.0,dot(reflect(-lightDirection,n),facing)),15.0);
        float material=vInfo.x;
        float valley=meanValleyDensity(uEye.y,p.y);
        float opticalDepth=range*(.0036+.023*valley*clamp(uEffects.x,.55,1.65));
        float haze=1.0-exp(-opticalDepth);
        float warmth=max(0.0,uEffects.z);
        float sunThroughMist=pow(max(dot(-facing,lightDirection),0.0),4.0);
        vec3 daytimeMist=mix(vec3(.54,.665,.704),vec3(.76,.816,.788),valley*.67);
        daytimeMist=mix(daytimeMist,vec3(.89,.758,.557),warmth*.42+sunThroughMist*.17);
        vec3 nightMist=mix(vec3(.122,.215,.296),vec3(.176,.276,.359),valley*.5);
        vec3 fog=mix(daytimeMist,nightMist,uEffects.w);
        vec3 color;

        if (material < .5 || abs(material-13.0)<.5 || abs(material-14.0)<.5) {
          color=crag(p,n,lightDirection,range);
          if (abs(material-13.0)<.5) color=mix(color,vec3(.58,.55,.43),.46);
          if (abs(material-14.0)<.5) {
            float damp=wash(p*vec3(1.2,.5,1.2));
            color*=.63+.30*damp;
            color+=vec3(.07,.08,.075)*glint*damp;
          }
        } else if (material < 1.5) {
          color=timber(p,vInfo.yz,light,glint,range);
        } else if (material < 2.5) {
          float soil=wash(p*1.8+vec3(9,2,7));
          float litter=grain(p*vec3(17.0,2.0,15.0));
          color=mix(vec3(.077,.087,.060),vec3(.253,.223,.142),soil*.72+litter*.19);
          color=mix(color,vec3(.13,.218,.103),smoothstep(.50,.75,soil)*.65);
          color*=.64+light*.53;
        } else if (material < 3.5) {
          color=current(vInfo.yz,p,n,range,glint,uTime*uEffects.y);
        } else if (material < 4.5) {
          color=mix(vec3(.25,.063,.031),vec3(.70,.216,.095),light*.77);
        } else if (material < 5.5) {
          color=vec3(.59,.36,.19)*(.69+light*.43);
        } else if (material < 6.5) {
          color=mix(vec3(.312,.188,.086),vec3(.84,.647,.34),light*.85);
        } else if (material < 7.5) {
          vec2 uv=vInfo.yz;
          vec2 edge=min(uv,1.0-uv);
          float taper=smoothstep(0.0,.35,edge.x)*smoothstep(0.0,.32,edge.y);
          float drifting=wash(vec3((p.x-uTime*.64)*.031,p.y*.09,p.z*.043+uTime*.012));
          float cloudlet=smoothstep(.38,.79,drifting);
          // At grazing angles the integrated valley haze takes over from the broad mist cards.
          float broadside=smoothstep(.045,.34,abs(dot(n,facing)));
          float alpha=taper*cloudlet*broadside*smoothstep(12.0,39.0,range)
            *clamp((.21+valley*.13)*uEffects.x,0.0,.46);
          gl_FragColor=vec4(mix(fog,mix(vec3(.85,.881,.83),nightMist,uEffects.w),.25),alpha);
          return;
        } else if (material < 8.5) {
          float ripple=grain(vec3(p.x*.36,7,p.z*1.65+uTime*.75*uEffects.y));
          float reflection=pow(1.0-abs(facing.y),3.0);
          color=mix(vec3(.179,.343,.349),vec3(.48,.626,.631),ripple*.54+reflection*.34);
          color+=vec3(.14,.15,.13)*glint;
        } else if (material < 9.5) {
          color=vec3(.79,.84,.80)*(.65+light*.35);
        } else if (material < 10.5) {
          color=vec3(.87,.53,.21)*(.79+light*.30);
        } else if (material < 11.5) {
          color=vec3(.095,.122,.107)*(.60+light*.69);
        } else if (material<14.5) {
          color=vec3(.16,.245,.25)*(.56+light*.66);
        } else if (material<15.5) {
          color=vec3(1.0,.77,.32)*1.12;
        } else if (material<16.5) {
          color=mix(vec3(.20,.25,.105),vec3(.45,.40,.21),vInfo.z)*(.58+light*.54);
        } else if (material<18.5) {
          vec2 fur=vInfo.yz;
          float hairs=grain(vec3(fur*vec2(94.0,155.0),4.0));
          float stripe=1.0-smoothstep(.13,.27,abs(sin(fur.y*28.0+sin(fur.x*21.0)*1.13+sin(fur.y*51.0)*.18)));
          vec3 coat=material<17.5?mix(vec3(.58,.25,.065),vec3(.052,.045,.030),stripe*.91)
            :mix(vec3(.20,.205,.177),vec3(.41,.414,.328),fur.x*.29+hairs*.29);
          color=coat*(.65+light*.56)*( .91+hairs*.15);
        } else if (material<19.5) {
          color=vec3(.22,.27,.26)*(.48+light*.54);
        } else if (material<21.5) {
          vec2 uv=vInfo.yz;
          if (material<20.5) {
            vec2 q=(uv-.5)*2.0;
            float silhouette=1.0-dot(q*vec2(.91,1.0),q*vec2(.91,1.0));
            float needles=abs(sin((uv.x+(uv.y-.5)*.24)*63.0+sin(uv.y*17.0)*.8));
            if(silhouette<.04 || (needles<.23 && abs(q.y)>.16)) discard;
          }
          float variation=grain(p*2.0);
          color=mix(vec3(.039,.102,.063),vec3(.217,.338,.143),light*.67+variation*.25);
          float backlit=pow(max(dot(-n,lightDirection),0.0),2.0);
          color+=vec3(.11,.15,.039)*backlit*.48;
        } else {
          float bark=grain(p*vec3(8.0,.9,8.0));
          float groove=smoothstep(.58,.79,grain(p*vec3(3.4,.25,3.4)));
          color=mix(vec3(.086,.063,.040),vec3(.30,.25,.168),bark*.65+light*.18);
          color*=.63+light*.46-groove*.15;
        }

        color=mix(color,color*vec3(1.18,1.075,.95),warmth*.65);
        vec3 nightColor=color*vec3(.36,.55,.78)+vec3(.018,.035,.068);
        if (material > 9.5 && material < 10.5) nightColor=mix(nightColor,color,.62);
        color=mix(color,nightColor,uEffects.w);
        color=mix(color,fog,min(haze,.983));
        color+=(random(vec3(gl_FragCoord.xy,6.0))-.5)*.010;
        gl_FragColor=vec4(color,1.0);
      }
    `);
  }

  window.shuRoadLook={sky,mesh};
})();
