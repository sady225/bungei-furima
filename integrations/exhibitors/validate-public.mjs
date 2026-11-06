import {readFile,readdir,lstat} from 'node:fs/promises';
import {resolve} from 'node:path';
import {validateCatalog,checkWebp,sha256,assert} from './worker/domain.mjs';
const root=resolve(import.meta.dirname,'../..');
const data=JSON.parse(await readFile(resolve(root,'data/exhibitors.json'),'utf8'));
assert(Object.keys(data).sort().join(',')==='exhibitors,schema_version,source'&&data.source==='approved-private-registry','invalid-catalog-envelope');
validateCatalog(data);
const referenced=new Set(data.exhibitors.flatMap(r=>r.image_urls.map(p=>p.slice(1))));
for(const path of referenced) {
  const bytes=await readFile(resolve(root,path));checkWebp(bytes);
  assert(path.endsWith('/'+await sha256(bytes)+'.webp'),'image-hash-mismatch');
}
async function walk(dir) {
  for(const name of await readdir(resolve(root,dir))){const path=dir+'/'+name;if(path==='assets/vendors/.gitkeep')continue;const s=await lstat(resolve(root,path));assert(!s.isSymbolicLink(),'no-symlinks');if(s.isDirectory())await walk(path);else assert(referenced.has(path),'orphan-or-private-image');}
}
await walk('assets/vendors');
console.log(`Public catalog validated: ${data.exhibitors.length} records, ${referenced.size} images`);
