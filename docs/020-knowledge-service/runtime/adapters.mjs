// 替换点：生产适配器应返回结构化结果；权限与写入校验仍由 engine.mjs 控制。
// 当前不会请求任何模型 API，也不把固定演示耗时当成真实模型指标。
export function selectModel(mode, route) {
  const deep = route === 'deep';
  return mode === 'single'
    ? { id: 'demo-main', label: 'Demo Main', effort: deep ? '深入配置' : '普通配置', simulated: true }
    : { id: deep ? 'demo-deep' : 'demo-fast', label: deep ? 'Demo Deep' : 'Demo Fast', effort: deep ? '深入配置' : '普通配置', simulated: true };
}

export function classifyIntent(text) {
  if (/人工|真人|投诉|客服经理/.test(text)) return 'human';
  if (/退款|退货/.test(text)) return 'refund';
  if (/催查.*(进度|工单|状态)|查.*催查|查询.*LC-|LC-[A-Z0-9]{8}/i.test(text)) return 'logistics_status';
  if (/超时|延迟|迟迟|没到|未到|催(?:一下)?物流|催一下|催查|过了.*送达|配送异常/.test(text)) return 'delay';
  if (/同步|故障|报错|打不开|错误|登录失败|异常|排查/.test(text)) return 'technical';
  if (/订单|物流|SF[- ]?\d{4}/i.test(text)) return 'order';
  return 'knowledge';
}
