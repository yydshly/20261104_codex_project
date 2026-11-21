# 池塘声音模块 v3

文件：`pond-audio.js`。默认静音；首次主动开启之前，不创建 AudioContext，不获取声音文件，也不发出任何声音。

## 接口

```js
import { createPondAudio } from './pond-audio.js';
const audio = createPondAudio({ onState: ({ enabled, paused, ready, error }) => {} });
await audio.setEnabled(true); // 在用户点击回调中调用；失败会通知并抛出异常
audio.setOptions({ phase: 'night', volume: .28, wind: .4, ambience: 1, effects: 1 });
audio.trigger('duck', { x: .6, strength: .8 });
audio.trigger('splash', { x: .4, strength: .6 });
audio.trigger('feed', { x: .5, strength: .7 });
audio.trigger('wind', { x: .5, strength: .4 });
await audio.pause();  // 页面隐藏时静音、停止短音效并挂起上下文，保留开启意图
await audio.resume(); // 可见时恢复；若之前关闭则不会自行开启声音
await audio.setEnabled(false);
audio.dispose();
```

- `x` 是画面内归一化横坐标 0–1，映射到适度左右声像。
- `volume`、`wind`、`ambience`、`effects`、事件 `strength` 为 0–1。`effects: 0` 可单独关闭动作音效，`ambience: 0` 可单独关闭环境底声。
- `trigger()` 返回是否真正播放，关闭声音、暂停、音量为零、相同事件冷却中返回 `false`。
- `getState()` 返回 enabled、paused、ready、disposed 和当前混音参数。
- `onState` 的 enabled 表示用户的声音开启状态；paused 另外表示暂停。若启动失败，会变为 enabled false 并提供 error。
- 页面隐藏监听由场景控制器统一调用，不在模块内重复绑定。需要捕获 `resume()` 的拒绝，避免浏览器要求重新点击时产生未处理异常。

## 声音组合

环境底声使用已有真实溪水、池塘蛙虫录音，夜间降低水声、增加蛙虫声。每次切换做增益渐变。风声是过滤的程序噪声，按风强变化；它不是现场风声录音。

动作反馈分到独立效果总线：

| 事件 | 声音 | 冷却 |
| --- | --- | --- |
| duck | 真实鸭叫短录音，轻微速率变化 | 1.15 秒 |
| splash | 程序合成的短拍水声和下滑水滴音 | 0.11 秒 |
| feed | 三颗先后落水的小水滴 | 0.45 秒 |
| wind | 2.4 秒的柔和噪声阵风 | 1.6 秒 |

master 输出是用户音量的 0.65 倍，另有压缩器与并发声部上限。暂停、关闭、销毁立即归零 master 并停止短声部。开启过程使用序号检查，避免文件载入完成后恢复已经关闭的声音。

## 新录音来源与加工

真实鸭叫：**Duck Quack — gibarroule**，2016-10-26，德国 Kuhhorst 实录（源页描述为 shotgun microphone + H4N Zoom）。

- [Freesound 原始作品页](https://freesound.org/people/gibarroule/sounds/365133/)
- [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/)
- 下载的是该作品页公开列出的 [高码率 MP3 预览](https://cdn.freesound.org/previews/365/365133_6659813-hq.mp3)，不是需要登录的原始 96 kHz WAV。
- 本地下载保留：`https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/033-environment-emotion-lab/runtime/assets/audio/duck-quack-source.mp3`，解码为 48 kHz mono，6.4167 秒。
- 播放素材：`https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/033-environment-emotion-lab/runtime/assets/audio/duck-quack.wav`，截取源 0.25–0.84 秒，共 0.59 秒、48 kHz、mono、PCM 16-bit。峰值归一化至 0.72，并在两端加入 12 ms 淡入淡出。
- 播放素材 SHA-256：`131ea3f8da35856f71de99068103a9a9e0e0bd81b92de8ff8237569e8b54eb81`。
- 推荐网页署名：`鸭叫：gibarroule / Freesound，CC0；已裁切、调节音量及淡入淡出。` CC0 不强制署名，保留来源便于追溯。

原有两个环境底声的作者、CC0 / CC BY 3.0 许可及处理过程见 `audio-sources.json`。其中池塘蛙虫的网页署名继续保留。

## 验证

- `node --check pond-audio.js` 通过。
- 下载 MP3 已通过 libsndfile 解码，处理后的 WAV 已重新读取确认时长、采样率、峰值和文件哈希。
- 用内存模拟 AudioContext、AudioParam、节点和延迟 fetch 进行控制流程核验：未开启无 I/O/音频；载入中关闭后不会播放；开启后 3 层循环启动；4 类事件可触发；同类事件冷却；pause/resume；效果总线和总音量归零；dispose，均通过。
- 此记录没有宣称主观试听，也没有替代实际浏览器播放验收。主场景集成后仍应测试浏览器开启与动作同步。

## 技术依据

- [MDN AudioContext](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext)
- [MDN Using the Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API)
- [MDN createStereoPanner](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createStereoPanner)
