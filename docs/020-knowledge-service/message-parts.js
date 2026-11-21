// 同一个渲染入口展示不同业务的待确认操作，不能把物流催查误画成退款。
export function renderAssistantMessage(message, state, { icon, escape, statusPill }) {
  const confirmation = message.confirmation;
  const pending = confirmation && state.session?.pendingAction?.id === confirmation.id && state.session.owner === 'bot';
  const sourceButtons = message.sources?.length ? `<div class="message-sources">${message.sources.map(source => `<button data-source="${escape(source.id)}">${icon('book')}${escape(source.title)} <span>${escape(source.version)}</span></button>`).join('')}</div>` : '';
  let actionCard = '';
  if (confirmation) {
    const logistics = confirmation.kind === 'logistics';
    const details = confirmation.details || [
      { label: '订单', value: confirmation.orderId },
      { label: '商品', value: confirmation.product },
      { label: '申请金额', value: `¥${Number(confirmation.amount).toFixed(2)}` }
    ];
    const title = confirmation.title || '确认创建退款申请';
    const notice = confirmation.notice || '确认表示商品完好，并同意创建待审核申请。';
    actionCard = `<div class="confirmation-card ${logistics ? 'logistics-confirmation' : ''}"><div>${icon('shield')}<strong>${pending ? escape(title) : '确认操作已结束'}</strong></div><dl>${details.map(detail => `<dt>${escape(detail.label)}</dt><dd>${escape(detail.value)}</dd>`).join('')}</dl><p>${pending ? escape(notice) : '操作已完成、取消或失效，不会重复执行。'}</p>${pending ? `<div class="confirmation-actions"><button class="primary-button" data-action="confirm" data-action-id="${escape(confirmation.id)}" ${state.busy ? 'disabled' : ''}>${escape(confirmation.submitLabel || '确认申请')}</button><button class="secondary-button" data-action="cancel" data-action-id="${escape(confirmation.id)}" ${state.busy ? 'disabled' : ''}>取消</button></div>` : ''}</div>`;
  }
  const ticket = message.logisticsTicket;
  const businessTicket = ticket ? `<div class="business-ticket"><div>${icon('box')}<strong>物流催查记录</strong><span>演示</span></div><dl><dt>工单</dt><dd>${escape(ticket.id)}</dd><dt>订单</dt><dd>${escape(ticket.orderId)}</dd><dt>状态</dt><dd>${escape(ticket.status)}</dd></dl><p>已创建记录，尚未通知真实承运商；不代表问题已解决。</p>${state.session?.owner === 'bot' ? `<button class="text-button" data-query-logistics="${escape(ticket.orderId)}" ${state.busy ? 'disabled' : ''}>查询这笔催查进度 ${icon('arrow')}</button>` : ''}</div>` : '';
  return `<article class="chat-message assistant"><div class="message-avatar">${icon(message.systemReceipt ? 'headphones' : 'sparkles')}</div><div class="message-body"><div class="message-name">${message.systemReceipt ? '系统回执' : 'Flow 助手'} ${statusPill(message.route, message.routeLabel)}${message.model ? `<small>${escape(message.model.label)}</small>` : ''}</div><div class="message-text">${escape(message.content)}</div>${sourceButtons}${actionCard}${businessTicket}</div></article>`;
}
