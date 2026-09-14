// Static local preview with the same missing-page fallback as GitHub Pages.
import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('_site');
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.md':'text/plain; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2'};
http.createServer(async(req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    let file=path.resolve(root,'.'+pathname);
    if(file!==root && !file.startsWith(root+path.sep)) {res.writeHead(403).end();return;}
    let status=200;
    try {if((await stat(file)).isDirectory()) file=path.join(file,'index.html');await stat(file);}
    catch {file=path.join(root,'404.html');status=404;}
    const body=await readFile(file);
    res.writeHead(status,{'Content-Type':types[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-store'});
    res.end(body);
  } catch {res.writeHead(400).end('Bad request');}
}).listen(8000,'127.0.0.1',()=>console.log('Preview: http://127.0.0.1:8000 (run node tools/build.mjs after edits)'));
