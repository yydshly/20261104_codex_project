"""Build and export Magnet's orbital suit using Blender.

Run with Blender: blender --background --python tools/build-magnet-blender.py
The same script can run under a Python interpreter with the Blender bpy wheel.
Use -- --output path.glb with Blender, or --output path.glb with Python.
"""

import argparse
import math
from pathlib import Path
import sys

import bpy


TAU = 2 * math.pi
RAIL_RADIUS = 0.505


def to_blender(point):
    """Author in the animation rig's Y-up, positive-Z-forward coordinates."""
    x, y, z = point
    return x, -z, y


def linear(channel):
    return channel / 12.92 if channel <= 0.04045 else ((channel + 0.055) / 1.055) ** 2.4


def rgba(hex_color):
    return tuple(linear(int(hex_color[index:index + 2], 16) / 255) for index in (0, 2, 4)) + (1.0,)


def material(name, color, roughness, metal=0.0, emission=None):
    result = bpy.data.materials.new(name)
    result.diffuse_color = rgba(color)
    result.use_nodes = True
    shader = result.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = rgba(color)
    shader.inputs["Metallic"].default_value = metal
    shader.inputs["Roughness"].default_value = roughness
    if emission:
        tint, strength = emission
        shader.inputs["Emission Color"].default_value = rgba(tint)
        shader.inputs["Emission Strength"].default_value = strength
    return result


class Part:
    """One visible mesh per rig slot, with a material assignment for each face."""

    def __init__(self, root, name, bind, rotation=0):
        self.node = bpy.data.objects.new(name, None)
        bpy.context.scene.collection.objects.link(self.node)
        self.node.parent = root
        self.node.location = to_blender(bind)
        self.node.rotation_euler.y = -rotation
        self.vertices = []
        self.faces = []
        self.assignments = []
        self.materials = []

    def shape(self, vertices, faces, surface, smooth=False):
        offset = len(self.vertices)
        self.vertices.extend(to_blender(vertex) for vertex in vertices)
        if surface not in self.materials:
            self.materials.append(surface)
        index = self.materials.index(surface)
        for face in faces:
            self.faces.append(tuple(offset + v for v in face))
            self.assignments.append((index, smooth))

    def finish(self):
        name = f"{self.node.name}_Shell"
        mesh = bpy.data.meshes.new(name)
        mesh.from_pydata(self.vertices, [], self.faces)
        for surface in self.materials:
            mesh.materials.append(surface)
        for polygon, (index, smooth) in zip(mesh.polygons, self.assignments):
            polygon.material_index = index
            polygon.use_smooth = smooth
        mesh.update()
        obj = bpy.data.objects.new(name, mesh)
        bpy.context.scene.collection.objects.link(obj)
        obj.parent = self.node


def panel(part, surface, center, outline, depth, bevel=0.008, tilt=0.0, curve=0.0):
    """A shallow cast plate with a bevel and optional wrap across the x axis."""
    area = sum(a[0] * b[1] - a[1] * b[0] for a, b in zip(outline, outline[1:] + outline[:1]))
    if area < 0:
        outline = outline[::-1]
    count = len(outline)
    radius = max(max(abs(x), abs(y)) for x, y in outline)
    bevel = min(bevel, depth * 0.35, radius * 0.22)
    inset = 1 - bevel / radius
    cx, cy, cz = center
    cosine, sine = math.cos(tilt), math.sin(tilt)
    wrap = max(abs(x) for x, _ in outline)
    vertices = []
    for scale, z in [(inset, -depth / 2), (1, -depth / 2 + bevel), (1, depth / 2 - bevel), (inset, depth / 2)]:
        for x, y in outline:
            vertices.append((
                cx + scale * (x * cosine - y * sine),
                cy + scale * (x * sine + y * cosine),
                cz + z - curve * (x / wrap) ** 2,
            ))
    faces = [tuple(reversed(range(count)))]
    for layer in range(3):
        start = layer * count
        for i in range(count):
            j = (i + 1) % count
            faces.append((start + i, start + j, start + count + j, start + count + i))
    if curve:
        front_center = len(vertices)
        vertices.append((cx, cy, cz + depth / 2))
        faces.extend((3 * count + i, 3 * count + (i + 1) % count, front_center) for i in range(count))
    else:
        faces.append(tuple(range(3 * count, 4 * count)))
    part.shape(vertices, faces, surface)


def rectangle(part, surface, center, width, height, depth, corner=0.009, tilt=0.0):
    x, y = width / 2, height / 2
    c = min(x * 0.45, y * 0.45, corner)
    outline = [(-x + c, -y), (x - c, -y), (x, -y + c), (x, y - c),
               (x - c, y), (-x + c, y), (-x, y - c), (-x, -y + c)]
    panel(part, surface, center, outline, depth, min(corner, 0.008), tilt)


def ellipsoid(part, surface, center, size, steps=24, bands=12):
    cx, cy, cz = center
    rx, ry, rz = size
    vertices = [(cx, cy - ry, cz)]
    for row in range(1, bands):
        latitude = -math.pi / 2 + math.pi * row / bands
        radius = math.cos(latitude)
        for column in range(steps):
            theta = TAU * column / steps
            vertices.append((cx + rx * radius * math.cos(theta), cy + ry * math.sin(latitude),
                             cz + rz * radius * math.sin(theta)))
    top = len(vertices)
    vertices.append((cx, cy + ry, cz))
    faces = []
    for i in range(steps):
        j = (i + 1) % steps
        faces.append((0, 1 + i, 1 + j))
        for row in range(bands - 2):
            a = 1 + row * steps
            faces.append((a + i, a + i + steps, a + j + steps, a + j))
        a = 1 + (bands - 2) * steps
        faces.append((a + i, top, a + j))
    part.shape(vertices, faces, surface, True)


def ring(part, surface, center, radius, tube, start=0.0, arc=TAU, steps=56, sides=8):
    """A torus or an arc in the XY plane."""
    full = math.isclose(arc, TAU)
    columns = steps if full else steps + 1
    cx, cy, cz = center
    vertices = []
    faces = []
    for column in range(columns):
        angle = start + arc * column / steps
        for side in range(sides):
            section = TAU * side / sides
            radial = radius + tube * math.cos(section)
            vertices.append((cx + radial * math.cos(angle), cy + radial * math.sin(angle),
                             cz + tube * math.sin(section)))
    for column in range(steps):
        next_column = (column + 1) % columns
        for side in range(sides):
            next_side = (side + 1) % sides
            faces.append((column * sides + side, next_column * sides + side,
                          next_column * sides + next_side, column * sides + next_side))
    if not full:
        faces.extend((tuple(range(sides)), tuple(reversed(range((columns - 1) * sides, columns * sides)))))
    part.shape(vertices, faces, surface, True)


def rivet(part, surface, x, y, z, radius=0.013):
    polygon = [(radius * math.cos(i * TAU / 6), radius * math.sin(i * TAU / 6)) for i in range(6)]
    panel(part, surface, (x, y, z), polygon, 0.013, 0.002)


def boot_shell(part, surface, width, back, toe, y, height):
    """Foot shape from a rounded footprint, extruded vertically."""
    footprint = [
        (-width * 0.38, back), (width * 0.38, back), (width * 0.49, back + 0.04),
        (width * 0.50, toe - 0.043), (width * 0.30, toe),
        (-width * 0.30, toe), (-width * 0.50, toe - 0.043), (-width * 0.49, back + 0.04),
    ]
    vertices = [(x, y, z) for x, z in footprint] + [
        (x * 0.88, y + height * (1.04 - (z - back) / (toe - back) * 0.28), z * 0.89) for x, z in footprint
    ]
    count = len(footprint)
    faces = [tuple(range(count)), tuple(reversed(range(count, count * 2)))]
    for i in range(count):
        j = (i + 1) % count
        faces.append((i, count + i, count + j, j))
    part.shape(vertices, faces, surface)


def make_suit(root, palette):
    ceramic, edge, teal, black, brass, steel, visor, cyan, amber = palette
    pelvis = 0.91
    torso = Part(root, "Torso", (0, pelvis, 0))
    ellipsoid(torso, black, (0, 0.39, -0.012), (0.263, 0.391, 0.157))
    ellipsoid(torso, teal, (0, 0.08, -0.018), (0.236, 0.134, 0.158))
    ellipsoid(torso, teal, (0, 0.537, -0.017), (0.299, 0.242, 0.177))
    ellipsoid(torso, steel, (0, 0.773, -0.005), (0.096, 0.097, 0.094), 20, 8)
    chest = [(-0.267, 0.099), (-0.207, 0.188), (0.207, 0.188), (0.267, 0.099),
             (0.227, -0.066), (0.13, -0.164), (-0.13, -0.164), (-0.227, -0.066)]
    panel(torso, edge, (0, 0.522, 0.143), [(x * 1.04, y * 1.07) for x, y in chest], 0.061, curve=0.055)
    panel(torso, ceramic, (0, 0.54, 0.176), chest, 0.043, curve=0.057)
    rectangle(torso, black, (0, 0.535, 0.208), 0.174, 0.113, 0.029, 0.022)
    rectangle(torso, teal, (0, 0.535, 0.226), 0.135, 0.083, 0.012, 0.017)
    for side in (-1, 1):
        rectangle(torso, cyan, (side * 0.037, 0.54, 0.234), 0.019, 0.052, 0.006, 0.006, -side * 0.13)
        rectangle(torso, cyan, (side * 0.193, 0.629, 0.203), 0.074, 0.012, 0.009, 0.004, -side * 0.24)
        rivet(torso, steel, side * 0.191, 0.426, 0.194)
        for i in range(3):
            rectangle(torso, brass, (side * 0.155, 0.247 + 0.044 * i, 0.111), 0.083, 0.018, 0.032,
                      0.006, side * 0.27)
    for i in range(3):
        rectangle(torso, teal, (0, 0.197 + 0.043 * i, 0.133), 0.207 + 0.016 * i, 0.031, 0.037, 0.012)
    rectangle(torso, steel, (0, 0.125, 0.134), 0.37, 0.066, 0.032, 0.022)
    rectangle(torso, brass, (0, 0.128, 0.161), 0.111, 0.08, 0.035, 0.016)
    rectangle(torso, amber, (0, 0.124, 0.182), 0.054, 0.012, 0.006, 0.004)
    torso.finish()

    helmet = Part(root, "Helmet", (0, pelvis + 0.91, 0))
    ellipsoid(helmet, ceramic, (0, 0.051, -0.017), (0.185, 0.202, 0.174), 32, 16)
    ellipsoid(helmet, teal, (0, 0.141, -0.075), (0.136, 0.111, 0.105))
    mask = [(-0.169, 0.061), (-0.125, 0.108), (0.125, 0.108), (0.169, 0.061),
            (0.143, -0.062), (0.082, -0.104), (-0.082, -0.104), (-0.143, -0.062)]
    panel(helmet, brass, (0, 0.043, 0.164), mask, 0.062, 0.014, curve=0.045)
    panel(helmet, visor, (0, 0.055, 0.198), [(x * 0.90, y * 0.82) for x, y in mask],
          0.029, 0.008, curve=0.037)
    rectangle(helmet, cyan, (0, 0.086, 0.213), 0.166, 0.012, 0.007, 0.005)
    rectangle(helmet, amber, (0, -0.007, 0.218), 0.044, 0.008, 0.006, 0.004)
    for side in (-1, 1):
        rectangle(helmet, ceramic, (side * 0.132, -0.067, 0.137), 0.061, 0.093, 0.062, 0.017, side * 0.25)
        ellipsoid(helmet, brass, (side * 0.176, 0.043, -0.036), (0.039, 0.068, 0.072), 20, 10)
        ellipsoid(helmet, steel, (side * 0.202, 0.043, -0.036), (0.018, 0.05, 0.053), 16, 8)
        ellipsoid(helmet, cyan, (side * 0.219, 0.043, -0.037), (0.006, 0.019, 0.021), 14, 7)
        rivet(helmet, steel, side * 0.13, -0.056, 0.18, 0.009)
    helmet.finish()

    for side, suffix in [(-1, "L"), (1, "R")]:
        x = side * 0.293
        upper = Part(root, f"UpperArm_{suffix}", (x, pelvis + 0.666, 0))
        ellipsoid(upper, black, (0, -0.104, -0.006), (0.096, 0.184, 0.094))
        ellipsoid(upper, ceramic if side == -1 else teal, (side * 0.039, -0.028, 0), (0.145, 0.121, 0.134))
        shoulder_plate = [(-0.113, -0.043), (-0.072, -0.084), (0.072, -0.084), (0.117, -0.033),
                          (0.095, 0.05), (0.031, 0.091), (-0.052, 0.079)]
        panel(upper, ceramic, (side * 0.038, -0.045, 0.101), shoulder_plate, 0.055, 0.017, side * 0.18, 0.026)
        rectangle(upper, teal, (side * 0.042, -0.053, 0.127), 0.123, 0.033, 0.014, 0.013, side * 0.18)
        rectangle(upper, amber, (side * 0.061, -0.052, 0.137), 0.057, 0.008, 0.004, 0.004, side * 0.18)
        ellipsoid(upper, teal, (0, -0.189, 0.008), (0.084, 0.094, 0.083))
        rectangle(upper, edge, (side * 0.029, -0.206, 0.079), 0.083, 0.061, 0.022, 0.016, side * 0.13)
        upper.finish()

        forearm = Part(root, f"Forearm_{suffix}", (x, pelvis + 0.666 - 0.28, 0))
        ellipsoid(forearm, black, (0, -0.118, 0.003), (0.092, 0.167, 0.091))
        ellipsoid(forearm, brass, (0, -0.129, 0.012), (0.111, 0.124, 0.096))
        panel(forearm, ceramic, (0, -0.129, 0.09),
              [(-0.071, 0.076), (-0.049, 0.106), (0.063, 0.101), (0.089, 0.064),
               (0.073, -0.068), (0.042, -0.105), (-0.055, -0.098), (-0.082, -0.042)], 0.062, 0.013, side * 0.06)
        rectangle(forearm, teal, (0, -0.116, 0.126), 0.048, 0.131, 0.016, 0.012)
        rectangle(forearm, cyan, (0, -0.114, 0.137), 0.016, 0.093, 0.008, 0.007)
        for fastener_x in (-0.058, 0.058):
            rivet(forearm, steel, fastener_x, -0.081, 0.119, 0.011)
        ellipsoid(forearm, steel, (side * 0.07, -0.017, 0.006), (0.026, 0.054, 0.049), 16, 8)
        forearm.finish()

        glove = Part(root, f"Glove_{suffix}", (x, pelvis + 0.666 - 0.28 - 0.274, 0.005))
        ellipsoid(glove, black, (0, -0.033, 0.005), (0.066, 0.081, 0.056), 20, 10)
        rectangle(glove, ceramic, (0, -0.033, 0.052), 0.084, 0.071, 0.037, 0.018, side * 0.12)
        for index in range(3):
            rectangle(glove, teal, ((index - 1) * 0.025, -0.077, 0.039), 0.019, 0.038, 0.024, 0.006)
        rectangle(glove, cyan, (0, -0.055, 0.074), 0.055, 0.012, 0.005, 0.005)
        glove.finish()

        leg_x = side * 0.132
        thigh = Part(root, f"Thigh_{suffix}", (leg_x, pelvis - 0.047, 0))
        ellipsoid(thigh, black, (0, -0.148, -0.001), (0.109, 0.208, 0.105))
        ellipsoid(thigh, teal, (side * 0.026, -0.141, 0.044), (0.111, 0.156, 0.095))
        panel(thigh, ceramic, (side * 0.025, -0.127, 0.122),
              [(-0.071, 0.088), (0.042, 0.123), (0.075, 0.081), (0.068, -0.082),
               (0.033, -0.109), (-0.062, -0.083)], 0.04, 0.012, side * 0.12, 0.009)
        rectangle(thigh, edge, (side * 0.038, -0.114, 0.146), 0.043, 0.081, 0.011, 0.011, side * 0.14)
        rectangle(thigh, brass, (side * 0.041, -0.111, 0.154), 0.019, 0.055, 0.009, 0.007, side * 0.14)
        rivet(thigh, steel, -side * 0.023, -0.184, 0.148, 0.01)
        thigh.finish()

        shin = Part(root, f"Shin_{suffix}", (leg_x, pelvis - 0.047 - 0.367, 0))
        ellipsoid(shin, black, (0, -0.161, -0.002), (0.092, 0.228, 0.09))
        ellipsoid(shin, steel, (0, -0.029, 0.029), (0.093, 0.081, 0.092))
        panel(shin, ceramic, (0, -0.033, 0.107),
              [(-0.09, 0.01), (-0.063, 0.066), (0.063, 0.066), (0.09, 0.01),
               (0.071, -0.06), (0, -0.087), (-0.071, -0.06)], 0.047, 0.012, curve=0.019)
        ellipsoid(shin, brass, (0, -0.217, 0.017), (0.098, 0.145, 0.099))
        panel(shin, teal, (0, -0.235, 0.102),
              [(-0.081, 0.101), (0.075, 0.101), (0.066, -0.044), (0.038, -0.113),
               (-0.041, -0.113), (-0.071, -0.041)], 0.061, 0.012, curve=0.016)
        rectangle(shin, edge, (0, -0.229, 0.139), 0.052, 0.123, 0.014, 0.012)
        rectangle(shin, cyan, (0, -0.22, 0.149), 0.016, 0.095, 0.005, 0.007)
        shin.finish()

        boot = Part(root, f"Boot_{suffix}", (leg_x, pelvis - 0.047 - 0.367 - 0.4, 0.007))
        boot_shell(boot, black, 0.20, -0.075, 0.224, -0.095, 0.037)
        boot_shell(boot, ceramic, 0.177, -0.061, 0.214, -0.058, 0.094)
        ellipsoid(boot, teal, (0, 0.009, 0.004), (0.081, 0.078, 0.078))
        rectangle(boot, teal, (0, -0.025, 0.192), 0.121, 0.035, 0.045, 0.012)
        for index in range(3):
            rectangle(boot, cyan, ((index - 1) * 0.03, -0.027, 0.216), 0.012, 0.012, 0.007, 0.004)
        boot.finish()

    yoke_bind = (0, pelvis + 0.68, -0.24)
    yoke = Part(root, "Yoke", yoke_bind)
    ellipsoid(yoke, teal, (0, -0.012, -0.03), (0.224, 0.207, 0.108))
    ring(yoke, brass, (0, 0, -0.097), 0.341, 0.041, sides=12)
    ring(yoke, steel, (0, 0, -0.12), 0.298, 0.019)
    ring(yoke, cyan, (0, 0, -0.145), 0.306, 0.007, start=0.27, arc=TAU - 0.54)
    ring(yoke, amber, (0, 0, -0.152), 0.191, 0.009)
    ellipsoid(yoke, brass, (0, 0, -0.133), (0.171, 0.165, 0.068))
    ellipsoid(yoke, teal, (0, 0, -0.171), (0.133, 0.129, 0.045))
    ellipsoid(yoke, cyan, (0, 0, -0.203), (0.073, 0.072, 0.021), 20, 10)
    for index in range(6):
        angle = index * TAU / 6 + 0.15
        rectangle(yoke, steel, (0.297 * math.cos(angle), 0.297 * math.sin(angle), -0.077),
                  0.15, 0.048, 0.055, 0.012, angle)
    yoke.finish()

    for side, suffix in [(-1, "L"), (1, "R")]:
        for index, elevation in enumerate((-0.73, 0, 0.73)):
            angle = elevation if side == 1 else math.pi - elevation
            bind = (math.cos(angle) * RAIL_RADIUS, yoke_bind[1] + math.sin(angle) * RAIL_RADIUS, yoke_bind[2])
            pole = Part(root, f"Pole_{suffix}{index}", bind, angle)
            ring(pole, teal, (-RAIL_RADIUS, 0, -0.016), RAIL_RADIUS, 0.065, -0.291, 0.582, 18, 12)
            ring(pole, brass, (-RAIL_RADIUS, 0, -0.029), RAIL_RADIUS + 0.025, 0.049, -0.273, 0.546, 18, 12)
            ring(pole, ceramic, (-RAIL_RADIUS, 0, -0.053), RAIL_RADIUS + 0.050, 0.035, -0.222, 0.444, 16, 10)
            ring(pole, cyan if side == 1 else amber, (-RAIL_RADIUS, 0, -0.013), RAIL_RADIUS + 0.075,
                 0.008, -0.194, 0.388, 14, 8)
            for port in (-0.072, 0.072):
                rectangle(pole, steel, (-0.036, port, -0.01), 0.034, 0.041, 0.097, 0.01)
            pole.finish()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path,
                        default=Path(__file__).resolve().parents[1] / "public" / "models" / "magnet-blender.glb")
    args = parser.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else
                             [] if "--python" in sys.argv else sys.argv[1:])
    output = args.output.resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    root = bpy.data.objects.new("Magnet_Orbital_Suit", None)
    root["authoring"] = "Blender procedural geometry"
    bpy.context.scene.collection.objects.link(root)
    make_suit(root, (
        material("Ceramic · ivory enamel", "D4C5A3", 0.32, 0.13),
        material("Ceramic edges · sandstone", "726348", 0.43, 0.22),
        material("Frame · deep teal", "143E42", 0.37, 0.48),
        material("Pressure textile · carbon", "202932", 0.76, 0.03),
        material("Mechanics · satin bronze", "AE743D", 0.31, 0.67),
        material("Fasteners · dark titanium", "58666B", 0.34, 0.76),
        material("Visor · smoked glass", "142F38", 0.19, 0.50),
        material("Emitters · cyan", "48DDD4", 0.28, 0.20, ("31FFE4", 1.1)),
        material("Emitters · amber", "EA994A", 0.29, 0.22, ("FFAE54", 0.9)),
    ))
    bpy.ops.export_scene.gltf(
        filepath=str(output), export_format="GLB", export_yup=True,
        export_materials="EXPORT", export_texcoords=False, export_normals=True,
        export_animations=False, export_extras=True,
    )
    print(f"Exported {output.name}: {output.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
