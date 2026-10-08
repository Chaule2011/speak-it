(function(root) {
  const RATE = 24000;
  const xml = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
  function parseScript(script, dialogue) {
    const out = []; let next = 1, current = 1;
    for (const line of script.split(/\r?\n/)) {
      let text = line.trim(); if (!text) continue;
      const label = text.match(/^Speaker\s*([12])\s*:\s*/i);
      if (label) { current = Number(label[1]); text = text.slice(label[0].length); }
      else current = dialogue ? next : 1;
      let spoken = false, end = 0;
      const re = /\(\s*pause\s+(\d+(?:\.\d+)?)\s*seconds?\s*\)/gi;
      const add = s => { if (s.trim()) { out.push({text:s.trim(), speaker:dialogue ? current : 1}); spoken = true; } };
      for (const match of text.matchAll(re)) {
        add(text.slice(end, match.index));
        const seconds = Number(match[1]);
        if (seconds > 120) throw new Error('Each pause can be at most 120 seconds.');
        out.push({pause:seconds}); end = match.index + match[0].length;
      }
      add(text.slice(end)); if (spoken && dialogue) next = current === 1 ? 2 : 1;
    }
    if (!out.some(p => p.text)) throw new Error('Add some spoken text to your script.');
    if (out.reduce((n,p) => n+(p.pause || 0),0) > 600) throw new Error('Total pauses can be at most 10 minutes.');
    return out;
  }
  function plan(parts, max = 2500) {
    const result=[]; let turns=[], length=0;
    const flush=()=> { if(turns.length) result.push({turns}); turns=[];length=0; };
    for (const part of parts) {
      if ('pause' in part) { flush(); result.push(part); continue; }
      let text = part.text;
      while (text.length) {
        let end = Math.min(max, text.length);
        if (end < text.length) { const space=text.lastIndexOf(' ',end); if(space > max/2) end=space; }
        const chunk=text.slice(0,end); text=text.slice(end).trimStart();
        if(length+chunk.length>max) flush();
        turns.push({...part,text:chunk}); length+=chunk.length;
      }
    }
    flush(); return result;
  }
  function ssml(turns, config) {
    const voice = turn => config.voices[turn.speaker-1];
    const body = turns.map(turn => {
      const v = voice(turn); if (!v) throw new Error('Select a voice for each speaker.');
      const rate = Math.round((config.speed-1)*100);
      let content=`<prosody rate="${rate >= 0 ? '+' : ''}${rate}%">${xml(turn.text)}</prosody>`;
      if(config.style !== 'default' && v.styles.includes(config.style)) {
        content=`<mstts:express-as style="${xml(config.style)}">${content}</mstts:express-as>`;
      }
      return `<voice name="${xml(v.id)}">${content}</voice>`;
    }).join('');
    return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${xml(config.voices[0].locale)}">${body}</speak>`;
  }
  function wav(samples, rate=RATE) {
    const buffer = new ArrayBuffer(44+samples.length*2), v=new DataView(buffer);
    const str=(off,s)=>{for(let i=0;i<s.length;i++)v.setUint8(off+i,s.charCodeAt(i));};
    str(0,'RIFF');v.setUint32(4,buffer.byteLength-8,true);str(8,'WAVE');str(12,'fmt ');
    v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,rate,true);v.setUint32(28,rate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,samples.length*2,true);
    for(let i=0;i<samples.length;i++)v.setInt16(44+i*2,samples[i],true);
    return buffer;
  }
  function concatenate(chunks) {
    const size=chunks.reduce((n,c)=>n+c.length,0); if(size>RATE*60*30) throw new Error('Keep each generated clip under 30 minutes.');
    const pcm=new Int16Array(size);let offset=0;for(const chunk of chunks){pcm.set(chunk,offset);offset+=chunk.length;}return pcm;
  }
  function mix(clips) {
    const end=Math.max(0,...clips.map(c=>c.start+c.pcm.length/RATE));
    if(end>1800) throw new Error('Keep the timeline under 30 minutes for WAV export.');
    const sum=new Float64Array(Math.ceil(end*RATE));
    for(const clip of clips){const start=Math.round(clip.start*RATE);for(let i=0;i<clip.pcm.length;i++)sum[start+i]+=clip.pcm[i];}
    return Int16Array.from(sum,s=>Math.max(-32768,Math.min(32767,s)));
  }
  const api={RATE,xml,parseScript,plan,ssml,wav,concatenate,mix};
  if(typeof module !== 'undefined')module.exports=api;else root.VoiceCore=api;
})(typeof window !== 'undefined' ? window : globalThis);
