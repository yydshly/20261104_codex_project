import './chess-style-study.css';

const files = 'abcdefgh';
const opening = [
  'rnbqkbnr',
  'pppppppp',
  '........',
  '........',
  '........',
  '........',
  'PPPPPPPP',
  'RNBQKBNR',
];
const spriteColumn = { k: 0, q: 50, r: 100, b: 0, n: 50, p: 100 };
const secondRow = new Set(['b', 'n', 'p']);

export function renderWoodlandPiece(type, color) {
  const row = (color === 'b' ? 2 : 0) + Number(secondRow.has(type));
  return `<span class="chess-study-piece" aria-hidden="true" style="background-position:${spriteColumn[type]}% ${row * 100 / 3}%"></span>`;
}

function renderSquare(piece, row, column) {
  const square = files[column] + (8 - row);
  const selected = square === 'e2';
  const target = square === 'e3' || square === 'e4';
  const shade = (row + column) % 2 ? 'shade' : 'light';
  const kind = piece.toLowerCase();
  const sprite = piece === '.' ? '' : renderWoodlandPiece(kind, piece === kind ? 'b' : 'w');

  return `<span class="chess-study-square chess-study-square--${shade}" data-square="${square}" data-piece="${piece}">
    ${sprite}${selected ? '<span class="chess-study-selected"></span>' : ''}${target ? '<span class="chess-study-target"></span>' : ''}
  </span>`;
}

export function renderChessStyleStudy(sheet) {
  const image = `${import.meta.env.BASE_URL}${sheet}`;
  return `
    <figure class="chess-study">
      <div class="chess-study-paper" style="--chess-study-sheet: url('${image}')">
        <div class="chess-study-header">
          <span class="chess-study-kicker">WOODLAND POST OFFICE</span>
          <strong>林间邮局</strong>
          <span class="chess-study-edition">原创手绘样张</span>
        </div>
        <div class="chess-study-frame" role="img" aria-label="林间邮局主题国际象棋的标准开局。白方 e2 兵已选中，e3 和 e4 标出合法落点。">
          <div class="chess-study-ranks" aria-hidden="true">${[...'87654321'].map((rank) => `<span>${rank}</span>`).join('')}</div>
          <div class="chess-study-board" aria-hidden="true">
            ${opening.map((rank, row) => [...rank].map((piece, column) => renderSquare(piece, row, column)).join('')).join('')}
          </div>
          <div class="chess-study-files" aria-hidden="true">${[...files].map((file) => `<span>${file}</span>`).join('')}</div>
        </div>
        <div class="chess-study-legend">
          <span><i class="chess-study-ring-key" aria-hidden="true"></i>选中的兵</span>
          <span><i class="chess-study-dot-key" aria-hidden="true"></i>可走的位置</span>
        </div>
      </div>
      <figcaption>同一个开局里，用王冠、城垛、马头和圆顶区分棋子。信封、邮袋和围巾呼应邮局主题。<a href="${image}" target="_blank" rel="noopener noreferrer">查看棋子原图 ↗</a></figcaption>
    </figure>
  `;
}
