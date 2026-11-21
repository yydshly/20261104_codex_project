"""Render the case 04 greenhouse. Run with Blender, not system Python."""
import argparse
import math
from pathlib import Path
import random
import sys

import bpy
from mathutils import Vector


SHOTS = ('fly', 'track', 'zoom', 'bullet', 'time')
FPS = 24


def color(hex_color):
    rgb = [int(hex_color[index:index + 2], 16) / 255 for index in (0, 2, 4)]
    return (*[v / 12.92 if v < .04045 else ((v + .055) / 1.055) ** 2.4 for v in rgb], 1)


def material(name, base, rough=.44, metal=0, noise=None, glow=0):
    value = bpy.data.materials.new(name)
    value.diffuse_color = color(base)
    value.use_nodes = True
    tree = value.node_tree
    shader = tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = color(base)
    shader.inputs['Roughness'].default_value = rough
    shader.inputs['Metallic'].default_value = metal
    if glow:
        shader.inputs['Emission Color'].default_value = color(base)
        shader.inputs['Emission Strength'].default_value = glow
    if noise:
        tone, scale, strength = noise
        texture = tree.nodes.new('ShaderNodeTexNoise')
        texture.inputs['Scale'].default_value = scale
        texture.inputs['Detail'].default_value = 3
        coord = tree.nodes.new('ShaderNodeTexCoord')
        tree.links.new(coord.outputs['Object'], texture.inputs['Vector'])
        ramp = tree.nodes.new('ShaderNodeValToRGB')
        ramp.color_ramp.elements[0].position = .21
        ramp.color_ramp.elements[0].color = color(tone)
        ramp.color_ramp.elements[1].position = .79
        ramp.color_ramp.elements[1].color = color(base)
        tree.links.new(texture.outputs['Fac'], ramp.inputs['Fac'])
        tree.links.new(ramp.outputs['Color'], shader.inputs['Base Color'])
        bump = tree.nodes.new('ShaderNodeBump')
        bump.inputs['Strength'].default_value = strength
        bump.inputs['Distance'].default_value = .04
        tree.links.new(texture.outputs['Fac'], bump.inputs['Height'])
        tree.links.new(bump.outputs['Normal'], shader.inputs['Normal'])
    return value


def finish(obj, name, mat, bevel=0, parent=None):
    obj.name = name
    obj.data.materials.append(mat)
    if bevel:
        edge = obj.modifiers.new('Rounded edges', 'BEVEL')
        edge.width = bevel
        edge.segments = 3
        obj.modifiers.new('Weighted surface normals', 'WEIGHTED_NORMAL')
    if parent:
        obj.parent = parent
    return obj


def cube(name, pos, size, mat, bevel=0, parent=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos)
    obj = bpy.context.object
    obj.dimensions = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return finish(obj, name, mat, bevel, parent)


def pipe(name, start, end, radius, mat, vertices=12, parent=None):
    a, b = Vector(start), Vector(end)
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=(b - a).length, location=(a + b) / 2)
    obj = bpy.context.object
    obj.rotation_euler = (b - a).to_track_quat('Z', 'Y').to_euler()
    for polygon in obj.data.polygons:
        polygon.use_smooth = len(polygon.vertices) == 4
    return finish(obj, name, mat, parent=parent)


def beam(name, start, end, width, mat):
    a, b = Vector(start), Vector(end)
    obj = cube(name, (a + b) / 2, (width, width, (b - a).length), mat)
    obj.rotation_euler = (b - a).to_track_quat('Z', 'Y').to_euler()
    return obj


def mesh_object(name, vertices, faces, materials, indices=None):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    for mat in materials:
        mesh.materials.append(mat)
    for polygon in mesh.polygons:
        polygon.use_smooth = True
        if indices:
            polygon.material_index = indices[polygon.index]
    return obj


def placard(name, content, pos, scale, mat, rotation=(0, 0, 0), parent=None):
    text = bpy.data.curves.new(name, 'FONT')
    text.body = content
    text.size = scale
    text.space_character = 1.17
    text.materials.append(mat)
    obj = bpy.data.objects.new(name, text)
    bpy.context.collection.objects.link(obj)
    obj.parent = parent
    obj.location = pos
    obj.rotation_euler = rotation


def vegetation(rows, greens):
    rng = random.Random(44)
    points, faces, tones = [], [], []
    for x in rows:
        for number in range(57):
            y = -10 + number * .46
            for side in [-.21, .21]:
                origin = Vector((x + side + rng.uniform(-.08, .08), y + rng.uniform(-.18, .18), .63))
                for blade in range(6):
                    angle = blade * 2.40 + rng.random() * .70
                    axis = Vector((math.cos(angle), math.sin(angle), 0))
                    across = Vector((-axis.y, axis.x, 0))
                    reach = rng.uniform(.22, .49)
                    height = rng.uniform(.20, .63)
                    span = rng.uniform(.09, .175)
                    leaf = len(points)
                    for step in range(7):
                        t = step / 6
                        width = max(.002, span * math.sin(math.pi * t) ** .74)
                        z = height * math.sin(t * 2.17) + .03 * t
                        middle = origin + axis * (reach * t ** 1.25) + Vector((0, 0, z))
                        for lateral in [-1, 0, 1]:
                            edge = middle + across * (lateral * width)
                            edge.z -= abs(lateral) * width * (.31 + rng.random() * .17)
                            points.append(edge)
                        if step:
                            p = leaf + step * 3
                            faces.extend([(p - 3, p, p + 1, p - 2), (p - 2, p + 1, p + 2, p - 1)])
                            index = rng.randrange(len(greens)) if step == 1 else tones[-1]
                            tones.extend([index, index])
    mesh_object('Leaf canopies', points, faces, greens, tones)


def build_set():
    floor = material('Damp concrete', '606960', .53, noise=('424b46', 9, .21))
    frame = material('Galvanized roof structure', '7f9390', .32, .60, ('506861', 25, .10))
    rail = material('Deep green galvanized bed', '3b4e42', .37, .38, ('26332e', 9, .13))
    soil = material('Moist planting substrate', '5b5142', .82, noise=('1d241e', 11, .48))
    ink = material('Aisle paint', 'c4b67f', .68, noise=('93855f', 15, .13))
    white = material('Identification paint', 'dbe0bf', .47)
    black = material('Irrigation polymer', '27372f', .40)
    pane = material('Diffuse end wall', 'a2bdad', .25, .20)
    foliage = [material('Leaf %s' % shade, shade, .36, noise=(dark, 9, .15)) for shade, dark in
               [('658944', '2b4e28'), ('708d43', '34532b'), ('849a4e', '476a31'), ('4c783c', '20462e'), ('5a8149', '32542d')]]
    for mat in foliage:
        mat.node_tree.nodes.get('Principled BSDF').inputs['Subsurface Weight'].default_value = .07
    cube('Concrete deck', (0, 2, -.13), (38, 56, .25), floor)
    for x in [-1.45, 1.45]:
        cube('Painted lane edge', (x, 1, .006), (.028, 27, .012), ink)
        cube('Dark expansion seam', (x * 1.23, 2, .003), (.016, 36, .009), black)
    for y in range(-11, 16, 2):
        cube('Lane dash', (0, y, .007), (.044, .36, .01), ink)
    for x in [-1.25, 1.25]:
        cube('Dock marker', (x, -1.3, .01), (.11, .60, .016), ink)
    rows = [-6.4, -4.5, -2.55, 2.55, 4.5, 6.4]
    for x in rows:
        for y in [-8, -3, 2, 7, 12]:
            cube('Raised planting trough', (x, y, .37), (1.28, 4.82, .50), rail, .035)
            cube('Soil', (x, y, .625), (1.19, 4.72, .045), soil, .025)
            for side in [-.63, .63]:
                cube('Raised bed rim', (x + side, y, .63), (.052, 4.85, .076), frame, .018)
            for end in [-1.9, 1.9]:
                for side in [-.46, .46]:
                    cube('Bed foot', (x + side, y + end, .092), (.10, .10, .18), rail)
        for side in [-.36, .36]:
            pipe('Drip line', (x + side, -10.35, .67), (x + side, 14.37, .67), .019, black)
    vegetation(rows, foliage)
    profile = [(-8.3, 0), (-8.3, 3.4), (-7.6, 4.7), (-5.6, 5.95), (-2.9, 6.8), (0, 7.2),
               (2.9, 6.8), (5.6, 5.95), (7.6, 4.7), (8.3, 3.4), (8.3, 0)]
    bays = [-12, -8, -4, 0, 4, 8, 12, 16]
    for y in bays:
        for index, ((x, z), (nx, nz)) in enumerate(zip(profile, profile[1:])):
            beam('Portal frame', (x, y, z), (nx, y, nz), .108 if index in (0, 9) else .076, frame)
        for x in [-8.3, 8.3]:
            cube('Concrete frame footing', (x, y, .13), (.39, .35, .26), floor, .024)
    for x, z in profile[1:-1]:
        beam('Longitudinal purlin', (x, bays[0], z), (x, bays[-1], z), .05, frame)
    for x in [-8.29, 8.29]:
        for z in [1.12, 2.28]:
            beam('Side mullion', (x, -12, z), (x, 16, z), .06, frame)
        cube('Diffuse side wall', (x * 1.005, 2, 1.70), (.025, 28, 3.4), pane)
    for x in range(-8, 9):
        beam('Distant glazing mullion', (x, 15.95, 0), (x, 15.95, 5.2 - abs(x) * .19), .045, frame)
    cube('Distant greenhouse end wall', (0, 16.05, 2.45), (16.5, .03, 4.9), pane)
    for x in [-1.62, 1.62]:
        cube('Lane marker post', (x, -1.3, .46), (.09, .09, .92), frame, .012)
        cube('Lane marker reflector', (x, -1.35, .84), (.16, .045, .21), ink, .022)
    placard('Aisle designation', '04', (1.02, -1.20, .019), .33, white, (0, 0, math.pi / 2))


def build_rover():
    paint = material('Satin amber enamel', 'e48c35', .27, .37)
    accent = material('Deep amber accent', 'c17b34', .30, .28)
    dark = material('Anodized enclosure', '233331', .31, .55)
    rubber = material('Molded tire rubber', '242b29', .57, noise=('131917', 24, .24))
    steel = material('Machined metal', '899d94', .29, .80)
    glass = material('AR-coated sensor glass', '335b61', .12, .68)
    ceramic = material('Ceramic markings', 'f5ecd5', .31)
    lamp = material('Warm running light', 'fff0c5', .30, glow=4.5)
    green = material('Scanner status', '7bdfb1', .22, glow=2.3)
    body = bpy.data.objects.new('VERDANT R04 • rover', None)
    bpy.context.collection.objects.link(body)
    cube('Armored lower skid', (0, 0, .285), (1.05, 1.57, .24), dark, .085, body)
    cube('Machined chassis rail', (0, 0, .426), (1.08, 1.57, .12), steel, .047, body)
    cube('Amber outer shell', (0, -.04, .574), (1.03, 1.49, .23), paint, .077, body)
    cube('Front sensor recess', (0, .738, .50), (.63, .060, .114), dark, .033, body)
    cube('Front glass slit', (0, .77, .51), (.26, .014, .043), glass, .018, body)
    cube('Bumper', (0, .785, .30), (1.08, .12, .14), dark, .035, body)
    cube('Rear housing', (0, -.79, .47), (.77, .07, .15), accent, .027, body)
    cube('Top service panel', (0, -.21, .702), (.65, .64, .045), dark, .024, body)
    for side in [-1, 1]:
        cube('Fender', (side * .525, .01, .541), (.15, 1.44, .16), paint, .052, body)
        cube('Daytime headlight', (side * .41, .717, .552), (.125, .09, .068), lamp, .028, body)
        for y in [-.45, -.30, -.15, .0]:
            cube('Vent slot', (side * .513, y, .629), (.035, .081, .022), dark, .006, body)
    for x in [-.27, .27]:
        for y in [-.48, .045]:
            pipe('Deck fastener', (x, y, .726), (x, y, .736), .021, steel, parent=body)
    pipe('Scanner mast', (0, .24, .665), (0, .24, 1.07), .063, dark, parent=body)
    pipe('Scanner collar', (0, .24, .712), (0, .24, .79), .117, steel, parent=body)
    cube('Scanner housing', (0, .247, 1.085), (.47, .31, .204), dark, .063, body)
    cube('Scanner front plate', (0, .405, 1.084), (.35, .034, .127), steel, .023, body)
    for x in [-.082, .082]:
        pipe('Optical barrel', (x, .419, 1.083), (x, .458, 1.083), .053, dark, 32, body)
        pipe('Coated optic', (x, .455, 1.083), (x, .469, 1.083), .037, glass, 32, body)
    cube('Scanner status line', (0, .415, 1.166), (.185, .020, .018), green, .006, body)
    placard('Roof lettering', 'VERDANT', (-.24, -.33, .727), .105, ceramic, parent=body)
    placard('Roof serial', 'R / 04', (-.23, -.43, .727), .063, green, parent=body)
    placard('Left number', '04', (-.602, -.16, .514), .106, ceramic, (math.pi / 2, 0, -math.pi / 2), body)
    placard('Right number', '04', (.602, .12, .514), .106, ceramic, (math.pi / 2, 0, math.pi / 2), body)
    wheels = []
    for side in [-1, 1]:
        for y in [-.51, .53]:
            joint = bpy.data.objects.new('Wheel pivot', None)
            bpy.context.collection.objects.link(joint)
            joint.parent = body
            joint.location = (side * .559, y, .246)
            wheels.append(joint)
            pipe('Tire', (-.099, 0, 0), (.099, 0, 0), .232, rubber, 32, joint)
            pipe('Wheel rim', (side * .099, 0, 0), (side * .117, 0, 0), .127, steel, 32, joint)
            pipe('Recessed wheel hub', (side * .116, 0, 0), (side * .122, 0, 0), .074, dark, 20, joint)
            pipe('Wheel cap', (side * .122, 0, 0), (side * .134, 0, 0), .047, steel, 16, joint)
            for i in range(16):
                angle = i * math.tau / 16
                tread = cube('Tire tread', (0, math.sin(angle) * .227, math.cos(angle) * .227), (.202, .047, .032), rubber, parent=joint)
                tread.rotation_euler.x = -angle
    return body, wheels


def light(name, kind, energy, shade, pos, aim, size=0):
    data = bpy.data.lights.new(name, kind)
    data.energy = energy
    data.color = color(shade)[:3]
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    obj.location = pos
    obj.rotation_euler = (Vector(aim) - obj.location).to_track_quat('-Z', 'Y').to_euler()
    if kind == 'AREA':
        data.shape = 'DISK'
        data.size = size
    elif kind == 'SUN':
        data.angle = size
    return obj


def make_camera():
    data = bpy.data.cameras.new('Production camera')
    obj = bpy.data.objects.new('Production camera', data)
    bpy.context.collection.objects.link(obj)
    data.sensor_width = 36
    data.sensor_fit = 'HORIZONTAL'
    data.clip_end = 130
    data.dof.use_dof = True
    return obj


def smooth(t):
    t = min(max(t, 0), 1)
    return t * t * (3 - 2 * t)


def configure_shot(shot, fraction, body, wheels, camera, portrait=False):
    t = fraction
    y = -5.35 + 7.15 * t
    lens, aperture = 41, 5.6
    if shot == 'fly':
        eye = (-6.25 + 10.1 * t, y + 5.6 - 1.3 * t, 6.35 - 1.65 * t)
        target = (.12, y + .56, .35)
        lens, aperture = 29, 8
    elif shot == 'track':
        eye = (1.68 - .16 * t, y + 3.42 + .48 * t, 1.48 - .38 * t)
        target = (-.18 + .29 * t, y + .22, .59)
        lens, aperture = 45, 4.2
    elif shot == 'zoom':
        y = -3.22 + 1.03 * t
        progress = smooth((t - .18) / .33)
        eye = (2.64 - .49 * progress, .17 + .07 * t, 1.54 - .30 * progress)
        target = (0, y + .29 * progress, .52 + .53 * progress)
        lens, aperture = 34 + 67 * progress, 4.2
    elif shot == 'bullet':
        y = -1.4
        angle = -.91 + 1.90 * (.23 * t + .77 * smooth(t))
        eye = (math.sin(angle) * 3.43, y + math.cos(angle) * 3.43, 1.56 + .23 * t)
        target = (.04, y + .10, .61)
        lens, aperture = 46, 4.8
    else:
        y = -7.6 + 17.2 * (t ** .93)
        eye = (2.18 - 1.7 * t, -10.85 + 11.6 * t, 1.6 + 1.42 * t)
        target = (-.12, y + .66, .61)
        lens, aperture = 34, 7.1
    body.location = (0, y, 0)
    for wheel in wheels:
        wheel.rotation_euler.x = -(y + 5.35) / .246
    camera.location = eye
    camera.rotation_euler = (Vector(target) - camera.location).to_track_quat('-Z', 'Y').to_euler()
    portrait_scale = {'fly': 1.26, 'track': 1.24, 'zoom': 1.08, 'bullet': 1.24, 'time': 1.20}
    camera.data.lens = lens * (portrait_scale[shot] if portrait else 1)
    camera.data.dof.focus_distance = (Vector((0, y + .12, .72)) - camera.location).length
    camera.data.dof.aperture_fstop = aperture


def setup(args):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
    scene.render.resolution_x = args.width
    scene.render.resolution_y = args.height
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGB'
    scene.render.image_settings.compression = 8
    scene.render.fps = FPS
    scene.render.use_motion_blur = False
    scene.eevee.taa_render_samples = args.samples
    scene.view_settings.view_transform = 'AgX'
    scene.view_settings.look = 'AgX - Medium High Contrast'
    scene.view_settings.exposure = .23
    world = bpy.data.worlds.new('Cool ambient skylight')
    world.use_nodes = True
    world.node_tree.nodes.get('Background').inputs[0].default_value = (.25, .34, .42, 1)
    world.node_tree.nodes.get('Background').inputs[1].default_value = .40
    scene.world = world
    build_set()
    body, wheels = build_rover()
    light('Late afternoon sun', 'SUN', 3.0, 'ffd39f', (-6, -3, 8), (2, 4, 0), .082)
    light('Cool roof bounce', 'AREA', 2300, 'd3e7ff', (2.7, -2, 7.2), (0, 0, 0), 11)
    light('Soft aisle key', 'AREA', 970, 'ffe1b8', (-2.7, 2, 3.65), (0, -2, .55), 5.5)
    light('Longitudinal rim', 'AREA', 1800, 'd4f3e6', (2.3, 10, 4.8), (0, 0, .25), 7.5)
    camera = make_camera()
    scene.camera = camera
    return scene, body, wheels, camera


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--shots', nargs='+', choices=SHOTS, default=SHOTS)
    parser.add_argument('--width', type=int, default=1440)
    parser.add_argument('--height', type=int, default=810)
    parser.add_argument('--samples', type=int, default=16)
    parser.add_argument('--frames', type=int, default=96)
    parser.add_argument('--test', action='store_true')
    args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:])
    scene, body, wheels, camera = setup(args)
    for shot in args.shots:
        folder = args.output / shot
        folder.mkdir(parents=True, exist_ok=True)
        indices = (0, args.frames // 2, args.frames - 1) if args.test else range(args.frames)
        for index in indices:
            configure_shot(shot, index / max(args.frames - 1, 1), body, wheels, camera, args.width < args.height)
            path = folder / f'{index:04d}.png'
            scene.render.filepath = str(path)
            bpy.ops.render.render(write_still=True)


if __name__ == '__main__':
    main()
