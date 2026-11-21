# 池塘水面 v5：浅岸、风区与小型水禽接触

本轮仅修改 `pond-water-3d.js`，升级前完整源文件保存在 `docs/pond-water-v4-source.js`。水域仍为 X 半径 5.5、Z 半径 3.8 的椭圆，基础水位为世界 Y `.08`。

## 针对 v4 截图的修改

- 移除 `.16` 的固定镜面底值，回到接近水的 Fresnel 视角反射：近法向约 2.5%，低角度才明显增强。真实鸭子、植被和窗光仍来自实时镜面相机。
- 细波在缓慢移动的风区内出现，近岸和背风区更平静；降低高频波幅与速度，避免整片水持续闪碎点。反射的五次邻近采样依据风区局部调整柔化范围。
- 取消波纹的附加自发光以及规则乘积正弦“焦散”。点击、弓波和尾流通过表面法线改变现有光的倒影，不直接画亮白线。
- 浅水使用到椭圆岸边的近似世界距离，不再只使用等宽径向渐变。低频沉积变化控制水底斜率，采用分色指数吸收表达浅岸和较深的绿水，边缘只有窄而低对比的接触变化。
- 默认尾流尺寸对应约 `.75 × .3` 米的鸭子：从身体后部开始，V 形更窄、短波更细、衰减更快。每段保留当时的航向和体形尺寸；只有当前游动个体生成前缘弓波。

## 新接口及接入位置

```js
duck.update(dt, { motion, wind });
const d = duck.getState();
water.setSwimmer({
  x: d.x,
  z: d.z,
  heading: d.heading, // 沿世界 X/Z 平面，+X 为 0 弧度
  speed: d.speed,    // 世界单位/秒
  length: .75,      // 实际模型总长，默认 .75
  width: .3,        // 身体宽度，默认 .3
});
```

- 每帧在鸭子更新后、渲染前调用。位置是**躯干中心**，应与模型的水面投影中心一致；模型原点若不在这里，应加模型偏移后再传入。
- 躯干接触轮廓按总长的 78% 和宽度的 96% 构造。接触线和轻微接触阴影在静止时仍存在，弓波随速度降低而消失。
- `water.setSwimmer(null)` 关闭这一层；它默认关闭，因此不接入时不会在原点留下假接触线。
- `setSwimmer` 和 `wake` 均拒绝越界或非法数值。`setSwimmer` 不自动发尾流，原有事件中的 `water.wake(d.x,d.z,d.heading,d.speed)` 保留即可。
- 历史尾流会记录发出时的尺寸，后续修改体形不会让已经产生的尾流变形。
- `sampleHeight` 只返回连续长波水位，不把个体自己的接触凹线反馈给其浮动高度，避免跟随产生自激。鸭子是否浸入水面仍由模型的原点和浸水深度控制。

原有 `mesh / update / ripple / wake / sampleHeight / resizeQuality / dispose` 全部保留。`update` 继续用积分时钟处理风速，暂停时连续波冻结，短涟漪及尾流照常消退。

## 成本与界限

- 保留 5,511 顶点、10,800 三角面、512² 实时反射，仍是每帧一次镜面场景渲染；未增加 draw call 或屏幕级 pass。
- 固定 8 个涟漪槽与 8 个尾流槽；新增 8 个 `vec2` 尺寸和两个 `vec4` 个体 uniform，没有逐帧纹理上传。
- 反射仍使用五次纹理采样；新增风区、沉积和个体接触计算在现有水面 fragment shader 内完成。
- 浅岸是近似水底吸收着色，未引入场景折射或真实水底网格。接触层通过法线和少量遮蔽表达毫米级水线，并非流体求解；不替代正确的岸线几何、湿石材质或模型浸水位置。

## 核验

- `node --check pond-water-3d.js` 和原 `node scripts/verify-runtime.mjs` 通过。
- 另外核验个体开启/关闭、无效输入不改变有效状态、定向尾流保留原尺寸、暂停时效果过期以及重复释放。
- 实际 GPU 编译和新岸边机位下的昼夜视觉由主场景统一核验；Node 检查不代表视觉验收。

结构参考：[NVIDIA GPU Gems 的几何长波与像素细波分离方法](https://developer.nvidia.com/gpugems/gpugems/part-i-natural-effects/chapter-1-effective-water-simulation-physical-models)，实时反射沿用本地 [Three.js Water](https://github.com/mrdoob/three.js/blob/master/examples/jsm/objects/Water.js)。
