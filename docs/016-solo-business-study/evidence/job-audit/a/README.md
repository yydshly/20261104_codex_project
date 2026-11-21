# 企业供给审计 A 组

窗口：北京时间 2026-11-14 14:34 至 2026-11-21 14:34（UTC 06:34）。仅公开只读调研，无登录、无开发、无隐藏接口调用。

| 企业 | 当前公开岗位数 | 窗口内首次发布，全部职能 | 窗口内开发/基础设施远程 IC | 地域符合中国 | 待确认 | 地域排除 |
|---|---:|---:|---:|---:|---:|---:|
| GitLab | 246 | 38 | 3 | 0 | 0 | 3 |
| Canonical | 318 | 4 | 1 | 1 | 0 | 0 |
| Grafana Labs | 140 | 20 | 0 | 0 | 0 | 0 |
| Automattic | 6 | 未知 | 未知 | 未计 | 未计 | 未计 |
| Elastic | 未完成读取 | 未知 | 未知 | 未计 | 未计 | 未计 |

## 可投的近一周记录

- [Canonical — Graduate Software Engineer, Open Source and Linux, Canonical Ubuntu](https://job-boards.greenhouse.io/canonical/jobs/8379825)
- 来源日期：`first_published=2026-11-16T21:39:36+08:00`。
- 地域：官方地点为 `Home based - Worldwide`；正文明确 “Location: This is a Globally remote role.” 全文未见更窄的地域排除。
- 资格：面向首次大学学位于 2026 或 2027 年毕业的人；要求专业英文沟通，需能参加国际线下活动。
- 当前仍在官方列表，详情 HTTP 200；跨境签约/雇佣中国大陆居民的安排未向企业确认。

## 地域排除和重复

GitLab 的三个近周开发 IC 是 AI Catalog Backend Engineer（英国）、Senior CX Platform Engineer（加拿大）、Senior Staff SRE Hosted Runners（加/英/美），均有明确岗位所在地限制，不能凭公司的 all-remote 宣传归入中国可投。

这三条在窗口内没有相同 internal_job_id 的重复；但 CX Platform Engineer 的加拿大新发布记录 `8957066002` 与 10 月 8 日的美国旧记录 `8871406002` 共用 `internal_job_id=6552189002`。这是同一底层岗位的地区版本，不应误报成全新全球机会。

Grafana Labs 的窗口内 20 条包含 9 个工程管理岗位和 2 个售前 Field Engineer；按本轮排除纯管理/销售的范围，没有开发 IC 新岗位。

## 日期不足或获取受阻

Automattic 官方 jobs 页公开嵌入 6 条岗位数据，其中 Experienced Software Engineer、Senior Systems Engineer 两条技术岗当前存在，详情均 HTTP 200。两份详情及嵌入数据均未找到岗位发布日期，不能断言是近 7 日新增；保存为无日期存量候选，不计入近周数量。

Elastic 官方 careers 页链接到 `https://jobs.elastic.co/`，本次基本 HTTP 读取成功，但只返回动态应用壳，没有完整岗位记录。标为未完成，不能记 0。

## 获取难度

- GitLab、Canonical、Grafana：低—中。公开 Greenhouse Job Board API 一次读取完整现有列表，保留全量 JSON 与来源 first_published；正文地域核验和岗位分类仍需人工。
- Automattic：中。官方页面公开数据可解析，但日期缺失使近周统计受限。
- Elastic：本轮基本 HTTP 路线高。需要进一步在浏览器核对动态页面或取得官方数据接入；本轮未继续探测内部接口。

## 文件

- `company-summary.json`：企业汇总，未知以 null 表示。
- `reviewed-candidates.json` / `.csv`：4 条有日期近周开发岗与 2 条无日期存量技术岗。
- `*-all-recent.json`：三家完整的窗口内岗位元数据，便于复查职业分类。
- `*-raw.json`：公开 API 的原始研究快照。
- `*-careers.html` / `automattic-*-detail.html`：公开页面研究快照。

一手入口：[GitLab](https://about.gitlab.com/jobs/)、[Canonical](https://canonical.com/careers/all)、[Grafana](https://grafana.com/careers/)、[Automattic](https://automattic.com/work-with-us/jobs/)、[Elastic](https://www.elastic.co/careers)。
