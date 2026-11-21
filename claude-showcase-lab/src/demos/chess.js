import { Chess } from 'chess.js'
import { renderWoodlandPiece } from '../chess-style-study.js'
import './chess.css'

const files = 'abcdefgh'
const ranks = '87654321'
const squares = [...ranks].flatMap(rank => [...files].map(file => file + rank))
const pieceNames = { p: '兵', n: '马', b: '象', r: '车', q: '后', k: '王' }
const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }
const woodlandGameKey = 'claude-showcase:woodland-chess:v1'

const shapes = {
  p: '<path d="M15 26 Q20 23 21 18 A7 7 0 1 1 27 18 Q28 23 33 26 L34 29 L14 29 Z"/><path class="ink-detail" d="M17 26 Q23 24 27 26"/>',
  n: '<path d="M12 30 Q13 21 24 15 L16 18 L10 16 L13 9 L19 5 L20 1 L26 5 Q35 6 36 18 L38 30 Z"/><path class="ink-detail" d="M21 10 L22 10 M26 8 Q32 13 32 21 M13 14 L16 13"/>',
  b: '<path d="M15 30 L19 23 Q12 19 16 13 Q18 10 24 4 Q30 10 32 13 Q37 19 29 23 L33 30 Z"/><path d="M24 6 A2 2 0 1 0 24 1 A2 2 0 0 0 24 6Z"/><path class="ink-detail" d="M25 10 L21 17 M19 23 Q24 22 29 23"/>',
  r: '<path d="M13 29 L16 15 L12 12 L12 5 L18 5 L18 9 L21 9 L21 5 L27 5 L27 9 L30 9 L30 5 L36 5 L36 12 L32 15 L35 29 Z"/><path class="ink-detail" d="M16 15 Q24 16 32 15 M24 20 L24 26"/>',
  q: '<path d="M14 30 L9 9 L18 16 L24 6 L30 16 L39 9 L34 30 Z"/><circle cx="9" cy="7" r="2"/><circle cx="24" cy="4" r="2"/><circle cx="39" cy="7" r="2"/><path class="ink-detail" d="M17 23 Q24 20 31 23 M15 27 L33 27"/>',
  k: '<path d="M16 30 L15 22 Q9 20 11 14 Q14 7 24 14 Q34 7 37 14 Q39 20 33 22 L32 30 Z"/><path class="ink-detail" d="M24 13 L24 2 M20 6 L28 6 M15 22 Q24 19 33 22 M16 26 Q24 23 32 26"/>',
}

function pieceArt(piece) {
  const side = piece.color === 'w' ? 'light' : 'dark'
  return `<svg class="ink-piece ink-piece--${side}" viewBox="0 0 48 42" aria-hidden="true">
    <g>${shapes[piece.type]}<path d="M13 29 Q24 30 35 29 L38 35 Q24 36 10 35 Z"/>
    <path class="ink-detail" d="M13 33 Q24 34 34 33"/></g>
    <path class="ink-shadow" d="M9 39 Q19 37 39 38 M14 40 L34 39"/>
  </svg>`
}

function moveTitle(game) {
  const turn = game.turn() === 'w' ? '白方' : '黑方'
  if (game.isCheckmate()) return `将死 · ${turn === '白方' ? '黑方' : '白方'}获胜`
  if (game.isStalemate()) return '逼和 · 平局'
  if (game.isDraw()) return '和棋'
  return game.isCheck() ? `${turn}被将军` : `轮到${turn}`
}

function computerMove(game) {
  const moves = game.moves({ verbose: true })
  return moves.reduce((best, move) => {
    const capture = move.captured ? 8 * pieceValues[move.captured] - pieceValues[move.piece] : 0
    const center = 4 - Math.abs(files.indexOf(move.to[0]) - 3.5) - Math.abs(Number(move.to[1]) - 4.5)
    const score = capture + center * .6 + (move.promotion ? pieceValues[move.promotion] : 0)
      + (move.san.includes('#') ? 100 : move.san.includes('+') ? 2 : 0) + Math.random()
    return score > best.score ? { move, score } : best
  }, { move: null, score: -Infinity }).move
}

export function mountChess(root, { sheet } = {}) {
  const game = new Chess()
  const woodland = Boolean(sheet)
  let savedMode = woodland ? 'computer' : 'local'
  if (woodland) {
    try {
      const saved = JSON.parse(localStorage.getItem(woodlandGameKey))
      if (typeof saved?.pgn === 'string') {
        game.loadPgn(saved.pgn)
        savedMode = saved.mode === 'local' ? 'local' : 'computer'
      }
    } catch {
      game.reset()
    }
  }
  let selection = ''
  let legalMoves = []
  let pendingComputer
  root.innerHTML = `
    <div class="ink-chess${woodland ? ' ink-chess--woodland' : ''}"${woodland ? ` style="--chess-study-sheet: url('${import.meta.env.BASE_URL}${sheet}')"` : ''}>
      <div class="ink-chess__game">
        <div class="ink-chess__board" role="group" aria-label="国际象棋棋盘">
          ${squares.map((square, index) => `<button type="button" class="ink-square${(Math.floor(index / 8) + index % 8) % 2 ? ' ink-square--shaded' : ''}"
            data-square="${square}" tabindex="${square === 'e2' ? 0 : -1}"></button>`).join('')}
        </div>
      </div>
      <aside class="ink-chess__notes">
        <div class="ink-chess__index" aria-hidden="true">${woodland ? 'WOODLAND POST OFFICE' : 'No. 02 / STUDY'}</div>
        <strong class="ink-chess__status" role="status"></strong>
        <label class="ink-chess__mode">对弈模式
          <select aria-label="对弈模式">
            <option value="local">本地双人</option>
            <option value="computer">挑战电脑</option>
          </select>
        </label>
        <div class="ink-chess__actions">
          <button type="button" data-action="undo">悔棋</button>
          <button type="button" data-action="reset">重开</button>
        </div>
        <div class="ink-chess__promotion" hidden>
          <label>升变为
            <select aria-label="升变棋子">
              <option value="q">后</option>
              <option value="r">车</option>
              <option value="b">象</option>
              <option value="n">马</option>
            </select>
          </label>
          <button type="button" data-action="promote">确认</button>
          <button type="button" data-action="cancel">取消</button>
        </div>
        <div class="ink-chess__record">
          <span>棋谱</span>
          <ol aria-label="棋谱"></ol>
        </div>
        <p>${woodland ? '点棋子，再点圆点落子或虚线圈吃子。也可用方向键和回车操作。' : '点棋子再点落点。也可用方向键在棋盘上移动焦点。'}</p>
      </aside>
    </div>`
  const board = root.querySelector('.ink-chess__board')
  const buttons = [...board.querySelectorAll('[data-square]')]
  const status = root.querySelector('.ink-chess__status')
  const mode = root.querySelector('.ink-chess__mode select')
  const promotion = root.querySelector('.ink-chess__promotion')
  const undo = root.querySelector('[data-action="undo"]')
  const record = root.querySelector('.ink-chess__record ol')
  const actions = root.querySelector('.ink-chess__notes')
  let promotionTarget = ''
  mode.value = savedMode

  function saveGame() {
    if (!woodland) return
    try {
      localStorage.setItem(woodlandGameKey, JSON.stringify({ pgn: game.pgn(), mode: mode.value }))
    } catch {
      // The board can still be played when local storage is unavailable.
    }
  }

  function render() {
    const history = game.history({ verbose: true })
    const last = history.at(-1)
    const checkedColor = game.isCheck() ? game.turn() : null
    status.textContent = pendingComputer ? '电脑思考中…' : moveTitle(game)
    undo.disabled = history.length === 0
    buttons.forEach((button, index) => {
      const square = squares[index]
      const piece = game.get(square)
      const label = piece ? `${piece.color === 'w' ? '白' : '黑'}${pieceNames[piece.type]}` : '空格'
      const target = legalMoves.find(move => move.to === square)
      const rankLabel = index % 8 === 0 ? `<span class="ink-square__rank">${square[1]}</span>` : ''
      const fileLabel = index >= 56 ? `<span class="ink-square__file">${square[0]}</span>` : ''
      button.setAttribute('aria-label', `${square} ${label}${target ? '，可走' : ''}`)
      button.setAttribute('aria-pressed', String(square === selection))
      button.classList.toggle('is-target', Boolean(target))
      button.classList.toggle('is-capture', Boolean(target?.captured))
      button.classList.toggle('is-last', last?.from === square || last?.to === square)
      button.classList.toggle('is-check', piece?.type === 'k' && piece.color === checkedColor)
      const art = piece ? (woodland ? renderWoodlandPiece(piece.type, piece.color) : pieceArt(piece)) : ''
      button.innerHTML = rankLabel + fileLabel + art
    })
    record.replaceChildren()
    for (let index = 0; index < history.length; index += 2) {
      const item = document.createElement('li')
      item.textContent = `${history[index].san} ${history[index + 1]?.san ?? ''}`
      record.append(item)
    }
    record.scrollTop = record.scrollHeight
  }

  function clearSelection() {
    selection = ''
    legalMoves = []
    promotionTarget = ''
    promotion.hidden = true
  }

  function scheduleComputer() {
    if (mode.value !== 'computer' || game.turn() !== 'b' || game.isGameOver()) return
    pendingComputer = window.setTimeout(() => {
      pendingComputer = undefined
      const next = computerMove(game)
      if (next) {
        game.move(next)
        saveGame()
      }
      render()
    }, 380)
  }

  function play(target, promoteTo) {
    game.move({ from: selection, to: target, promotion: promoteTo })
    saveGame()
    clearSelection()
    scheduleComputer()
    render()
  }

  function choose(square) {
    if (pendingComputer || game.isGameOver() || promotionTarget) return
    const match = legalMoves.find(move => move.to === square)
    if (match?.promotion) {
      promotionTarget = square
      promotion.hidden = false
      promotion.querySelector('select').focus()
      return
    }
    if (match) {
      play(square)
      return
    }
    if (selection !== square && game.get(square)?.color === game.turn()) {
      selection = square
      legalMoves = game.moves({ square, verbose: true })
    } else {
      clearSelection()
    }
    render()
  }

  function setFocus(button) {
    board.querySelector('[tabindex="0"]').tabIndex = -1
    button.tabIndex = 0
  }

  board.addEventListener('click', event => {
    const button = event.target.closest('[data-square]')
    if (!button) return
    setFocus(button)
    choose(button.dataset.square)
  })
  board.addEventListener('keydown', event => {
    const index = buttons.indexOf(event.target)
    const offset = { ArrowUp: -8, ArrowDown: 8, ArrowLeft: -1, ArrowRight: 1 }[event.key]
    if (index < 0 || !offset) return
    event.preventDefault()
    if (offset === -1 && index % 8 === 0 || offset === 1 && index % 8 === 7) return
    const target = buttons[index + offset]
    if (target) {
      setFocus(target)
      target.focus()
    }
  })
  actions.addEventListener('click', event => {
    const action = event.target.closest('[data-action]')?.dataset.action
    if (!action) return
    if (action === 'promote' && promotionTarget) {
      const target = promotionTarget
      play(target, promotion.querySelector('select').value)
      board.querySelector(`[data-square="${target}"]`).focus()
      return
    }
    if (action === 'cancel') {
      clearSelection()
      render()
      board.querySelector('[tabindex="0"]').focus()
      return
    }
    window.clearTimeout(pendingComputer)
    pendingComputer = undefined
    clearSelection()
    if (action === 'undo') {
      game.undo()
      if (mode.value === 'computer' && game.turn() === 'b') game.undo()
    } else if (action === 'reset') {
      game.reset()
    }
    saveGame()
    render()
  })
  mode.addEventListener('change', () => {
    window.clearTimeout(pendingComputer)
    pendingComputer = undefined
    clearSelection()
    saveGame()
    scheduleComputer()
    render()
  })
  scheduleComputer()
  render()

  return () => window.clearTimeout(pendingComputer)
}
