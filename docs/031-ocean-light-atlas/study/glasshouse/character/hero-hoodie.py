"""Static cotton hoodie built from continuous adult topology.

This module deliberately preserves the anatomical shoulder/axilla surface of
the posed adult mesh.  It creates an independent, relaxed clothing shell and
never modifies the body.  It is a static visual-study asset, not an animated
garment or a cloth-physics claim.
"""
import bpy, bmesh, math
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
import numpy as np

HERE=Path(__file__).resolve().parent

def _linear(rgb):
    return tuple(v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in rgb)

def _image(name,path,rgb,noncolor=False):
    h,w,_=rgb.shape
    im=bpy.data.images.new(name,width=w,height=h,alpha=True)
    if noncolor:im.colorspace_settings.name='Non-Color'
    rgba=np.ones((h,w,4),dtype=np.float32);rgba[:,:,:3]=rgb
    im.pixels.foreach_set(rgba.ravel());im.filepath_raw=str(path);im.file_format='PNG';im.save();im.pack()
    return im

def _cotton_material():
    """Portable image-based PBR, including a real tangent-space normal map."""
    n=1024;yy,xx=np.mgrid[:n,:n];u=xx/n;v=yy/n
    rng=np.random.default_rng(118)
    noise=rng.normal(0,1,(n,n))
    # Tiny knitted loops; the broad tonal changes remain under 2%.
    weave=(np.sin(2*np.pi*u*160)*np.sin(2*np.pi*v*160))
    height=.13*weave+.035*noise+.04*np.sin(2*np.pi*(u*51+v*17))
    dy,dx=np.gradient(height)
    normals=np.stack((-dx*.7,-dy*.7,np.ones_like(dx)),axis=-1)
    normals/=np.linalg.norm(normals,axis=-1,keepdims=True)
    normals=normals*.5+.5
    albedo=np.zeros((n,n,3));base=np.array((.105,.14,.23))
    variation=(noise*.009+weave*.012)[...,None]
    albedo[:]=np.clip(base*(1+variation),0,1)
    rough=np.clip(.82+noise*.018+weave*.018,.74,.91)
    images={
      'color':_image('Hero navy cotton albedo',HERE/'hero-cloth-albedo.png',albedo),
      'normal':_image('Hero cotton weave normal',HERE/'hero-cloth-normal.png',normals,True),
      'rough':_image('Hero cotton roughness',HERE/'hero-cloth-roughness.png',np.repeat(rough[:,:,None],3,axis=2),True),
    }
    m=bpy.data.materials.new('Hero | deep navy brushed cotton');m.use_nodes=True
    m.diffuse_color=(*_linear(base),1);nodes=m.node_tree.nodes;links=m.node_tree.links;s=nodes.get('Principled BSDF')
    s.inputs['Roughness'].default_value=.83;s.inputs['IOR'].default_value=1.46
    if 'Specular IOR Level' in s.inputs:s.inputs['Specular IOR Level'].default_value=.20
    if 'Sheen Weight' in s.inputs:s.inputs['Sheen Weight'].default_value=.05
    if 'Sheen Tint' in s.inputs:s.inputs['Sheen Tint'].default_value=(.035,.055,.095,1)
    if 'Sheen Roughness' in s.inputs:s.inputs['Sheen Roughness'].default_value=.7
    for kind,image in images.items():
        t=nodes.new('ShaderNodeTexImage');t.image=image
        if kind=='color':links.new(t.outputs['Color'],s.inputs['Base Color'])
        elif kind=='rough':links.new(t.outputs['Color'],s.inputs['Roughness'])
        else:
            normal=nodes.new('ShaderNodeNormalMap');normal.inputs['Strength'].default_value=.18
            links.new(t.outputs['Color'],normal.inputs['Color']);links.new(normal.outputs['Normal'],s.inputs['Normal'])
    return m

def _plain(name,color,rough=.7,metal=0):
    m=bpy.data.materials.new(name);m.use_nodes=True;s=m.node_tree.nodes['Principled BSDF']
    m.diffuse_color=(*_linear(color),1);s.inputs['Base Color'].default_value=m.diffuse_color;s.inputs['Roughness'].default_value=rough;s.inputs['Metallic'].default_value=metal
    return m

def _mesh(name,vertices,faces,material,subdiv=0,solid=0):
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(vertices,[],faces);mesh.update()
    ob=bpy.data.objects.new(name,mesh);bpy.context.scene.collection.objects.link(ob);ob.data.materials.append(material)
    for p in mesh.polygons:p.use_smooth=True
    if subdiv:
        mod=ob.modifiers.new('Tailored surface smoothing','SUBSURF');mod.levels=subdiv;mod.render_levels=subdiv
    if solid:
        mod=ob.modifiers.new('Cotton fabric thickness','SOLIDIFY');mod.thickness=solid;mod.offset=0
    return ob

def _curve(name,points,radius,material,closed=False):
    data=bpy.data.curves.new(name,'CURVE');data.dimensions='3D';data.resolution_u=5;data.bevel_depth=radius;data.bevel_resolution=1
    spl=data.splines.new('BEZIER');spl.bezier_points.add(len(points)-1)
    for bp,p in zip(spl.bezier_points,points):bp.co=p;bp.handle_left_type='AUTO';bp.handle_right_type='AUTO'
    spl.use_cyclic_u=closed
    ob=bpy.data.objects.new(name,data);bpy.context.scene.collection.objects.link(ob);ob.data.materials.append(material)
    bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob;bpy.ops.object.convert(target='MESH')
    return bpy.context.object

def _apply(ob):
    bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob
    for mod in list(ob.modifiers):bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if not ob.data.uv_layers:
        bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(angle_limit=1.15,island_margin=.015);bpy.ops.object.mode_set(mode='OBJECT')

def build_hoodie(body,shoulder_z=1.47,waist_z=1.02,shoulder_half=.215,wrist_x=.2748,wrist_z=.8975,center_y=.015,wrist_y=-.04425):
    """Return independent static hoodie objects around a Z-up, front -Y body.

    ``body`` must be the posed, evaluated adult skin mesh with helpers removed.
    The body's original continuous quad topology supplies shoulder and axilla
    connectivity; no separate sleeve primitives are introduced.
    """
    cloth=_cotton_material();rib=cloth.copy();rib.name='Hero | rib-knit cuffs and hem'
    thread=_plain('Hero | navy seam thread',(.105,.145,.225),.9)
    code=_plain('Hero | cyan stitched code',(.22,.70,.78),.82)
    tip=_plain('Hero | aged drawstring metal',(.40,.36,.28),.44,.6)
    objects=[];neck_z=shoulder_z+.025;cuff_z=wrist_z+.038
    deps=bpy.context.evaluated_depsgraph_get();evaluated=body.evaluated_get(deps)
    shell=bpy.data.objects.new('Hero hoodie | continuous shoulder and sleeves',bpy.data.meshes.new_from_object(evaluated));bpy.context.scene.collection.objects.link(shell)
    shell.matrix_world=body.matrix_world.copy()
    bpy.ops.object.select_all(action='DESELECT');shell.select_set(True);bpy.context.view_layer.objects.active=shell;bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
    bm=bmesh.new();bm.from_mesh(shell.data)
    def keep(p):
        x,y,z=p;ax=abs(x)
        if z>shoulder_z+.065 or ax>.38:return False
        if z>neck_z and ax<.087:return False
        if ax<shoulder_half*.91:return waist_z<z<shoulder_z+.065
        return cuff_z<z<shoulder_z+.065
    remove=[face for face in bm.faces if not keep(face.calc_center_median())]
    bmesh.ops.delete(bm,geom=remove,context='FACES');bmesh.ops.delete(bm,geom=[v for v in bm.verts if not v.link_faces],context='VERTS')
    # Planarise actual cloth openings before subdivision; the cut shoulder/neck
    # surface stays connected, while cuffs/hem don't inherit jagged skin rows.
    boundary=set(v for edge in bm.edges if edge.is_boundary for v in edge.verts)
    components=[]
    while boundary:
        seed=boundary.pop();component={seed};stack=[seed]
        while stack:
            for edge in stack.pop().link_edges:
                if not edge.is_boundary:continue
                for other in edge.verts:
                    if other in boundary:boundary.remove(other);component.add(other);stack.append(other)
        components.append(component)
    for component in components:
        center=sum((v.co for v in component),Vector())/len(component)
        if center.z>shoulder_z-.065 and abs(center.x)<.10:
            for v in component:
                a=math.atan2(v.co.y-center_y,v.co.x)
                v.co.x=.076*math.cos(a);v.co.y=center_y+.068*math.sin(a)
                v.co.z=neck_z-.008-.012*max(0,-math.sin(a))
        elif abs(center.x)<.12 and center.z<waist_z+.10:
            for v in component:v.co.z=waist_z+.015
    for _ in range(4):bmesh.ops.smooth_vert(bm,verts=list(bm.verts),factor=.45,use_axis_x=True,use_axis_y=True,use_axis_z=True)
    bm.normal_update();bm.to_mesh(shell.data);bm.free();shell.data.update()
    # Cotton hangs from the shoulders, then softens the anatomical torso.
    for vertex in shell.data.vertices:
        p=vertex.co;n=vertex.normal.copy();ax=abs(p.x);z=p.z
        p+=n*(.016 if ax<shoulder_half*.95 else .020)
        if ax<shoulder_half*.94 and z<shoulder_z-.06:
            q=max(0,min(1,(z-waist_z)/(shoulder_z-waist_z)))
            rx=.174+.033*math.sin(q*math.pi*.68);ry=.133+.011*math.sin(q*math.pi)
            a=math.atan2(p.y-center_y,p.x);target=Vector((rx*math.cos(a),center_y+ry*math.sin(a),p.z))
            p.x=p.x*.25+target.x*.75;p.y=target.y
            # Few broad stress folds; no repeated corrugated-wave silhouette.
            front=max(0,min(1,-(p.y-center_y)/.11));back=max(0,min(1,(p.y-center_y)/.11))
            side=max(0,min(1,(abs(p.x)-.08)/.12))
            fold=.008*math.sin((z-waist_z)*39+ax*20)*math.exp(-((z-(waist_z+.065))/.062)**2)
            fold+=.0045*math.sin((z-waist_z)*21+ax*29)*side*math.exp(-((z-(waist_z+.22))/.16)**2)
            fold+=.003*math.sin(z*23+ax*18)*back*math.exp(-((z-(waist_z+.12))/.13)**2)
            p.y+=(-front+back)*fold
        elif ax>shoulder_half*.91:
            cuff_fold=.0045*math.sin((z-cuff_z)*43+ax*21)*math.exp(-((z-cuff_z-.055)/.075)**2)
            elbow_fold=.004*math.sin(z*31+ax*14)*math.exp(-((z-1.11)/.075)**2)
            p+=n*(cuff_fold+elbow_fold)
        vertex.co=p
    shell.data.update()
    # The anatomical nipple rings have no role in cotton topology.  Their
    # projected vertices become coincident and are merged before subdivision.
    clean=bmesh.new();clean.from_mesh(shell.data)
    # A cotton front panel has no concentric nipple topology. Replace those
    # small anatomical patches instead of preserving compressed skin loops.
    # Anatomical repair follows chest/shoulder height, never the hem length.
    # A longer hoodie must not move this patch down onto the abdomen.
    obsolete=[f for f in clean.faces if f.calc_center_median().y<center_y-.04 and .045<abs(f.calc_center_median().x)<.150 and shoulder_z-.245<f.calc_center_median().z<shoulder_z-.115]
    bmesh.ops.delete(clean,geom=obsolete,context='FACES')
    openings=[e for e in clean.edges if e.is_boundary and all(v.co.y<center_y-.025 and abs(v.co.x)<.22 and shoulder_z-.30<v.co.z<shoulder_z-.05 for v in e.verts)]
    if openings:
        fills=bmesh.ops.holes_fill(clean,edges=openings,sides=0)['faces']
        if fills:bmesh.ops.triangulate(clean,faces=fills)
    bmesh.ops.remove_doubles(clean,verts=list(clean.verts),dist=.0015)
    bmesh.ops.recalc_face_normals(clean,faces=list(clean.faces));clean.to_mesh(shell.data);clean.free()
    shell.data.materials.clear();shell.data.materials.append(cloth)
    for p in shell.data.polygons:p.material_index=0
    for p in shell.data.polygons:p.use_smooth=True
    sub=shell.modifiers.new('Smooth continuous garment topology','SUBSURF');sub.levels=2;sub.render_levels=2
    _apply(shell)
    # Reproject the dense chest after subdivision as well.  This removes the
    # shading imprint of concentric anatomical nipple loops from the base mesh.
    def smooth(a,b,value):
        t=max(0,min(1,(value-a)/(b-a)));return t*t*(3-2*t)
    for vertex in shell.data.vertices:
        p=vertex.co
        if p.y<center_y-.04 and abs(p.x)<.18 and shoulder_z-.32<p.z<shoulder_z-.025:
            q=max(0,min(1,(p.z-waist_z)/(shoulder_z-waist_z)))
            rx=.174+.033*math.sin(q*math.pi*.68);ry=.133+.011*math.sin(q*math.pi)
            target_y=center_y-ry*math.sqrt(max(0,1-(p.x/rx)**2))
            blend=smooth(shoulder_z-.32,shoulder_z-.28,p.z)*(1-smooth(shoulder_z-.065,shoulder_z-.025,p.z))*(1-smooth(.15,.18,abs(p.x)))
            p.y=p.y*(1-blend)+target_y*blend
    shell.data.update()
    solid=shell.modifiers.new('Cotton fabric thickness','SOLIDIFY');solid.thickness=.0025;solid.offset=-.2
    _apply(shell);objects.append(shell)
    # Use the resulting surface to place sewn-on details without floating parts.
    bvh=BVHTree.FromObject(shell,bpy.context.evaluated_depsgraph_get())
    def front(x,z,extra=.0025):
        origin=Vector((x,-.5,z));hit,normal,_,_=bvh.ray_cast(origin,Vector((0,1,0)),1)
        return Vector((x,hit.y-extra,z)) if hit else Vector((x,center_y-.14-extra,z))
    # Rib-knit bands bridge the cut surfaces, deliberately narrow and soft.
    def band(name,cx,cy,z,rx,ry,height):
        vv=[];ff=[];segments=96
        for j in range(5):
            f=j/4;scale=1+.015*math.sin(f*math.pi)
            for i in range(segments):
                a=i/segments*math.tau;r=1+.006*math.cos(a*48)
                vv.append((cx+rx*math.cos(a)*scale*r,cy+ry*math.sin(a)*scale*r,z-height*f))
                if j<4:ff.append((j*segments+i,j*segments+(i+1)%segments,(j+1)*segments+(i+1)%segments,(j+1)*segments+i))
        ob=_mesh(name,vv,ff,rib,1,.003);_apply(ob);objects.append(ob)
    band('Hero hoodie | fitted rib hem',0,center_y,waist_z+.050,.176,.139,.077)
    for side in [-1,1]:
        band('Hero hoodie | rib cuff '+str(side),side*wrist_x,wrist_y,cuff_z+.020,.042,.045,.045)
    # A fabric hood with a real opening and a doubled rim, resting on the back.
    vv=[];ff=[];segments=64;rows=18
    for j in range(rows+1):
        t=j/rows;radius=(1-t)**.62
        for i in range(segments):
            a=i/segments*math.tau;front_weight=max(0,-math.sin(a))
            x=.112*radius*math.cos(a)
            y=center_y+.035+.118*t+.083*radius*math.sin(a)
            z=neck_z+.010-.176*t+.018*radius*front_weight+.004*math.sin(a*3)*math.sin(t*math.pi)
            vv.append((x,y,z))
            if j<rows:ff.append((j*segments+i,j*segments+(i+1)%segments,(j+1)*segments+(i+1)%segments,(j+1)*segments+i))
    hood=_mesh('Hero hoodie | draped double-wall hood',vv,ff,cloth,1,.0035);_apply(hood);objects.append(hood)
    rim=[(vv[i][0],vv[i][1]-.001,vv[i][2]+.001) for i in range(segments)]
    objects.append(_curve('Hero hoodie | hood opening seam',rim,.0018,thread,True))
    objects.append(_curve('Hero hoodie | soft front neck fold',[
        (-.077,center_y-.040,neck_z),(-.054,center_y-.082,neck_z-.012),
        (0,center_y-.095,neck_z-.020),(.054,center_y-.082,neck_z-.012),(.077,center_y-.040,neck_z)],.009,cloth))
    # Kangaroo pouch is a thin tailored panel, shaped to the actual chest.
    vv=[];ff=[];nx=20;nz=14
    for j in range(nz+1):
        t=j/nz;z=waist_z+.058+t*.154
        width=.126-.018*math.sin(t*math.pi/2)**4
        for i in range(nx+1):
            s=i/nx*2-1;x=s*width
            p=front(x,z,.0035+.004*(1-s*s)*math.sin(t*math.pi));vv.append(tuple(p))
            if j<nz and i<nx:ff.append((j*(nx+1)+i,j*(nx+1)+i+1,(j+1)*(nx+1)+i+1,(j+1)*(nx+1)+i))
    pocket=_mesh('Hero hoodie | sewn kangaroo pouch',vv,ff,cloth,1,.0015);_apply(pocket);objects.append(pocket)
    for side in [-1,1]:
        points=[front(side*x,waist_z+z,.006) for x,z in [(.126,.069),(.127,.120),(.118,.164),(.107,.207)]]
        objects.append(_curve('Hero hoodie | pouch opening stitch',points,.00065,thread))
    for side in [-1,1]:
        start=Vector((side*.036,center_y-.120,neck_z-.025));middle=front(side*.041,neck_z-.13,.007);end=front(side*.038,neck_z-.238,.008)
        objects.append(_curve('Hero hoodie | woven drawcord',[start,middle,end],.0018,thread))
        objects.append(_curve('Hero hoodie | cord metal tip',[end,end+Vector((0,0,-.014))],.0021,tip))
    # Small code embroidery is modelled as thread resting on the fabric.
    for line in [[(.088,1.369),(.076,1.359),(.088,1.349)],[(.103,1.372),(.096,1.346)],[(.112,1.369),(.124,1.359),(.112,1.349)]]:
        points=[front(x,z+(shoulder_z-1.47),.006) for x,z in line]
        objects.append(_curve('Hero hoodie | cyan code embroidery',points,.0011,code))
    for ob in objects:
        ob['role']='character';ob['part']='hoodie';ob['construction']='continuous adult topology, relaxed clothing shell'
    return {'objects':objects,'material':cloth,'ribMaterial':rib,'bodyShell':shell,'source':'Original garment on posed adult topology; independent static shell'}

def _preview(body):
    built=build_hoodie(body)
    body.hide_render=True
    scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.use_denoising=True
    scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.75,.80,.86,1);scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.55
    def light(pos,power,size):
        data=bpy.data.lights.new('Cloth preview softbox','AREA');data.energy=power;data.size=size
        ob=bpy.data.objects.new(data.name,data);scene.collection.objects.link(ob);ob.location=pos;ob.rotation_euler=(Vector((0,0,1.3))-ob.location).to_track_quat('-Z','Y').to_euler()
    light((2,-3,3),260,3);light((-2,-1,2),120,2);light((1,2,3),300,2)
    data=bpy.data.cameras.new('Cloth preview');cam=bpy.data.objects.new('Cloth preview',data);scene.collection.objects.link(cam);scene.camera=cam
    cam.location=(1.3,-2.7,1.7);cam.rotation_euler=(Vector((0,0,1.22))-cam.location).to_track_quat('-Z','Y').to_euler();data.lens=72
    scene.render.resolution_x=900;scene.render.resolution_y=900;scene.render.resolution_percentage=100
    scene.view_settings.view_transform='AgX';scene.render.image_settings.file_format='PNG';scene.render.filepath=str(HERE/'hero-cloth-preview.png');bpy.ops.render.render(write_still=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'hero-cloth-preview.blend'),compress=True)
    return built

if __name__=='__main__':
    # Optional test: run against a passed-in posed body .blend supplied by root.
    import sys
    if '--' in sys.argv:
        path=Path(sys.argv[sys.argv.index('--')+1]);bpy.ops.wm.open_mainfile(filepath=str(path))
        candidates=[o for o in bpy.context.scene.objects if o.type=='MESH' and (o.get('part')=='body' or 'body' in o.name.lower())]
        body=max(candidates,key=lambda o:len(o.data.vertices));_preview(body)
