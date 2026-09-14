// Generate static entry points so SPA deep links return HTTP 200 on GitHub Pages.
import {readFile,writeFile,mkdir,cp,rm,readdir} from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd();
const output=path.resolve(root,'_site');
if(path.dirname(output)!==root) throw new Error('Output must be inside the project');
const posts=JSON.parse(await readFile('content/posts.json','utf8'));
const {founders}=JSON.parse(await readFile('content/site.json','utf8'));
const themes=['environment','physical-ai','productivity','cognition'];
const slug = f => f.slug || f.name.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const routeEntries=[...themes.map(theme=>[theme,theme]),['about','About us'],...founders.map(f=>[`about/${slug(f)}`,f.name]),...posts.map(p=>[`posts/${p.slug}`,p.title])];
const routes=new Set();
for(const [route] of routeEntries) {
  if(!/^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/.test(route)) throw new Error(`Invalid route: ${route}`);
  if(routes.has(route)) throw new Error(`Duplicate route: ${route}`);
  routes.add(route);
}
for(const post of posts) {
  if(!themes.includes(post.area)) throw new Error(`Unknown theme for ${post.slug}`);
  if(!founders.some(f=>f.id===post.author)) throw new Error(`Unknown author for ${post.slug}`);
}
await rm(output,{recursive:true,force:true});
await mkdir(output,{recursive:true});
for(const entry of await readdir(root)) {
  if(entry.endsWith('.html') || ['script.js','effects.js','styles.css','.nojekyll'].includes(entry)) await cp(entry,path.join(output,entry));
}
for(const directory of ['assets','content','vendor']) await cp(directory,path.join(output,directory),{recursive:true});
const shell=await readFile('index.html','utf8');
const escape = text => text.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
for(const [route,title] of routeEntries) {
  const directory=path.join(output,route);
  await mkdir(directory,{recursive:true});
  await writeFile(path.join(directory,'index.html'),shell.replace(/<title>.*?<\/title>/,`<title>${escape(title)} — The AI Spectrum</title>`));
}
console.log(`Built ${routes.size+1} SPA entry points and a custom 404 page in _site.`);
