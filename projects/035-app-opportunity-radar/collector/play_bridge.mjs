import gplay from 'google-play-scraper';
const [mode,country,argument] = process.argv.slice(2);
if (!['us','jp','gb'].includes(country)) throw new Error('Unsupported Google Play market');
const options = {country,lang:'en',requestOptions:{timeout:25000}};
if(mode==='chart') {
  const collection = argument==='top-free'?gplay.collection.TOP_FREE:argument==='top-paid'?gplay.collection.TOP_PAID:null;
  if(!collection)throw new Error('Unsupported chart');
  console.log(JSON.stringify({results:await gplay.list({...options,collection,num:100,fullDetail:false})}));
} else if(mode==='reviews') {
  const {appId,lang,num}=JSON.parse(argument);
  if(!/^[A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)+$/.test(appId)||!['en','ja','zh'].includes(lang)||!Number.isInteger(num)||num<1||num>200)throw new Error('Invalid review options');
  const response=await gplay.reviews({...options,lang,appId,num,sort:gplay.sort.NEWEST});
  console.log(JSON.stringify({results:response.data,sort:'newest',language:lang}));
} else if(mode==='details') {
  const results=[],errors=[];
  const queue=JSON.parse(argument);
  async function worker(){while(queue.length){const appId=queue.shift();
    try {results.push(await gplay.app({...options,appId}));}
    catch(e){errors.push({appId,error:String(e.message).slice(0,300)});}
    await new Promise(r=>setTimeout(r,700));
  }}
  await Promise.all([worker(),worker()]);
  console.log(JSON.stringify({results,errors}));
} else throw new Error('Unsupported mode');
