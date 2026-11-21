import { useState } from 'react'
import { addEdge, Background, Controls, MarkerType, Position, ReactFlow, useEdgesState, useNodesState } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import './FlowEditor.css'

const MAX_NODES = 30
const MAX_LABEL = 44
const INITIAL_VIEW = { x: 0, y: 0, zoom: 1 }
const EDGE_OPTIONS = { type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed, width: 15, height: 15 } }

function makeNode(id, label, position) {
  return { id, position, data: { label }, sourcePosition: Position.Right, targetPosition: Position.Left }
}

function initialFlow(product) {
  const labels = product ? ['提交 Siena 样品', '材质复核', '批准打样'] : ['输入', '处理', '输出']
  const nodes = labels.map((label, index) => makeNode(String(index + 1), label, { x: 195 * index, y: index === 1 ? 100 : 32 }))
  const edges = nodes.slice(1).map((target, index) => ({ id: `start-${index}`, source: nodes[index].id, target: target.id }))
  return { nodes, edges }
}

function snapshot(nodes, edges, viewport) {
  return {
    version: 1,
    nodes: nodes.map(({ id, data, position }) => ({ id, label: data.label, x: position.x, y: position.y })),
    edges: edges.map(({ id, source, target }) => ({ id, source, target })),
    viewport: { x: viewport.x, y: viewport.y, zoom: viewport.zoom },
  }
}

function isPoint(value) {
  return value && Number.isFinite(value.x) && Math.abs(value.x) <= 100000
    && Number.isFinite(value.y) && Math.abs(value.y) <= 100000
}

function readSnapshot(key) {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return { value: null }
    const value = JSON.parse(raw)
    if (value?.version !== 1 || !Array.isArray(value.nodes) || value.nodes.length > MAX_NODES
      || !Array.isArray(value.edges) || value.edges.length > MAX_NODES * (MAX_NODES - 1)
      || !isPoint(value.viewport) || !Number.isFinite(value.viewport.zoom)
      || value.viewport.zoom < .2 || value.viewport.zoom > 2) throw new Error('invalid snapshot')

    const nodeIds = new Set()
    for (const node of value.nodes) {
      if (!isPoint(node) || typeof node.id !== 'string' || !node.id || nodeIds.has(node.id)
        || typeof node.label !== 'string' || !node.label.trim() || node.label.length > MAX_LABEL) throw new Error('invalid node')
      nodeIds.add(node.id)
    }
    const edgeIds = new Set()
    const pairs = new Set()
    for (const edge of value.edges) {
      if (!edge || typeof edge.id !== 'string' || !edge.id || edgeIds.has(edge.id)
        || !nodeIds.has(edge.source) || !nodeIds.has(edge.target) || edge.source === edge.target) throw new Error('invalid edge')
      const pair = JSON.stringify([edge.source, edge.target])
      if (pairs.has(pair)) throw new Error('duplicate edge')
      edgeIds.add(edge.id)
      pairs.add(pair)
    }
    return {
      value: {
        version: 1,
        nodes: value.nodes.map(({ id, label, x, y }) => ({ id, label, x, y })),
        edges: value.edges.map(({ id, source, target }) => ({ id, source, target })),
        viewport: { x: value.viewport.x, y: value.viewport.y, zoom: value.viewport.zoom },
      },
    }
  } catch {
    return { value: null, error: true }
  }
}

function FlowCanvas({ product }) {
  const key = `interaction-effects-lab.flow.${product ? 'siena' : 'example'}.v1`
  const [initial] = useState(() => initialFlow(product))
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges)
  const [instance, setInstance] = useState(null)
  const [viewport, setViewport] = useState(INITIAL_VIEW)
  const [saved, setSaved] = useState(() => readSnapshot(key).value)
  const [message, setMessage] = useState('')
  const [activeId, setActiveId] = useState(initial.nodes[0].id)
  const active = nodes.find(node => node.id === activeId) ?? nodes[0]
  const current = snapshot(nodes, edges, viewport)
  const matchesSaved = saved && JSON.stringify(current) === JSON.stringify(saved)

  function saveFlow() {
    try {
      const next = snapshot(nodes, edges, instance?.getViewport() ?? viewport)
      window.localStorage.setItem(key, JSON.stringify(next))
      setViewport(next.viewport)
      setSaved(next)
      setMessage('已将当前画布保存到本机。')
    } catch {
      setMessage('浏览器无法写入保存。当前画布仍可编辑。')
    }
  }

  function restoreFlow() {
    const { value, error } = readSnapshot(key)
    if (!value) {
      setMessage(error ? '无法读取有效的保存版本。' : '本机还没有保存版本。')
      return
    }
    setNodes(value.nodes.map(node => makeNode(node.id, node.label, { x: node.x, y: node.y })))
    setEdges(value.edges.map(({ id, source, target }) => ({ id, source, target })))
    setActiveId(value.nodes[0]?.id ?? '')
    setSaved(value)
    setViewport(value.viewport)
    instance?.setViewport(value.viewport)
    setMessage('已恢复保存的节点、连线和视图。')
  }

  function addNode() {
    if (nodes.length >= MAX_NODES) return
    const anchor = active?.position ?? { x: 0, y: 0 }
    const position = { x: anchor.x + 40 + (nodes.length % 3) * 30, y: anchor.y + 68 }
    const node = makeNode(crypto.randomUUID(), product ? '新增审核步骤' : '新节点', position)
    setNodes(previous => [...previous, node])
    setActiveId(node.id)
    setMessage('已添加节点。')
  }

  function renameNode(event) {
    event.preventDefault()
    const label = String(new FormData(event.currentTarget).get('label')).trim()
    if (!active || !label || label === active.data.label) return
    setNodes(previous => previous.map(node => node.id === active.id ? { ...node, data: { label } } : node))
    setMessage('节点名称已更新。')
  }

  function isValidConnection({ source, target }) {
    return !!source && !!target && source !== target
      && nodes.some(node => node.id === source) && nodes.some(node => node.id === target)
      && !edges.some(edge => edge.source === source && edge.target === target)
  }

  function connect(connection) {
    if (!isValidConnection(connection)) {
      setMessage('请选择两个不同的节点，并添加尚不存在的连线。')
      return
    }
    setEdges(previous => addEdge(connection, previous))
    setMessage('已连接节点。')
  }

  function connectFromForm(event) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    connect({ source: data.get('source'), target: data.get('target') })
  }

  return (
    <section className={`flow-editor${product ? ' flow-editor--product' : ''}`} aria-label={product ? 'Siena 样品审批流程' : '可编辑流程图'} data-node-count={nodes.length} data-edge-count={edges.length} data-saved-match={!!matchesSaved}>
      <header className="flow-editor__header">
        <div><span>{product ? '样品工作台 / SIENA' : 'REACT FLOW / 交互示例'}</span><h3>{product ? '样品审批流程' : '编辑流程与保存版本'}</h3></div>
        <div className="flow-editor__actions">
          <button type="button" onClick={addNode} disabled={nodes.length >= MAX_NODES}>添加节点</button>
          <button type="button" onClick={saveFlow} className="flow-editor__primary">保存流程</button>
          <button type="button" onClick={restoreFlow}>恢复流程</button>
        </div>
      </header>
      <div className="flow-editor__main">
        <div className="flow-editor__canvas" aria-label="流程画布">
          <ReactFlow
            nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
            onConnect={connect} isValidConnection={isValidConnection} onInit={setInstance}
            onNodeClick={(_, node) => setActiveId(node.id)} onMoveEnd={(_, view) => setViewport(view)}
            defaultEdgeOptions={EDGE_OPTIONS} fitView fitViewOptions={{ padding: .26, maxZoom: 1 }}
            minZoom={.2} maxZoom={2} zoomOnScroll={false} preventScrolling={false}
          >
            <Background gap={17} size={1.25} />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
        <aside className="flow-editor__panel" aria-label="编辑节点和连线">
          <label>编辑节点<select aria-label="编辑节点" value={active?.id ?? ''} disabled={!nodes.length} onChange={event => setActiveId(event.target.value)}>{nodes.map(node => <option key={node.id} value={node.id}>{node.data.label}</option>)}</select></label>
          {active && <form key={`${active.id}-${active.data.label}`} className="flow-editor__rename" onSubmit={renameNode}>
            <label>节点名称<input name="label" aria-label="节点名称" defaultValue={active.data.label} maxLength={MAX_LABEL} required /></label>
            <button type="submit">应用名称</button>
          </form>}
          <form className="flow-editor__link" onSubmit={connectFromForm}>
            <label>起始节点<select name="source" aria-label="起始节点" required defaultValue=""><option value="" disabled>选择起点</option>{nodes.map(node => <option key={node.id} value={node.id}>{node.data.label}</option>)}</select></label>
            <label>目标节点<select name="target" aria-label="目标节点" required defaultValue=""><option value="" disabled>选择终点</option>{nodes.map(node => <option key={node.id} value={node.id}>{node.data.label}</option>)}</select></label>
            <button type="submit" disabled={nodes.length < 2}>连接节点</button>
          </form>
        </aside>
      </div>
      <footer className="flow-editor__status">
        <span>{nodes.length} 节点 · {edges.length} 连线</span>
        <span className="flow-editor__state">{matchesSaved ? '当前画布已保存' : saved ? '当前画布有未保存改动' : '当前画布尚未保存'}</span>
        <span role="status">{message || '拖动节点，或从右侧连接两个步骤。'}</span>
      </footer>
    </section>
  )
}

export default function FlowEditor({ mode }) {
  return <FlowCanvas key={mode} product={mode === 'product'} />
}
