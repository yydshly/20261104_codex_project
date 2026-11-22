---
pretty_name: sand3d-objaverse
license: cc-by-4.0
task_categories:
  - text-to-3d
  - image-to-3d
tags:
  - 3d
  - code
  - openusd
  - usd
  - cad
  - articulated-objects
  - program-synthesis
  - sand3d
size_categories:
  - 10K<n<100K
configs:
  - config_name: default
    data_files:
      - split: train
        path: "data/*/train-*.parquet"
      - split: validation
        path: "data/*/validation-*.parquet"
---
![Sand3D Objaverse: a scene of objects from the dataset](assets/banner.png)

# sand3d-objaverse

66 887 3D objects written as code. Each object is a short Python program in
[sand3d](https://github.com/Sandflow-ai/sand3d), the OpenUSD file that program exports, and a
render of it. Everyday objects, articulated mechanisms and mechanical CAD parts, in one language:
every part is named, every dimension a parameter, and articulated objects declare their joints.

| source | objects | articulated | joints |
|---|---:|---:|---:|
| Objaverse | 66 887 | 14 | 57 |

Every `.usda` opens in the Hub's 3D viewer; an articulated object's file carries its joints. One per
source:

- Objaverse: [`usda/0000/objaverse-00080e826e7942b69d501fe24b115ece.usda`](usda/0000/objaverse-00080e826e7942b69d501fe24b115ece.usda)

## What a row holds

The Parquet files under `data/` hold one row per object; the Dataset Viewer shows them.

| column | |
|---|---|
| `id` | the object's id in this dataset |
| `program` | its sand3d program |
| `entry` | the program's function that builds the object; null when the program builds it as it runs |
| `render` | one picture of the object, as the program builds it |
| `usda_path` | its OpenUSD file in this repository: metres, Z up, materials; an articulated object's joints as UsdPhysics |
| `n_joints` | its joints, 0 for a rigid object |
| `f_score` | how close the program's shape is to the source object's ([Quality](#quality-f_score)) |
| `family` | a coarse category (furniture, hand tool, container…) |
| `split` | `train` or `val`, the `train` and `validation` splits ([Splits](#splits)) |
| `source`, `source_group`, `asset_id` | where the object comes from, and its id there |
| `license`, `source_license`, `attribution`, `license_status` | [Licence](#licence) |
| `sand3d_version` | the sand3d version the program was run under to write the file |
| `usda_bytes`, `usda_sha256`, `program_sha256` | the files' size and digests |

## Load it

One environment holds both the loading and the rebuilding below, on Python 3.13:

```sh
pip install "bpy==5.2.*" sand3d datasets huggingface_hub
```

```python
from datasets import load_dataset
from huggingface_hub import hf_hub_download

ds = load_dataset("Sandflow/sand3d-objaverse", split="train")
row = ds[0]
print(row["program"])     # the sand3d program
row["render"]             # a PIL image
usda = hf_hub_download("Sandflow/sand3d-objaverse", row["usda_path"], repo_type="dataset")
```

Rebuild an object with [sand3d](https://github.com/Sandflow-ai/sand3d) (Apache-2.0; it runs on
Blender's `bpy`):

```python
import bpy
import sand3d as s3d

bpy.ops.wm.read_factory_settings(use_empty=True)      # an empty scene
ns = {}
exec(row["program"], ns)
if row["entry"]:                                      # the function that builds the object
    obj = ns[row["entry"]]()
else:                                                 # the program built it as it ran
    roots = [o for o in bpy.context.scene.objects if o.parent is None]
    obj = roots[0] if len(roots) == 1 else s3d.group("object", *roots)
s3d.export(obj, "object.usda")                        # or .glb, .urdf
```

Every file here was written that way, under sand3d 1.5.0 (a pre-release) and bpy 4.5: an
object whose program did not run, or did not pass a static check, is not in the dataset. The programs
rebuild with sand3d ≥ 1.6 on bpy 5.2 into the same objects, though not always into byte-identical
files.

## Splits

`train` and `val` are a tag on every row, and both are released.
Objaverse objects are split by Sketchfab author and SimReady assets by NVIDIA product, within each
family, so that no author or product sits on both sides; about 3 % of each family is in `val`, and
every family is on both sides. CAD parts and Articraft objects are split by whole groups: for CAD,
held-out shape families, for Articraft, 12 held-out categories.

| source | train | val |
|---|---:|---:|
| Objaverse | 64 642 | 2 245 |

## Quality: `f_score`

`f_score` is the F-score between the surface the program builds and the source object's, at a
distance of 1 % of the object's bounding-box diagonal. **It is the pipeline's own measurement of its
output, taken when the program was written, not an independent judge**, and nothing here re-measures
it. An articulated object is scored whole, at rest; each of its moving parts and joints was checked
too. The floors kept: 0.70 for Objaverse and the static SimReady assets (scored against the whole mesh,
where a lower score is often a program that leaves out small details), 0.90 for CAD parts and
Articraft's rigid programs, and for articulated objects every joint right and every part at 0.90.

## How the programs were written

The programs come from Sandflow's **iterative agentic reconstruction pipeline**: an agent writes a
sand3d program, runs it, compares what it builds with the source object, and revises the program
until it rebuilds the object. The pipeline itself will be described in upcoming releases, not in this
dataset. The Articraft and Zero-To-CAD source objects were themselves generated by their authors'
own agentic systems, as their papers describe.

## Licence

The sand3d programs, renders and USD files in this dataset are released under CC-BY-4.0. Each record
is derived from a third-party object; to the extent that it is an adaptation of that object, the
object's own licence also applies, and its attribution must be kept: see the `source`,
`source_license` and `attribution` columns. Every source is under CC-BY-4.0, Apache-2.0 or CC0; none
is non-commercial or share-alike. The sand3d library that runs these programs is released
separately, under Apache-2.0 (https://github.com/Sandflow-ai/sand3d).

Every row carries both layers: `license` (ours, `CC-BY-4.0`) and `source_license` (the object's).
`attribution` names the object, its author where there is one, its licence, and that it was
modified.

| source | objects | source licence | what reuse must keep |
|---|---:|---|---|
| [Objaverse](https://objaverse.allenai.org) | 66 887 | CC-BY-4.0 (66 275), CC0-1.0 (612), per object | the per-object `attribution` (title, author, Sketchfab URL, licence) and the note that it was modified; Objaverse as a whole is under ODC-By |



## Removal requests

If you hold rights in an object in this dataset and want it removed, write to
thibault.neveu@sandflow.ai with its `asset_id`.

## Citation

If you use this dataset or the sand3d library, please cite:

```bibtex
@misc{sand3d2026,
  author = {Neveu, Thibault and Loy, Andr{\'e}a},
  title  = {sand3d},
  year   = {2026},
  note   = {Version 1.6.2},
  url    = {https://github.com/Sandflow-ai/sand3d}
}
```

Please also cite the sources its objects come from.

```bibtex
@misc{deitke2022objaverseuniverseannotated3d,
      title={Objaverse: A Universe of Annotated 3D Objects},
      author={Matt Deitke and Dustin Schwenk and Jordi Salvador and Luca Weihs and Oscar Michel and Eli VanderBilt and Ludwig Schmidt and Kiana Ehsani and Aniruddha Kembhavi and Ali Farhadi},
      year={2022},
      eprint={2212.08051},
      archivePrefix={arXiv},
      primaryClass={cs.CV},
      url={https://arxiv.org/abs/2212.08051},
}
```
