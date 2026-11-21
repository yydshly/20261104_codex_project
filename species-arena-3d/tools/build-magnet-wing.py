"""Build Magnet's graphite magnetic-wing suit and export it with Blender.

Run: blender --background --python tools/build-magnet-wing.py
The script also supports a Python interpreter with Blender's bpy wheel.
"""

import argparse
import math
from pathlib import Path
import runpy
import sys

import bpy


_shared = runpy.run_path(str(Path(__file__).with_name("build-magnet-blender.py")))
Part = _shared["Part"]
material = _shared["material"]
panel = _shared["panel"]
rectangle = _shared["rectangle"]
ellipsoid = _shared["ellipsoid"]
rivet = _shared["rivet"]
boot_shell = _shared["boot_shell"]
RAIL_RADIUS = _shared["RAIL_RADIUS"]
PELVIS = 0.91


def loft(part, surface, outline, sections, center=(0, 0, 0)):
    """A faceted shell whose cross-section changes along its depth."""
    area = sum(a[0] * b[1] - a[1] * b[0] for a, b in zip(outline, outline[1:] + outline[:1]))
    if area < 0:
        outline = outline[::-1]
    n = len(outline)
    cx, cy, cz = center
    points = [(cx + x * sx, cy + y * sy + dy, cz + z)
              for z, sx, sy, dy in sections for x, y in outline]
    faces = [tuple(reversed(range(n)))]
    for section in range(len(sections) - 1):
        base = section * n
        for index in range(n):
            next_index = (index + 1) % n
            faces.append((base + index, base + next_index, base + n + next_index, base + n + index))
    faces.append(tuple(range(len(points) - n, len(points))))
    part.shape(points, faces, surface)


def make_torso(root, graphite, edge, pale, textile, copper, steel, visor, cyan, amber):
    torso = Part(root, "Torso", (0, PELVIS, 0))
    ellipsoid(torso, textile, (0, 0.35, -0.022), (0.228, 0.353, 0.15), 20, 10)
    hip = [(-0.23, 0.051), (-0.172, 0.096), (0.172, 0.096), (0.23, 0.051),
           (0.178, -0.066), (0, -0.113), (-0.178, -0.066)]
    loft(torso, edge, hip, [(-0.155, .82, .94, 0), (-.07, 1, 1, 0), (.11, .96, .91, 0), (.159, .8, .72, 0)], (0, .077, 0))
    chest = [(-.295, .124), (-.237, .203), (-.085, .188), (0, .145), (.085, .188),
             (.237, .203), (.295, .124), (.246, -.047), (.139, -.147), (0, -.205),
             (-.139, -.147), (-.246, -.047)]
    loft(torso, graphite, chest, [(-.165, .8, .89, .025), (-.073, 1, 1, 0), (.151, .99, .95, 0), (.225, .78, .84, 0)], (0, .51, 0))
    neck = [(-.093, -.028), (-.083, .048), (.083, .048), (.093, -.028), (.075, -.071), (-.075, -.071)]
    loft(torso, steel, neck, [(-.079, .8, .86, 0), (-.033, 1, 1, 0), (.075, .95, .92, 0)], (0, .79, 0))
    collar = [(-.128, .048), (.103, .076), (.124, .01), (.079, -.032), (-.081, -.048)]
    plate = [(-.102, .08), (-.062, .135), (.084, .105), (.113, .054), (.066, -.057), (-.045, -.105), (-.087, -.052)]
    for side in (-1, 1):
        panel(torso, pale, (side * .135, .644, .191), [(x * side, y) for x, y in collar], .062, .016, side * .12)
        panel(torso, edge, (side * .113, .515, .215), [(x * side, y) for x, y in plate], .038, .009, -side * .12)
        rectangle(torso, cyan, (side * .121, .537, .238), .097, .011, .006, .004, -side * .46)
        rectangle(torso, copper, (side * .173, .444, .203), .069, .017, .019, .006, side * .65)
        rivet(torso, steel, side * .181, .594, .23, .012)
        for index in range(3):
            rectangle(torso, steel, (side * .13, .242 + index * .038, .118), .088, .021, .024, .008, side * .29)
    center = [(-.06, .095), (.06, .095), (.041, -.045), (0, -.102), (-.041, -.045)]
    panel(torso, copper, (0, .513, .226), center, .048, .012)
    panel(torso, visor, (0, .515, .254), [(x * .64, y * .73) for x, y in center], .02, .006)
    rectangle(torso, amber, (0, .533, .266), .027, .072, .006, .005)
    rectangle(torso, copper, (0, .128, .158), .123, .072, .039, .012)
    rectangle(torso, cyan, (0, .128, .182), .057, .009, .007, .004)
    torso.finish()


def make_helmet(root, graphite, edge, pale, copper, steel, visor, cyan, amber):
    helmet = Part(root, "Helmet", (0, PELVIS + .91, 0))
    contour = [(-.18, -.036), (-.178, .099), (-.134, .187), (-.056, .226), (.089, .228),
               (.159, .174), (.193, .077), (.179, -.054), (.1, -.132), (-.093, -.132)]
    loft(helmet, graphite, contour, [(-.17, .74, .78, .022), (-.108, .98, 1.03, 0),
                                    (.057, 1, 1, 0), (.157, .86, .91, -.008)])
    crest = [(-.149, .033), (-.102, .071), (.121, .046), (.152, .005), (.091, -.032), (-.117, -.025)]
    panel(helmet, pale, (0, .148, .115), crest, .065, .017, -.071, .027)
    mask = [(-.172, .032), (-.135, .071), (-.009, .082), (.035, .051), (.155, .045), (.169, -.008),
            (.139, -.063), (.047, -.095), (-.056, -.077), (-.096, -.046), (-.143, -.05)]
    panel(helmet, copper, (0, .055, .166), mask, .069, .013, curve=.031)
    panel(helmet, visor, (0, .058, .205), [(x * .91, y * .81) for x, y in mask], .03, .006, curve=.026)
    rectangle(helmet, cyan, (-.07, .079, .223), .108, .013, .006, .003, .075)
    rectangle(helmet, cyan, (.082, .068, .222), .075, .01, .006, .003, -.13)
    rectangle(helmet, amber, (.116, .028, .221), .023, .008, .006, .003, -.2)
    for side in (-1, 1):
        rectangle(helmet, edge, (side * .137, -.064, .146), .072, .077, .061, .015, side * .3)
        rectangle(helmet, copper, (side * .145, -.07, .18), .018, .041, .009, .004, side * .32)
        ellipsoid(helmet, steel, (side * .18, .043, -.04), (.038, .064, .062), 16, 8)
        ellipsoid(helmet, cyan, (side * .214, .052, -.036), (.007, .02, .018), 12, 6)
    helmet.finish()


def make_limbs(root, graphite, edge, pale, textile, copper, steel, cyan, amber):
    for side, suffix in [(-1, "L"), (1, "R")]:
        arm_x = side * .293
        upper = Part(root, f"UpperArm_{suffix}", (arm_x, PELVIS + .666, 0))
        ellipsoid(upper, textile, (0, -.114, 0), (.085, .18, .085), 18, 9)
        shoulder = [(-.104, -.046), (-.108, .047), (-.047, .103), (.095, .081),
                    (.148, .008), (.099, -.067), (.01, -.095)]
        loft(upper, graphite, [(x * side, y) for x, y in shoulder],
             [(-.127, .83, .87, 0), (-.044, 1, 1, 0), (.106, .99, .98, 0), (.155, .76, .77, .006)],
             (side * .024, -.029, 0))
        panel(upper, pale if side == -1 else edge, (side * .035, -.013, .151),
              [(x * side * .77, y * .58) for x, y in shoulder], .031, .009, side * .11)
        rectangle(upper, copper, (side * .052, -.035, .171), .091, .016, .006, .004, side * .17)
        panel(upper, edge, (side * .014, -.19, .077),
              [(-.062, .046), (.064, .057), (.057, -.058), (-.047, -.073)], .036, .009)
        upper.finish()

        forearm = Part(root, f"Forearm_{suffix}", (arm_x, PELVIS + .666 - .28, 0))
        ellipsoid(forearm, textile, (0, -.126, .003), (.085, .163, .083), 18, 9)
        bracer = [(-.078, .089), (-.044, .13), (.077, .099), (.096, .038),
                  (.061, -.102), (-.053, -.121), (-.085, -.065)]
        loft(forearm, graphite, [(x * side, y) for x, y in bracer],
             [(-.069, .74, .91, 0), (-.011, 1, 1, 0), (.093, .97, .94, 0), (.141, .71, .78, .007)], (0, -.13, 0))
        panel(forearm, edge, (0, -.131, .142), [(x * side * .72, y * .78) for x, y in bracer], .022, .006)
        rectangle(forearm, cyan, (-side * .031, -.128, .157), .012, .106, .006, .004, side * .1)
        rectangle(forearm, pale, (side * .021, -.082, .155), .066, .038, .01, .008, side * .19)
        rivet(forearm, copper, side * .047, -.171, .152, .011)
        forearm.finish()

        glove = Part(root, f"Glove_{suffix}", (arm_x, PELVIS + .666 - .28 - .274, .005))
        ellipsoid(glove, textile, (0, -.031, .004), (.059, .077, .053), 18, 9)
        rectangle(glove, graphite, (0, -.035, .052), .095, .076, .037, .011, side * .095)
        rectangle(glove, copper, (0, -.062, .073), .065, .014, .009, .005)
        rectangle(glove, amber, (0, -.026, .073), .03, .008, .006, .004)
        glove.finish()

        leg_x = side * .132
        thigh = Part(root, f"Thigh_{suffix}", (leg_x, PELVIS - .047, 0))
        ellipsoid(thigh, textile, (0, -.143, -.004), (.099, .2, .103), 20, 10)
        thigh_panel = [(-.08, .109), (.044, .138), (.099, .083), (.075, -.094),
                       (.032, -.142), (-.062, -.109)]
        loft(thigh, graphite, [(x * side, y) for x, y in thigh_panel],
             [(-.06, .78, .91, 0), (-.002, 1, 1, 0), (.104, .93, .96, 0), (.156, .69, .8, 0)],
             (side * .015, -.134, 0))
        panel(thigh, edge, (side * .017, -.13, .159), [(x * side * .65, y * .7) for x, y in thigh_panel], .02, .007)
        rectangle(thigh, copper, (side * .047, -.117, .175), .022, .091, .009, .005, -side * .15)
        thigh.finish()

        shin = Part(root, f"Shin_{suffix}", (leg_x, PELVIS - .047 - .367, 0))
        ellipsoid(shin, textile, (0, -.171, -.009), (.084, .222, .083), 20, 10)
        knee = [(-.098, .01), (-.071, .054), (.071, .054), (.098, .01), (.071, -.066), (0, -.09), (-.071, -.066)]
        panel(shin, pale, (0, -.031, .105), knee, .068, .015, curve=.019)
        greave = [(-.095, .12), (.095, .12), (.071, -.041), (.034, -.147), (-.045, -.142), (-.072, -.046)]
        loft(shin, graphite, greave, [(-.076, .66, .86, 0), (-.03, 1, 1, 0), (.114, .89, .95, 0),
                                    (.161, .65, .78, .013)], (0, -.226, 0))
        panel(shin, edge, (0, -.211, .164), [(x * .67, y * .72) for x, y in greave], .019, .005)
        rectangle(shin, cyan, (0, -.197, .176), .014, .098, .006, .004)
        rectangle(shin, copper, (0, -.266, .176), .065, .015, .008, .006)
        shin.finish()

        boot = Part(root, f"Boot_{suffix}", (leg_x, PELVIS - .047 - .367 - .4, .007))
        boot_shell(boot, textile, .199, -.077, .233, -.095, .035)
        boot_shell(boot, graphite, .18, -.068, .222, -.063, .093)
        ellipsoid(boot, steel, (0, .015, .002), (.083, .078, .075), 16, 8)
        rectangle(boot, pale, (0, -.027, .202), .128, .03, .031, .008)
        rectangle(boot, cyan, (0, -.028, .222), .075, .008, .006, .004)
        boot.finish()


def make_wings(root, graphite, edge, pale, copper, steel, cyan, amber):
    yoke_bind = (0, PELVIS + .68, -.24)
    yoke = Part(root, "Yoke", yoke_bind)
    spine = [(-.21, .166), (-.125, .249), (.125, .249), (.21, .166), (.171, -.116),
             (.069, -.247), (-.069, -.247), (-.171, -.116)]
    loft(yoke, graphite, spine, [(-.242, .66, .82, -.014), (-.177, .97, .96, 0),
                               (-.048, 1, 1, 0), (.063, .79, .92, .02)])
    panel(yoke, edge, (0, -.01, -.244), [(x * .74, y * .81) for x, y in spine], .047, .012)
    rectangle(yoke, pale, (0, .035, -.272), .142, .258, .039, .02)
    rectangle(yoke, graphite, (0, .03, -.296), .072, .159, .02, .012)
    rectangle(yoke, cyan, (0, .037, -.31), .021, .109, .009, .007)
    for side in (-1, 1):
        for index in range(3):
            rectangle(yoke, copper, (side * .132, -.093 + .095 * index, -.23),
                      .062, .027, .04, .007, side * .38)
    yoke.finish()

    outline = [(-.072, -.041), (.052, -.042), (.088, .054), (.083, .197),
               (.039, .373), (-.024, .454), (-.044, .341), (-.087, .201), (-.091, .073)]
    for side, suffix in [(-1, "L"), (1, "R")]:
        for index, elevation in enumerate((-.73, 0, .73)):
            angle = elevation if side == 1 else math.pi - elevation
            bind = (math.cos(angle) * RAIL_RADIUS, yoke_bind[1] + math.sin(angle) * RAIL_RADIUS, yoke_bind[2])
            vane = Part(root, f"Pole_{suffix}{index}", bind, angle)
            shape = [(x * side, y) for x, y in outline]
            loft(vane, graphite, shape, [(-.042, .84, .94, .008), (-.02, 1, 1, 0),
                                       (.029, 1, 1, 0), (.054, .73, .97, .004)])
            tip = [(-.05, -.019), (.048, -.032), (.017, .096), (-.025, .161)]
            inset = [(-.055, -.099), (.022, -.099), (.041, .034), (.01, .126), (-.026, .052)]
            for face in (-1, 1):
                panel(vane, pale, (-side * .013, .275, face * .049),
                      [(x * side, y) for x, y in tip], .029, .009)
                panel(vane, edge, (side * .012, .132, face * .052),
                      [(x * side, y) for x, y in inset], .022, .007)
                rectangle(vane, copper, (side * .049, .151, face * .067), .025, .151, .012, .006, side * .11)
                rectangle(vane, cyan, (-side * .026, .161, face * .069), .012, .136, .009, .004, side * .12)
                rectangle(vane, amber, (side * .009, .059, face * .069), .037, .011, .009, .004)
                rivet(vane, steel, 0, .013, face * .055, .013)
            vane.finish()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path,
                        default=Path(__file__).resolve().parents[1] / "public" / "models" / "magnet-blender-wing.glb")
    args = parser.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else
                             [] if "--python" in sys.argv else sys.argv[1:])
    output = args.output.resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    root = bpy.data.objects.new("Magnet_Wing_Suit", None)
    root["authoring"] = "Blender procedural geometry"
    bpy.context.scene.collection.objects.link(root)
    graphite = material("Wing · ink graphite", "24333E", .4, .44)
    edge = material("Wing · bevel steel", "475764", .37, .49)
    pale = material("Wing · porcelain armor", "DADBD2", .33, .17)
    textile = material("Wing · pressure textile", "18232E", .72, .07)
    copper = material("Wing · copper warning", "E28242", .38, .48)
    steel = material("Wing · machined titanium", "71818C", .35, .63)
    visor = material("Wing · midnight visor", "10252F", .18, .54)
    cyan = material("Emitters · cyan", "53DAE7", .29, .15, ("58F2FF", 1.12))
    amber = material("Emitters · amber", "EC8D45", .32, .17, ("FF8132", .92))
    make_torso(root, graphite, edge, pale, textile, copper, steel, visor, cyan, amber)
    make_helmet(root, graphite, edge, pale, copper, steel, visor, cyan, amber)
    make_limbs(root, graphite, edge, pale, textile, copper, steel, cyan, amber)
    make_wings(root, graphite, edge, pale, copper, steel, cyan, amber)
    bpy.ops.export_scene.gltf(
        filepath=str(output), export_format="GLB", export_yup=True,
        export_materials="EXPORT", export_texcoords=False, export_normals=True,
        export_animations=False, export_extras=True,
    )
    print(f"Exported {output.name}: {output.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
