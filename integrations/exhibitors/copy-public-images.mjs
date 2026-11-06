import {readFile,mkdir,copyFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
const root=resolve(import.meta.dirname,'../..');
const data=JSON.parse(await readFile(resolve(root,'data/exhibitors.json'),'utf8'));
for(const path of new Set(data.exhibitors.flatMap(r=>r.image_urls))) {
  const target=resolve(root,'_site',path.slice(1));await mkdir(dirname(target),{recursive:true});await copyFile(resolve(root,path.slice(1)),target);
}
