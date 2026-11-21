import { renderResearchGallery, renderResearchResults, renderResearchUnderstanding } from './research-notes.js';

const fields = [
  ['principle', '原理'],
  ['reuse', '可复用能力'],
  ['expansion', '扩展价值'],
];

const external = (href, label) =>
  `<a href="${href}" target="_blank" rel="noopener noreferrer">${label} <span aria-hidden="true">↗</span></a>`;
const label = text => `<span class="lab-overview-cell-label" aria-hidden="true">${text}</span>`;

export function renderExhibitOverview(exhibits) {
  const poster = `${import.meta.env.BASE_URL}six-research-projects.png`;
  return `
    <details class="lab-results-detail lab-overview-poster" id="guide-image" open>
      <summary>研究引导图 · 六个产品的效果、原理与扩展</summary>
      <figure class="lab-overview-figure">
      <a href="${poster}" target="_blank" rel="noopener noreferrer" aria-label="在新标签打开总览原图">
        <img src="${poster}" width="1920" height="1420" alt="六项研究总览图，配有山火、国际象棋、手写字体、电磁感应、冠脉投影和俳句动画的实际演示画面。原理、复用和扩展方向见下方对照表。">
      </a>
      <figcaption>沿用本轮已生成的研究引导图。点击图片查看高清原图，下方可直接打开六个演示。</figcaption>
      </figure>
    </details>
    ${renderResearchGallery(exhibits)}
    ${renderResearchUnderstanding()}
    ${renderResearchResults()}
    <h3 class="lab-overview-table-title">原理、价值与来源对照</h3>
    <table class="lab-overview-table" role="table" aria-labelledby="lab-exhibit-title" id="lab-overview-table" tabindex="-1">
      <thead role="rowgroup">
        <tr role="row">
          <th scope="col" role="columnheader">项目</th>
          ${fields.map(([, heading]) => `<th scope="col" role="columnheader">${heading}</th>`).join('')}
          <th scope="col" role="columnheader">原版与源码</th>
          <th scope="col" role="columnheader">本地演示</th>
        </tr>
      </thead>
      <tbody role="rowgroup">
        ${exhibits.filter(item => item.overview).map(item => {
          const { overview } = item;
          const video = item.source.type === 'video';
          const demo = item.play ? { route: `${item.id}/play`, title: item.play.title } : overview.demo;
          const community = exhibits.find(entry => entry.id === item.related?.id && entry.source.type === 'community');
          return `<tr role="row">
            <th scope="row" role="rowheader">
              <span class="lab-section-index">${item.number} / ${item.area}</span>
              <a class="lab-overview-project" href="#${item.id}">${overview.title ?? item.title}</a>
              <small class="lab-overview-code">${overview.productName}</small>
            </th>
            ${fields.map(([field, heading]) => `<td role="cell">${label(heading)}${overview[field]}</td>`).join('')}
            <td role="cell" class="lab-overview-links">
              ${label('原版与源码')}
              ${video ? external(item.original, '作者原片') : external(item.source.url, '原版在线体验')}
              ${overview.sourceLabel ? external(item.original, overview.sourceLabel) : ''}
              <small class="lab-overview-code">${overview.codeStatus}</small>
            </td>
            <td role="cell" class="lab-overview-links">
              ${label('本地演示')}
              <a class="lab-overview-demo" href="#${demo.route}">${demo.title} <span aria-hidden="true">→</span></a>
              ${community ? `
                <a href="#${community.id}">火迹 · 社区版 <span aria-hidden="true">→</span></a>
                ${external(community.original, '社区仓库')}
                <small class="lab-overview-code">源码公开 · 未见许可证</small>
              ` : ''}
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
}
