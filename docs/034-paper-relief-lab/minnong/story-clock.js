/* All visual state is derived from the actual audio clock. No parallel playback timers. */
(function(root){
 // Media clocks round seeks to microseconds; tolerate that rounding at chapter boundaries.
 const chapterAt=(chapters,time)=>Math.max(0,chapters.findLastIndex(c=>time+.0001>=c.start));
 function gifTime(chapter,time,duration){const a=chapter.actionAnchors;if(time<=a[0].time)return 0;for(let i=1;i<a.length;i++)if(time<a[i].time){const before=a[i-1],after=a[i],p=(time-before.time)/(after.time-before.time);return Math.min(duration,(before.gifTime+(after.gifTime-before.gifTime)*p)*1000);}const end=a.at(-1);return Math.min(duration,end.gifTime*1000+Math.max(0,time-end.time)*1000);}
 const cueAt=(cues,time)=>{const i=cues.findLastIndex(c=>time>=c.start);return i>=0&&time<=cues[i].end+.35?i:-1;};
 root.StoryClock={chapterAt,gifTime,cueAt};
})(window);
