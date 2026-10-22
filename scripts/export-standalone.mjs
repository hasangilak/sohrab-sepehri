import { readFile, readdir, writeFile } from 'node:fs/promises';
import { extname } from 'node:path';

const mime={'.webp':'image/webp','.ttf':'font/ttf','.woff2':'font/woff2','.svg':'image/svg+xml','.txt':'text/plain;charset=utf-8'};
const data=async path=>`data:${mime[extname(path)]};base64,${(await readFile(`dist/${path}`)).toString('base64')}`;
const sources={};
for(const name of await readdir('dist/assets/paintings')) {
  if(name.endsWith('.webp'))sources[name.replace('.webp','')]=await data(`assets/paintings/${name}`);
}
let css=await readFile('dist/style.css','utf8')+'\n'+await readFile('dist/motion.css','utf8');
for(const path of new Set([...css.matchAll(/url\(['"]?(assets\/[^'"\)]+)/g)].map(match=>match[1])))css=css.replaceAll(path,await data(path));
const poem=(await readFile('dist/poem.js','utf8')).replace('export const','const');
const brush=(await readFile('dist/brush.js','utf8')).replace('export class','class');
const world=(await readFile('dist/landscape.js','utf8')).replace(/^import .+;\n/gm,'').replace('export class','class').replace('`assets/paintings/${name}.webp`','PAINTING_SOURCES[name]');
const app=(await readFile('dist/app.js','utf8')).replace(/^import .+;\n/gm,'').replace('"assets/paintings/unified-world.webp"','PAINTING_SOURCES["unified-world"]');
let html=await readFile('dist/index.html','utf8');
html=html.replace(/  <link rel="stylesheet"[^\n]+\n/g,'').replace('</head>',`<style>${css}</style>\n</head>`);
for(const path of new Set([...html.matchAll(/(?:href|src)="(assets\/[^"\n]+|translation\.txt|persian\.txt)"/g)].map(match=>match[1])))html=html.replaceAll(`"${path}"`,`"${await data(path)}"`);
const js=`const PAINTING_SOURCES=${JSON.stringify(sources)};\n${poem}\n${brush}\n${world}\n${app}`;
html=html.replace('<script type="module" src="app.js"></script>',`<script type="module">${js.replace(/<\/script/gi,'<\\/script')}</script>`);
await writeFile('sepehri.html',html);
console.log(`Exported sepehri.html (${(Buffer.byteLength(html)/1024/1024).toFixed(1)} MB), with all artwork, fonts, and translations embedded.`);
