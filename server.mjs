import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
const root = resolve('dist');
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.ttf':'font/ttf','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'};
const server = http.createServer(async (req,res) => {
  try {
    const path = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file = resolve(root,'.'+(path==='/'?'/index.html':path));
    if(!file.startsWith(root+'/')) {res.writeHead(403).end();return;}
    const body=await readFile(file);
    res.writeHead(200,{'content-type':mime[extname(file)]||'application/octet-stream','cache-control':'no-cache'}).end(body);
  } catch {res.writeHead(404).end('Not found');}
});
server.listen(Number(process.env.PORT || 4173),'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${server.address().port}`));
