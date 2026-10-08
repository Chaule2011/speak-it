const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const reply=(statusCode,body)=>({statusCode,headers:{...headers,'Content-Type':'text/plain; charset=utf-8'},body});
exports.handler=async event=>{
 if(event.httpMethod!=='POST')return reply(405,'Use POST.');
 const origin=event.headers.origin,host=event.headers.host;
 try{if(!origin||new URL(origin).host!==host)return reply(403,'Open Free Version from this website.');}catch{return reply(403,'Invalid origin.');}
 const key=process.env.AZURE_SPEECH_KEY,region=process.env.AZURE_SPEECH_REGION||'eastus';
 if(!key)return reply(503,'Free Version needs the Azure key configured on the hosting server.');
 if(!/^[a-z][a-z0-9]{1,39}$/.test(region))return reply(503,'Server region is invalid.');
 const route=event.path.split('/').pop();
 if(!['voices','speak'].includes(route))return reply(404,'Unknown speech endpoint.');
 const body=event.isBase64Encoded?Buffer.from(event.body||'','base64').toString('utf8'):event.body||'';
 if(body.length>60000)return reply(413,'Please split this script into shorter clips.');
 if(route==='speak'&&(!body.startsWith('<speak ')||!body.endsWith('</speak>')))return reply(400,'Invalid speech script.');
 try{
  const response=await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/${route==='voices'?'voices/list':'v1'}`,{method:route==='voices'?'GET':'POST',headers:{'Ocp-Apim-Subscription-Key':key,...(route==='speak'?{'Content-Type':'application/ssml+xml','X-Microsoft-OutputFormat':'raw-24khz-16bit-mono-pcm','User-Agent':'SpeakItFreeVersion'}:{})},...(route==='speak'?{body}:{}),signal:AbortSignal.timeout(25000)});
  if(!response.ok)return reply(response.status,({401:'Free Version has an Azure credential problem. Please contact the app owner.',403:'Azure Speech access is unavailable.',429:'The shared free Azure allowance or rate limit has been reached. Please try again later.',400:'Azure rejected this voice or script. Try Default style.'})[response.status]||'Azure is temporarily unavailable.');
  if(route==='voices'){const voices=(await response.json()).filter(v=>v.VoiceType==='Neural'&&v.Status==='GA'&&/^(en-|vi-)/i.test(v.Locale));return {statusCode:200,headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify(voices)};}
  return {statusCode:200,headers:{...headers,'Content-Type':'application/octet-stream'},body:Buffer.from(await response.arrayBuffer()).toString('base64'),isBase64Encoded:true};
 }catch{return reply(502,'Azure took too long or could not be reached. Try a shorter script.');}
};
