// Times in seconds on the original MiniMax tracks, in scene order.
// Skip only the middle of measured long gaps, keeping both sides of each pause.
window.shuRoadAudioTrims = [
  {
    poem: { start: 0.09, end: 23.60, skip: [[11.15, 11.43], [17.14, 17.58]] },
    description: { start: 0.07, end: 14.02, skip: [[1.75, 2.35], [5.02, 5.38]] }
  },
  {
    poem: { start: 0.11, end: 6.63, skip: [] },
    description: { start: 0.11, end: 13.86, skip: [] }
  },
  {
    poem: { start: 0, end: 11.26, skip: [] },
    description: { start: 0.07, end: 14.33, skip: [[4.27, 4.44], [8.36, 8.75]] }
  },
  {
    poem: { start: 0.06, end: 11.28, skip: [] },
    description: { start: 0, end: 23.68, skip: [[5.28, 5.60], [7.34, 7.61], [13.35, 13.58]] }
  },
  {
    poem: { start: 0.08, end: 20.98, skip: [] },
    description: { start: 0.11, end: 14.37, skip: [[1.67, 1.91], [3.94, 4.20], [7.23, 7.45], [11.70, 11.87]] }
  },
  {
    poem: { start: 0, end: 18.43, skip: [] },
    description: { start: 0.07, end: 11.75, skip: [] }
  },
  {
    poem: { start: 0.08, end: 5.83, skip: [] },
    description: { start: 0, end: 23.99, skip: [[5.83, 5.98], [9.23, 9.40], [12.13, 12.38]] }
  },
  {
    poem: { start: 0, end: 13.91, skip: [] },
    description: { start: 0.04, end: 12.70, skip: [[2.68, 2.92], [6.00, 6.21], [9.70, 10.30]] }
  },
  {
    poem: { start: 0.11, end: 11.51, skip: [] },
    description: { start: 0.08, end: 14.92, skip: [[1.56, 1.78]] }
  }
];

// Subtitle starts measured on the source tracks, before the silence cuts.
window.shuRoadCaptionStarts = [
  { poem: [0, 3.25, 7.36, 11.74, 17.75], description: [0, 2.49, 5.52, 8.15] },
  { poem: [0, 2.82], description: [0, 3.27, 6.20, 9.35] },
  { poem: [0, 2.77, 5.42, 8.54], description: [0, 4.67, 9.06, 10.27] },
  { poem: [0, 5.52, 9.82], description: [0, 5.79, 11.26, 17.68] },
  { poem: [0, 2.75, 5.23, 10.51, 14.50], description: [0, 2.06, 4.60, 7.70] },
  { poem: [0, 5.59, 11.52, 12.62], description: [0, 1.82, 3.90] },
  { poem: [0, 2.68], description: [0, 6.13, 12.54, 18.33] },
  { poem: [0, 5.61, 9.50], description: [0, 3.08, 6.36, 10.45] },
  { poem: [0, 4.53, 8.56], description: [0, 2.08, 6.86, 9.69] }
];
