const palettes = ['indigo', 'amber', 'moss', 'midnight'];
const captions = ['top', 'middle', 'bottom'];
const motifs = ['hills', 'skyline', 'lamp', 'water', 'moon', 'sun', 'tree', 'bird', 'boat', 'cloud', 'ripple', 'rain', 'snow', 'sketch'];
const motions = ['still', 'reveal', 'rise', 'drift', 'fall', 'spread'];
const inks = ['pencil', 'wash', 'light'];

export const maxThemeLength = 180;

const choice = values => ({ type: 'string', enum: values });
const object = properties => ({
  type: 'object',
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});

export const scenePlanSchema = object({
  title: { type: 'string' },
  lines: { type: 'array', items: { type: 'string' } },
  description: { type: 'string' },
  palette: choice(palettes),
  caption: choice(captions),
  layers: {
    type: 'array',
    items: object({
      motif: choice(motifs),
      motion: choice(motions),
      ink: choice(inks),
      x: { type: 'number' },
      y: { type: 'number' },
      size: { type: 'number' },
      start: { type: 'number' },
      end: { type: 'number' },
      points: { type: 'array', items: object({ x: { type: 'number' }, y: { type: 'number' } }) },
    }),
  },
});

export function validateScenePlan(plan) {
  const text = (value, limit) => typeof value === 'string' && value.trim().length > 0 && value.length <= limit
    && !/[\r\n]/u.test(value);
  const number = (value, min, max) => Number.isFinite(value) && value >= min && value <= max;
  return plan && text(plan.title, 16) && text(plan.description, 90)
    && Array.isArray(plan.lines) && plan.lines.length === 3 && plan.lines.every(line => text(line, 24))
    && palettes.includes(plan.palette) && captions.includes(plan.caption)
    && Array.isArray(plan.layers) && plan.layers.length >= 3 && plan.layers.length <= 12
    && plan.layers.every(layer => layer
      && motifs.includes(layer.motif) && motions.includes(layer.motion) && inks.includes(layer.ink)
      && number(layer.x, 0, 1) && number(layer.y, 0, 1) && number(layer.size, .05, 1.6)
      && number(layer.start, 0, .85) && number(layer.end, layer.start + .049, 1)
      && Array.isArray(layer.points)
      && (layer.motif === 'sketch'
        ? layer.points.length >= 2 && layer.points.length <= 18
          && layer.points.every(point => point && number(point.x, -1, 1) && number(point.y, -1, 1))
        : layer.points.length === 0));
}
