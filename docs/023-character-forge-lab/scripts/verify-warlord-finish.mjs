import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { PROJECT_ROOT, parseGlb, accessorRows, inspectWarlordGlb } from './verify-warlord.mjs';

// This complements the unchanged character/animation verifier. It reads the
// runtime GLB itself; Blender-only shader nodes or cloth simulation do not count.
const MATERIALS = Object.freeze(['ArmorDark', 'ArmorGold', 'Blade', 'ClothRed', 'HeroSkin']);
// Matches the authored names in refine-warlord-motion.py.
export const FINISH_BONE_CONTRACT = Object.freeze({
  cape: /^Mantle_[0-4]_[0-3]$/, plume: /^SilkCrest_(?:-1|1)_[0-4]$/,
});
const EXPECTED_SECONDARY_BONES = Object.freeze({ cape: 20, plume: 10 });

function pngDimensions(bytes) {
  return bytes.length >= 24 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    ? { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) } : null;
}
function jpegDimensions(bytes) {
  if (bytes.length < 4 || bytes.readUInt16BE(0) !== 0xffd8) return null;
  for (let offset = 2; offset + 4 <= bytes.length;) {
    if (bytes[offset] !== 0xff) { offset++; continue; }
    while (bytes[offset] === 0xff) offset++;
    const marker = bytes[offset++];
    if (marker === 0xd9 || marker === 0xda) break;
    if (marker === 0x01 || marker >= 0xd0 && marker <= 0xd7) continue;
    assert(offset + 2 <= bytes.length, 'JPEG segment header is bounded');
    const length = bytes.readUInt16BE(offset);
    assert(length >= 2 && offset + length <= bytes.length, 'JPEG segment is bounded');
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      assert(length >= 7, 'JPEG frame has dimensions');
      return { width: bytes.readUInt16BE(offset + 5), height: bytes.readUInt16BE(offset + 3) };
    }
    offset += length;
  }
  return null;
}
function imageBytes(glb, index) {
  const image = glb.document.images?.[index];
  assert(image && image.bufferView !== undefined && !image.uri, `Image ${index} is embedded`);
  const view = glb.document.bufferViews?.[image.bufferView];
  assert(view && (view.buffer || 0) === 0, `Image ${index} uses the GLB buffer`);
  const start = view.byteOffset || 0, end = start + view.byteLength;
  assert(start >= 0 && end <= glb.binary.length && end > start, `Image ${index} bytes are bounded`);
  return glb.binary.subarray(start, end);
}
function textureDetail(glb, reference, label) {
  assert(reference && Number.isInteger(reference.index), `${label} is a real exported texture`);
  const texture = glb.document.textures?.[reference.index];
  assert(texture && Number.isInteger(texture.source), `${label} has an image source`);
  const bytes = imageBytes(glb, texture.source), dimensions = pngDimensions(bytes) || jpegDimensions(bytes);
  assert(dimensions?.width > 0 && dimensions?.height > 0, `${label} is a decodable PNG/JPEG image`);
  assert(Math.min(dimensions.width, dimensions.height) >= 64, `${label} has spatial detail rather than a one-pixel constant`);
  return { texture: reference.index, image: texture.source, ...dimensions, bytes: bytes.length };
}

function channelVariation(glb, clip, channel) {
  const sampler = clip.samplers[channel.sampler];
  let values = accessorRows(glb, sampler.output);
  if (sampler.interpolation === 'CUBICSPLINE') values = values.filter((_, index) => index % 3 === 1);
  if (values.length < 2) return 0;
  const first = values[0];
  if (channel.target.path === 'rotation') {
    // q and -q are equivalent: compare angular rotation, never raw components.
    const magnitude = vector => Math.hypot(...vector);
    const a = magnitude(first);
    return Math.max(...values.map(value => {
      const b = magnitude(value);
      assert(a > 0 && b > 0, `${clip.name}: cloth quaternion is nonzero`);
      const dot = Math.abs(value.reduce((sum, component, i) => sum + component * first[i], 0) / (a * b));
      return 2 * Math.acos(Math.min(1, dot));
    }));
  }
  return Math.max(...values.map(value => Math.hypot(...value.map((component, i) => component - first[i]))));
}
function clothMotion(glb, patterns) {
  const g = glb.document, joints = new Set(g.skins.flatMap(skin => skin.joints));
  const groups = Object.fromEntries(Object.entries(patterns).map(([category, expression]) => {
    const indices = g.nodes.map((node, index) => expression.test(node.name || '') && joints.has(index) ? index : -1).filter(index => index >= 0);
    assert.equal(indices.length, EXPECTED_SECONDARY_BONES[category], `Exported skin contains all authored ${category} bones`);
    return [category, indices];
  }));
  const clips = g.animations.map(clip => {
    const result = { name: clip.name };
    for (const [category, indices] of Object.entries(groups)) {
      const moving = clip.channels.filter(channel => indices.includes(channel.target.node) && ['rotation', 'translation', 'scale'].includes(channel.target.path))
        .map(channel => ({ bone: g.nodes[channel.target.node].name, path: channel.target.path, variation: channelVariation(glb, clip, channel) }))
        .filter(channel => channel.variation >= (channel.path === 'rotation' ? .00349 : .0005));
      assert.equal(new Set(moving.map(item => item.bone)).size, indices.length, `${clip.name}: all ${category} bones have actual exported secondary movement`);
      result[category] = { movingBones: new Set(moving.map(item => item.bone)).size, maximumVariation: Number(Math.max(...moving.map(item => item.variation)).toFixed(5)) };
    }
    return result;
  });
  return { bones: Object.fromEntries(Object.entries(groups).map(([category, indices]) => [category, indices.map(index => g.nodes[index].name)])), clips };
}

export async function verifyWarlordFinish({ root = PROJECT_ROOT, asset = 'assets/warlord/warlord.glb', metadata = 'assets/warlord/metadata.json', bonePatterns = FINISH_BONE_CONTRACT } = {}) {
  const glb = parseGlb(await fs.readFile(path.resolve(root, asset)));
  const info = JSON.parse(await fs.readFile(path.resolve(root, metadata), 'utf8'));
  const originalContract = inspectWarlordGlb(glb, info);
  assert.equal(glb.document.animations.length, 13, 'Exactly thirteen authored playable clips');
  const materials = MATERIALS.map(name => {
    const materialIndex = glb.document.materials?.findIndex(item => item.name === name);
    const material = glb.document.materials?.[materialIndex];
    assert(material, `Authored finish material ${name} is exported`);
    const primitives = glb.document.meshes.flatMap(mesh => mesh.primitives).filter(primitive => primitive.material === materialIndex);
    assert(primitives.length > 0, `${name} is assigned to real runtime geometry`);
    const uvMapped = primitives.filter(primitive => {
      const uvIndex = primitive.attributes.TEXCOORD_0;
      if (uvIndex === undefined) return false;
      const rows = accessorRows(glb, uvIndex);
      assert(rows.length === glb.document.accessors[primitive.attributes.POSITION].count && rows.every(row => row.length === 2), `${name}: valid UVs address its vertices`);
      return rows.some(row => row.some((value, i) => Math.abs(value - rows[0][i]) > .0001));
    });
    assert(uvMapped.length > 0, `${name} has actual nonconstant UV-mapped surfaces`);
    return {
      name, primitives: primitives.length, uvMappedPrimitives: uvMapped.length,
      baseColor: textureDetail(glb, material.pbrMetallicRoughness?.baseColorTexture, `${name} base color`),
      normal: textureDetail(glb, material.normalTexture, `${name} normal`),
      metallicRoughness: textureDetail(glb, material.pbrMetallicRoughness?.metallicRoughnessTexture, `${name} packed roughness`),
    };
  });
  const secondaryMotion = clothMotion(glb, bonePatterns);
  return {
    status: 'passed', scope: 'Real exported PBR image maps and animated cloth/plume, preserving the existing meter-scale body, skeleton, attachment, timing and root-motion checks. Does not certify visual quality or GPU performance.',
    sha256: originalContract.sha256, bytes: originalContract.bytes, bones: originalContract.bones, triangles: originalContract.triangles,
    measuredBodyHeight: Number(originalContract.measuredBodyHeight.toFixed(5)), actions: originalContract.actions.length,
    materials, secondaryMotion,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = process.argv.slice(2); assert(args.length === 0, 'This final acceptance command has no implicit input overrides');
  try {
    const result = await verifyWarlordFinish();
    console.log(JSON.stringify({
      status: result.status, sha256: result.sha256, bytes: result.bytes, bones: result.bones,
      triangles: result.triangles, measuredBodyHeight: result.measuredBodyHeight, actions: result.actions,
      materialMaps: Object.fromEntries(result.materials.map(material => [material.name, { ...Object.fromEntries(['baseColor', 'normal', 'metallicRoughness'].map(key => [key, `${material[key].width}x${material[key].height}`])), uvMappedPrimitives: `${material.uvMappedPrimitives}/${material.primitives}` }])),
      secondaryMotion: { bones: result.secondaryMotion.bones, animatedClips: result.secondaryMotion.clips.map(clip => clip.name) },
      scope: result.scope,
    }, null, 2));
  }
  catch (error) { console.error(JSON.stringify({ status: 'failed', error: error.message })); process.exitCode = 1; }
}
