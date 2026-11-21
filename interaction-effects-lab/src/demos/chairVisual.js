import { furnitureChairs } from '../furniture.js';

const profiles = {
  siena: [1, 1, 1],
  alba: [.94, 1.09, .88],
  cove: [1.14, .88, 1.13],
  nola: [.88, .96, .95],
  arco: [.93, 1.15, 1.04],
  lune: [1.13, .96, .91],
};

export function chairProfile(chair) {
  return profiles[chair.id];
}

export function chairPhoto(chair, finish) {
  // The lookbook assets share a composition. Each is an upholstered color sample.
  const sample = furnitureChairs.find((entry) => entry.defaultFinish === finish.id);
  return sample?.image ?? chair.image;
}
