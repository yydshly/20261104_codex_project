import { useEffect, useRef, useState } from 'react';
import { init, use } from 'echarts/core';
import { ScatterChart } from 'echarts/charts';
import { BrushComponent, GridComponent, ToolboxComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import './ChartLink.css';

use([ScatterChart, BrushComponent, GridComponent, ToolboxComponent, TooltipComponent, CanvasRenderer]);

const groups = {
  original: ['A 组', 'B 组', 'C 组'],
  product: ['已确认', '待确认', '已关闭'],
};
const colors = ['#b3e28d', '#78ccdc', '#f0b187'];
const products = ['Siena 扶手椅', 'Riva 单椅', 'Milo 休闲椅', 'Alba 餐椅'];
const points = Array.from({ length: 36 }, (_, index) => {
  const days = 2 + (index * 7) % 25;
  const amount = 1800 + ((index * 13) % 32) * 450 + days * 280;
  return {
    id: `Q-${String(index + 1).padStart(3, '0')}`,
    product: products[index % products.length],
    days,
    amount,
    group: (index + Math.floor(index / 4)) % 3,
  };
});
const currency = new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 });

function buildOption(isProduct) {
  return {
    animation: false,
    grid: { left: 56, right: 18, top: 18, bottom: 47 },
    tooltip: {
      trigger: 'item',
      confine: true,
      formatter: ({ dataIndex }) => {
        const point = points[dataIndex];
        return isProduct
          ? `${point.id} · ${point.product}<br>${point.days} 天 · ${currency.format(point.amount)}`
          : `${groups.original[point.group]}<br>X ${point.days} · Y ${Math.round(point.amount / 250)}`;
      },
    },
    toolbox: { show: false, feature: { brush: { type: ['rect', 'clear'] } } },
    brush: {
      xAxisIndex: 0,
      yAxisIndex: 0,
      brushMode: 'single',
      transformable: false,
      brushStyle: { color: 'rgba(179,226,141,.14)', borderColor: '#b3e28d', borderWidth: 1 },
      outOfBrush: { colorAlpha: 0.22 },
    },
    xAxis: {
      min: 0,
      max: 30,
      name: isProduct ? '交付天数' : 'X 坐标',
      nameLocation: 'middle',
      nameGap: 28,
      nameTextStyle: { color: '#bdc9c1' },
      axisLabel: { color: '#aab8ad' },
      axisLine: { lineStyle: { color: '#4c5c52' } },
      splitLine: { show: true, lineStyle: { color: '#2e4138' } },
    },
    yAxis: {
      min: 0,
      max: isProduct ? 25000 : 100,
      axisLabel: { color: '#aab8ad', formatter: (value) => isProduct ? `¥${value / 1000}k` : value },
      splitLine: { lineStyle: { color: '#2e4138' } },
    },
    series: [{
      type: 'scatter',
      symbolSize: 11,
      data: points.map((point) => ({
        value: [point.days, isProduct ? point.amount : Math.round(point.amount / 250)],
        itemStyle: { color: colors[point.group] },
      })),
    }],
  };
}

export default function ChartLink({ mode }) {
  const isProduct = mode === 'product';
  const host = useRef(null);
  const chartRef = useRef(null);
  const [selection, setSelection] = useState(null);
  const [preset, setPreset] = useState('');
  const selected = selection === null ? points : selection.map((index) => points[index]);
  const counts = colors.map((_, group) => selected.filter((point) => point.group === group).length);
  const total = selected.reduce((sum, point) => sum + point.amount, 0);

  useEffect(() => {
    const chart = init(host.current);
    chartRef.current = chart;
    chart.setOption(buildOption(isProduct));
    chart.on('brushSelected', ({ batch: [brush] }) => {
      setSelection(brush.areas.length ? brush.selected[0].dataIndex : null);
    });
    chart.on('brushEnd', () => setPreset(''));
    chart.dispatchAction({ type: 'takeGlobalCursor', key: 'brush', brushOption: { brushType: 'rect', brushMode: 'single' } });
    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(host.current);
    return () => {
      observer.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, [isProduct]);

  function selectRange(id, from, to) {
    const areas = id ? [{ brushType: 'rect', xAxisIndex: 0, yAxisIndex: 0, coordRange: [[from, to], [0, isProduct ? 25000 : 100]] }] : [];
    chartRef.current?.dispatchAction({ type: 'brush', areas });
    setPreset(id);
  }

  return (
    <div className="brush-demo">
      <header className="brush-head">
        <div>
          <span className="brush-kicker">{isProduct ? 'FORMA LIVING / 运营看板' : 'ECHARTS / BRUSH'}</span>
          <h2>{isProduct ? '家具报价分析' : '散点框选与分组统计'}</h2>
        </div>
        <span className="brush-demo-data">示例数据</span>
      </header>
      <div className="brush-grid">
        <section className="brush-plot" aria-label="散点图与框选范围">
          <div className="brush-tools">
            <span>{isProduct ? '报价金额 × 交付天数' : '拖动图中区域进行框选'}</span>
            <div role="group" aria-label="框选范围预设">
              <button type="button" aria-pressed={preset === 'early'} onClick={() => selectRange('early', 0, 10)}>{isProduct ? '10 天以内' : 'X ≤ 10'}</button>
              <button type="button" aria-pressed={preset === 'late'} onClick={() => selectRange('late', 18, 30)}>{isProduct ? '18 天以上' : 'X ≥ 18'}</button>
              <button type="button" onClick={() => selectRange('')}>清除框选</button>
            </div>
          </div>
          <div className="brush-canvas" ref={host} role="img" aria-label="可拖动框选的散点图" />
          <p className="brush-caption">在图上拖出矩形，或使用上方范围按钮。</p>
        </section>
        <section className="brush-details" aria-label={isProduct ? '报价统计与明细' : '分组统计'}>
          <div className="brush-count" role="status">
            <span>{selection === null ? '全部记录' : '框选记录'}</span>
            <strong>{selected.length}<small> / {points.length}</small></strong>
          </div>
          {isProduct && <p className="brush-total">报价合计 <strong>{currency.format(total)}</strong></p>}
          <ul className="brush-bars">
            {counts.map((count, index) => (
              <li key={index}>
                <span>{groups[mode][index]}</span>
                <span className="brush-bar-track"><i style={{ width: `${selected.length ? 100 * count / selected.length : 0}%`, background: colors[index] }} /></span>
                <b>{count}</b>
              </li>
            ))}
          </ul>
          {isProduct && (
            <div className="brush-table" tabIndex={0} role="region" aria-label="报价明细">
              <table>
                <thead><tr><th>报价单</th><th>交付</th><th>金额</th></tr></thead>
                <tbody>
                  {selected.map((point) => (
                    <tr key={point.id}>
                      <td>{point.id}<small>{point.product}</small></td>
                      <td>{point.days} 天</td>
                      <td>{currency.format(point.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!selected.length && <p>当前选区无报价记录</p>}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
