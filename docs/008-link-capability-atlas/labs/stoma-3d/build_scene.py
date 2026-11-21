"""Build an illustrative Blender leaf epidermis with paired guard-cell shape keys."""

import math
from pathlib import Path
import random

import bpy


ROOT = Path(__file__).resolve().parent
ROWS = 48
SIDES = 24


def material(name, color, roughness):
    value = bpy.data.materials.new(name)
    value.use_nodes = True
    shader = value.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*color, 1)
    shader.inputs['Roughness'].default_value = roughness
    value.diffuse_color = (*color, 1)
    return value


def mesh(name, vertices, faces, materials):
    data = bpy.data.meshes.new(name)
    data.from_pydata(vertices, [], faces)
    data.update()
    node = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(node)
    for value in materials:
        node.data.materials.append(value)
    for face in data.polygons:
        face.use_smooth = len(face.vertices) <= 4
    return node


def clip_polygon(polygon, origin, neighbor):
    ax, ay = origin
    bx, by = neighbor
    mx, my = (ax + bx) / 2, (ay + by) / 2
    dx, dy = bx - ax, by - ay
    result = []
    for a, b in zip(polygon, polygon[1:] + polygon[:1]):
        va = (a[0] - mx) * dx + (a[1] - my) * dy
        vb = (b[0] - mx) * dx + (b[1] - my) * dy
        if va <= 0:
            result.append(a)
        if (va <= 0) != (vb <= 0):
            t = va / (va - vb)
            result.append((a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])))
    return result


def pavement(index, site, polygon, pigment):
    cx, cy = site
    for _ in range(2):
        polygon = [
            ((1 - t) * a[0] + t * b[0], (1 - t) * a[1] + t * b[1])
            for a, b in zip(polygon, polygon[1:] + polygon[:1]) for t in (.22, .78)
        ]
    rings = ((.24, .17), (.63, .158), (.91, .112), (.96, .045), (.94, -.08))
    vertices = [(cx + (x - cx) * size, cy + (y - cy) * size, z) for size, z in rings for x, y in polygon]
    count = len(polygon)
    faces = [tuple(range(count))]
    for i in range(len(rings) - 1):
        for j in range(count):
            k = (j + 1) % count
            faces.append((i*count+j, (i+1)*count+j, (i+1)*count+k, i*count+k))
    faces.append(tuple(reversed(range((len(rings) - 1) * count, len(rings) * count))))
    mesh(f'Epidermis_{index:02}', vertices, faces, [pigment])


def guard_vertices(side, expansion):
    result = []
    for row in range(ROWS + 1):
        t = 2 * row / ROWS - 1
        profile = max(0, math.cos(t * math.pi / 2))
        center = .135 + .152 * profile + expansion * profile**1.65
        horizontal = .014 + .262 * profile**.68
        vertical = .015 + .172 * profile**.63
        for index in range(SIDES):
            theta = 2 * math.pi * index / SIDES
            result.append((side * center + horizontal * math.cos(theta), 1.43 * t, .15 + .14 * profile + vertical * math.sin(theta)))
    return result


def guard_cell(name, side, colors):
    vertices = guard_vertices(side, 0)
    faces = [tuple(range(SIDES))]
    for row in range(ROWS):
        for index in range(SIDES):
            following = (index + 1) % SIDES
            faces.append((row*SIDES+index, (row+1)*SIDES+index, (row+1)*SIDES+following, row*SIDES+following))
    faces.append(tuple(reversed(range(ROWS * SIDES, (ROWS + 1) * SIDES))))
    node = mesh(name, vertices, faces, colors)
    for face in node.data.polygons[1:-1]:
        angle = (face.index - 1) % SIDES
        if (angle >= 11 and side > 0) or (angle <= 1 and side < 0):
            face.material_index = 1
    node.shape_key_add(name='Basis')
    target = node.shape_key_add(name='Aperture')
    for point, location in zip(target.data, guard_vertices(side, .32)):
        point.co = location
    node['side'] = side
    node['open_expansion'] = .32


def export_scene(path):
    bpy.ops.export_scene.gltf(filepath=str(path), export_format='GLB', export_animations=False, export_extras=True)


def build():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    rng = random.Random(539)
    pigments = [material(f'Leaf_{i}', color, .48) for i, color in enumerate((
        (.043, .165, .093), (.056, .199, .111), (.065, .225, .120), (.08, .245, .130), (.045, .176, .109),
    ))]
    base = material('Pore_shadow', (.009, .028, .022), .73)
    guard = material('Guard_chlorophyll', (.33, .56, .12), .36)
    rim = material('Guard_inner_wall', (.55, .71, .19), .40)
    mesh('Epidermis_substrate', [(-4.6, -3, -.086), (4.6, -3, -.086), (4.6, 3, -.086), (-4.6, 3, -.086)], [(0, 1, 2, 3)], [base])
    seeds = [(.0, -.85), (.0, .0), (.0, .85)]
    for iy in range(-3, 4):
        for ix in range(-4, 5):
            x = ix * 1.04 + (iy % 2 - .5) * .45 + rng.uniform(-.15, .15)
            y = iy * .82 + rng.uniform(-.13, .13)
            if abs(x) > 1.05 or abs(y) > 1.49:
                seeds.append((x, y))
    for index, site in enumerate(seeds[3:], 3):
        polygon = [(-4.6, -3), (4.6, -3), (4.6, 3), (-4.6, 3)]
        for neighbor in seeds:
            if neighbor != site and polygon:
                polygon = clip_polygon(polygon, site, neighbor)
        if len(polygon) > 2:
            pavement(index, site, polygon, rng.choice(pigments))
    guard_cell('GuardCell_L', -1, [guard, rim])
    guard_cell('GuardCell_R', 1, [guard, rim])
    for area in bpy.context.screen.areas:
        if area.type == 'VIEW_3D':
            area.spaces.active.region_3d.view_distance = 8
    bpy.context.scene['scope'] = 'Illustrative model; coordinates are not microscopy measurements.'
    path = ROOT / 'public' / 'assets'
    path.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(ROOT / 'stoma-source.blend'))
    export_scene(path / 'stoma-v1.glb')


if __name__ == '__main__':
    build()
