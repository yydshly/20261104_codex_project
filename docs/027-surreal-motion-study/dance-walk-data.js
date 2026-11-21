'use strict';
window.danceWalkPlan = {
  "date": "2026-11-13",
  "title": "走着走着，就跳起来了",
  "type": "原创音乐驱动的本地分层动画试作",
  "tempo": 100,
  "meter": "4/4",
  "beatSeconds": 0.6,
  "beats": 16,
  "durationSeconds": 9.6,
  "fps": 25,
  "characterIntent": "有点端着，又忍不住得意；持续向右前行。",
  "music": "本地原创合成鼓、低音、和弦与短旋律；第三小节留空/切分，第四小节加强。无现成电影音乐、无对白。",
  "nodes": [
    {
      "beat": 1,
      "timeSeconds": 0,
      "action": "左脚落重拍",
      "detail": "手贴胸，肩膀轻回弹"
    },
    {
      "beat": 2,
      "timeSeconds": 0.6,
      "action": "右脚接重拍",
      "detail": "头比肩略晚跟上"
    },
    {
      "beat": 3,
      "timeSeconds": 1.2,
      "action": "小交叉步",
      "detail": "衣摆拖后"
    },
    {
      "beat": 4,
      "timeSeconds": 1.8,
      "action": "落稳、换肩",
      "detail": "眼神向侧前方"
    },
    {
      "beat": 5,
      "timeSeconds": 2.4,
      "action": "脚尖轻点",
      "detail": "抬下巴"
    },
    {
      "beat": 6,
      "timeSeconds": 3,
      "action": "向前换重心",
      "detail": "掸一下衣领"
    },
    {
      "beat": 7,
      "timeSeconds": 3.6,
      "action": "交叉步接上",
      "detail": "肩膀吃切分"
    },
    {
      "beat": 8,
      "timeSeconds": 4.2,
      "action": "脚掌落稳",
      "detail": "收回胸前手"
    },
    {
      "beat": 9,
      "timeSeconds": 4.8,
      "action": "小步持续前移",
      "detail": "上身稳住半拍"
    },
    {
      "beat": 10,
      "timeSeconds": 5.4,
      "action": "继续向前换脚",
      "detail": "留空后甩肩"
    },
    {
      "beat": 11,
      "timeSeconds": 6,
      "action": "低踢接切分",
      "detail": "自由手轻摆"
    },
    {
      "beat": 12,
      "timeSeconds": 6.6,
      "action": "落地准备弹步",
      "detail": "重心下沉"
    },
    {
      "beat": 13,
      "timeSeconds": 7.2,
      "action": "小弹步落重拍",
      "detail": "衣摆随后甩回"
    },
    {
      "beat": 14,
      "timeSeconds": 7.8,
      "action": "交叉小弹步",
      "detail": "肩胯错开"
    },
    {
      "beat": 15,
      "timeSeconds": 8.4,
      "action": "向前接步",
      "detail": "手回胸前"
    },
    {
      "beat": 16,
      "timeSeconds": 9,
      "action": "正常步幅衔接",
      "detail": "保持前行，进入下一轮"
    }
  ],
  "limits": [
    "以八个AI静态姿态作本地插值，非生成式视频或动作捕捉。",
    "图层步态与脚底接地仍可能出现滑移；音乐与动作采用同一拍点时间轴。"
  ]
};
