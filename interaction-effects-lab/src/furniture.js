export const furnitureFinishes = [
  { id: 'clay', name: '陶土色织物', color: '#b7785e', surcharge: 0 },
  { id: 'olive', name: '橄榄绿织物', color: '#74805b', surcharge: 0 },
  { id: 'oat', name: '燕麦色织物', color: '#c6ae8c', surcharge: 0 },
  { id: 'rose', name: '烟粉色织物', color: '#c2948c', surcharge: 180 },
  { id: 'slate', name: '板岩蓝织物', color: '#819b9e', surcharge: 280 },
  { id: 'ivory', name: '奶油色织物', color: '#dfd5bf', surcharge: 0 },
];

export const furnitureChairs = [
  { id: 'siena', name: 'Siena', defaultFinish: 'clay', price: 2580 },
  { id: 'alba', name: 'Alba', defaultFinish: 'olive', price: 2320 },
  { id: 'cove', name: 'Cove', defaultFinish: 'oat', price: 3140 },
  { id: 'nola', name: 'Nola', defaultFinish: 'rose', price: 2560 },
  { id: 'arco', name: 'Arco', defaultFinish: 'slate', price: 2600 },
  { id: 'lune', name: 'Lune', defaultFinish: 'ivory', price: 2460 },
].map((chair, index) => ({ ...chair, index, image: `${import.meta.env.BASE_URL}demo-assets/runway/chair-${index}.webp` }));

const selectionKey = 'interaction-effects-lab.furniture-selection.v1';

export function readFurnitureSelection() {
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(selectionKey));
    const chair = furnitureChairs.find((item) => item.id === saved?.chairId);
    if (chair) {
      const finish = furnitureFinishes.find((item) => item.id === saved.finishId);
      return { chairId: chair.id, finishId: finish?.id ?? chair.defaultFinish };
    }
  } catch {
    // The journey remains usable in memory when storage is unavailable.
  }
  return { chairId: furnitureChairs[0].id, finishId: furnitureChairs[0].defaultFinish };
}

export function rememberFurnitureSelection(selection) {
  try {
    window.sessionStorage.setItem(selectionKey, JSON.stringify(selection));
  } catch {
    // The current tab still shares its in-memory selection across routes.
  }
}
