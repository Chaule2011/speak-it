const fs=require('node:fs');
const path=require('node:path');
for(const p of ['public/index.html','public/free/index.html','public/free/app.js','public/free/core.js','public/free/style.css','netlify/functions/azure.cjs'])if(!fs.existsSync(path.join(__dirname,p)))throw Error('Missing '+p);
console.log('Gemini app, Free Version, and Azure backend are ready.');
