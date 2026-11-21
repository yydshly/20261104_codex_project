import { useId, useState } from 'react';
import { furnitureFinishes } from '../furniture.js';
import './Quote.css';

const studio = {
  eyebrow: 'TRY PROJECT ESTIMATION CALCULATOR', title: 'Get premium website within your budget',
  subtitle: '配置一个网页项目，比较三种合作方式的估价。',
  optionLabel: '服务类型', units: '页', quantityLabel: '网页数量', currency: 'USD', initialQuantity: 5,
  options: [
    { id: 'design', label: '设计', start: 399, each: 100 },
    { id: 'development', label: '开发', start: 199, each: 100 },
    { id: 'both', label: '设计 + 开发', start: 499, each: 200 },
  ],
  initialOption: 'both',
  extras: [{ id: 'content', label: '内容撰写', rate: 50 }, { id: 'seo', label: 'SEO 配置', rate: 50 }],
  delivery: [{ id: 'regular', label: '常规', rate: 0 }, { id: '14d', label: '14 天', rate: 25 }, { id: '7d', label: '7 天', rate: 100 }],
};

const furnitureQuote = {
  eyebrow: 'FORMA LIVING / CONFIGURATOR',
  optionLabel: '面料', units: '把', quantityLabel: '订购数量', currency: 'CNY', initialQuantity: 2,
  options: furnitureFinishes.map(({ id, name, color, surcharge }) => ({ id, label: name, color, surcharge })),
  extras: [{ id: 'assembly', label: '上门安装', rate: 80 }, { id: 'care', label: '养护套装', rate: 120 }],
  delivery: [{ id: 'regular', label: '标准配送', rate: 0 }, { id: 'timed', label: '指定时段', rate: 60 }, { id: 'express', label: '加急配送', rate: 150 }],
};

function formatMoney(amount, currency) {
  return new Intl.NumberFormat(currency === 'CNY' ? 'zh-CN' : 'en-US', {
    style: 'currency', currency, maximumFractionDigits: 0,
  }).format(amount);
}

function Options({ label, choices, value, onChange, describe }) {
  const group = useId();
  return (
    <fieldset className="quote-field">
      <legend>{label}</legend>
      <div className="quote-options">
        {choices.map((choice) => (
          <label key={choice.id}>
            <input type="radio" name={group} value={choice.id} checked={value === choice.id} onChange={() => onChange(choice.id)} />
            <span>
              {choice.color ? <span className="quote-finish-label"><i aria-hidden="true" style={{ backgroundColor: choice.color }} />{choice.label}</span> : choice.label}
              {describe && <small>{describe(choice)}</small>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function Quote({ mode, furniture }) {
  const product = mode === 'product';
  const config = product ? furnitureQuote : studio;
  const [option, setOption] = useState(studio.initialOption);
  const [quantity, setQuantity] = useState(config.initialQuantity);
  const [extras, setExtras] = useState([]);
  const [schedule, setSchedule] = useState('regular');
  const quantityId = useId();
  const delivery = config.delivery.find((item) => item.id === schedule);
  const money = (value) => formatMoney(value, config.currency);
  const selectedService = product ? null : studio.options.find((item) => item.id === option);
  const unitPrice = product ? furniture.chair.price + furniture.finish.surcharge : null;
  const base = product ? unitPrice * quantity : selectedService.start + (quantity - 1) * selectedService.each;
  const title = product ? `${furniture.chair.name} 座椅报价` : studio.title;
  const finishDescription = product ? `${furniture.chair.name} · ${furniture.finish.name}` : null;
  const lines = [
    { name: `${finishDescription ?? selectedService.label} × ${quantity}${config.units}`, amount: base },
    ...config.extras.filter((item) => extras.includes(item.id)).map((item) => ({ name: item.label, amount: item.rate * quantity })),
    { name: delivery.label, amount: delivery.rate * quantity },
  ];
  const total = lines.reduce((sum, item) => sum + item.amount, 0);
  const comparison = product ? [] : [
    { name: '机构', price: 8000 + (quantity - 1) * (option === 'both' ? 1000 : 400) },
    { name: '自由职业者', price: 3000 + (quantity - 1) * (option === 'both' ? 500 : 200) },
  ];

  function toggleExtra(id) {
    setExtras((active) => active.includes(id) ? active.filter((item) => item !== id) : [...active, id]);
  }

  return (
    <section className={`quote-demo ${product ? 'quote-product' : 'quote-original'}`} aria-label={product ? title : 'Price Calculator'} data-quote-total={total}>
      <div className="quote-body">
        <header className="quote-intro">
          <span>{config.eyebrow}</span>
          <h2>{title}</h2>
          <p>{product ? `当前面料 · ${furniture.finish.name}　单价 ${money(unitPrice)}/把` : studio.subtitle}</p>
        </header>

        <div className="quote-layout">
          <div className="quote-controls">
            <Options label={config.optionLabel} choices={config.options}
              value={product ? furniture.finish.id : option} onChange={product ? furniture.selectFinish : setOption}
              describe={product ? (item) => item.surcharge ? `+${money(item.surcharge)}/把` : '基础价' : undefined} />
            <div className="quote-field quote-quantity">
              <label htmlFor={quantityId}>{config.quantityLabel}</label>
              <output htmlFor={quantityId}>{quantity} {config.units}</output>
              <input id={quantityId} type="range" min="1" max="30" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
            </div>

            <fieldset className="quote-field">
              <legend>附加项目</legend>
              <div className="quote-extras">
                {config.extras.map((item) => (
                  <label key={item.id}>
                    <input type="checkbox" checked={extras.includes(item.id)} onChange={() => toggleExtra(item.id)} />
                    <span>{item.label}</span><small>+{money(item.rate)}/{config.units}</small>
                  </label>
                ))}
              </div>
            </fieldset>
            <Options label={product ? '配送方式' : '交付速度'} choices={config.delivery} value={schedule} onChange={setSchedule}
              describe={(item) => item.rate ? `+${money(item.rate)}/${config.units}` : '含在基础价内'} />
          </div>

          <aside className="quote-results" aria-label="估价结果">
            <div className="quote-total" role="status">
              <span>{product ? '预计总价' : '工作室估价'}</span>
              <strong>{money(total)}</strong>
            </div>
            {product ? (
              <dl className="quote-breakdown">
                {lines.map((item) => <div key={item.name}><dt>{item.name}</dt><dd>{money(item.amount)}</dd></div>)}
              </dl>
            ) : (
              <dl className="quote-breakdown quote-comparison" aria-label="合作方式对比">
                {comparison.map((item) => <div key={item.name}><dt>{item.name}</dt><dd>{money(item.price)}</dd></div>)}
              </dl>
            )}
            <p>示例费率 · 随选项即时更新</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
