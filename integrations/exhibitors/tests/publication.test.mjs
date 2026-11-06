import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,mkdir,writeFile,cp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import worker,{hmac,equal,synchronize,commitCatalog,PublicationCoordinator,backend} from '../worker/index.mjs';
import {eligible,project,checkWebp,fromBase64,validateCatalog,website} from '../worker/domain.mjs';
import {fixtures,board,published,stopped,image} from './fixtures.mjs';

const env={TRELLO_BOARD_ID:board,TRELLO_PUBLIC_LIST_ID:published,TRELLO_APP_SECRET:'fictional-test-only',CALLBACK_URL:'https://example.invalid/trello',GITHUB_BRANCH:'staging/exhibitors-data',GITHUB_TOKEN:'fictional-test-only'};
function harness(rows) {
  const cards=new Map(rows.map(r=>[r.cardId,{idBoard:board,idList:published,closed:false}]));
  let output,commits=0,acks=0,fail=false,last;
  return {cards,run:()=>synchronize(env,{
    backend:async(_e,op)=>op==='snapshot'?{rows}:((acks++),{ok:true}),
    card:async(_e,id)=>cards.get(id),
    commit:async(_e,catalog,files)=>{if(fail)throw new Error('simulated GitHub 429');const next=JSON.stringify(catalog);if(next!==last)commits++;last=next;output={catalog,files};return {sha:'a'.repeat(40)};}
  }),get output(){return output;},get commits(){return commits;},get acks(){return acks;},set fail(v){fail=v;}};
}
test('three fictional vendors: approval, corrections, stop, withdrawal and replay',async()=>{
  const rows=await fixtures(),h=harness(rows);
  rows[1].review='未確認';rows[2].imageReview='NG';
  await h.run();assert.equal(h.output.catalog.exhibitors.length,1);
  rows[1].review='掲載承認';rows[2].imageReview='許可済み';
  await h.run();assert.equal(h.output.catalog.exhibitors.length,3);
  validateCatalog(h.output.catalog);
  const raw=JSON.stringify(h.output.catalog);
  for(const privateValue of ['private-contact','PRIVATE-CONSENT','PRIVATE-REVIEW','reviewedBy','cardId'])assert.ok(!raw.includes(privateValue));
  await h.run();assert.equal(h.commits,2,'replayed snapshot is unchanged');
  rows[0].description='修正後の紹介';rows[0].revision='e'.repeat(64);
  await h.run();assert.equal(h.output.catalog.exhibitors.length,2,'edited revision needs approval');
  rows[0].approvedRevision=rows[0].revision;await h.run();assert.ok(h.output.catalog.exhibitors.some(r=>r.description==='修正後の紹介'));
  h.cards.get(rows[1].cardId).idList=stopped;await h.run();assert.equal(h.output.catalog.exhibitors.length,2);
  assert.ok(!h.output.files.some(f=>f.path.includes('fiction-2')));
  rows[2].withdrawn=true;await h.run();assert.equal(h.output.catalog.exhibitors.length,1);
  h.cards.get(rows[0].cardId).closed=true;await h.run();assert.equal(h.output.catalog.exhibitors.length,0);assert.equal(h.output.files.length,0);
});
for(const [field,value] of Object.entries({confirmed:false,consent:'撤回',review:'未確認',imageReview:'NG',withdrawn:true,expiresAt:'2020-01-01',consentUntil:'2020-01-01',approvedRevision:'bad',reviewedBy:'',reviewedAt:'bad',minor:''})) {
  test(`gate rejects ${field}`,async()=>{const [row]=await fixtures();row[field]=value;assert.equal(eligible(row),false);});
}
test('minor requires every separate assent and owner approval',async()=>{
  const [r]=await fixtures();r.minor=true;assert.equal(eligible(r),false);r.childAssent=r.guardianConsent=r.ownerApproval=true;assert.equal(eligible(r),true);
  for(const field of ['childAssent','guardianConsent','ownerApproval']){r[field]=false;assert.equal(eligible(r),false);r[field]=true;}
});
test('forged approval cannot bypass actual current Trello board/list, closure or deletion',async()=>{
  for(const card of [null,{idBoard:stopped,idList:published},{idBoard:board,idList:stopped},{idBoard:board,idList:published,closed:true}]) {
    const rows=await fixtures(),h=harness(rows);h.cards.set(rows[0].cardId,card);h.cards.delete(rows[1].cardId);h.cards.delete(rows[2].cardId);await h.run();assert.equal(h.output.catalog.exhibitors.length,0);
  }
});
test('failure is retryable and never acknowledged as published',async()=>{
  const h=harness(await fixtures());h.fail=true;await assert.rejects(h.run());assert.equal(h.acks,0);h.fail=false;await h.run();assert.equal(h.acks,1);
});
test('duplicate IDs cannot overwrite another vendor',async()=>{const rows=await fixtures();rows[1].vendorId=rows[0].vendorId;await assert.rejects(harness(rows).run(),/duplicate-vendor/);});
test('tampered image hashes, SVG and metadata are rejected',async()=>{
  const [r]=await fixtures();r.images[0].sha256='f'.repeat(64);await assert.rejects(project(r),/image-hash/);
  assert.throws(()=>checkWebp(new TextEncoder().encode('<svg onload="alert(1)"/>')));
  const bytes=fromBase64(image),out=new Uint8Array(bytes.length+8);out.set(bytes);out.set(new TextEncoder().encode('EXIF'),bytes.length);new DataView(out.buffer).setUint32(4,out.length-8,true);
  assert.throws(()=>checkWebp(out),/metadata/);
});
test('URL and ID validation prevents script URLs and path traversal',async()=>{
  for(const u of ['javascript:alert(1)','http://example.invalid/','https://example.invalid/?email=private','https://u:p@example.invalid/'])assert.throws(()=>website(u));
  const [r]=await fixtures();r.vendorId='../escape';await assert.rejects(project(r));
});
test('contact details cannot hide inside public description',async()=>{
  for(const value of ['連絡先 private@example.invalid','電話 090-1234-5678','原本 https://drive.google.com/file/secret']){
    const [r]=await fixtures();r.description=value;await assert.rejects(project(r),/contact-in-public-text/);
  }
});
test('one invalid record does not block withdrawal of another vendor',async()=>{
  const rows=await fixtures(),h=harness(rows);await h.run();rows[0].description='private@example.invalid';rows[1].withdrawn=true;
  await h.run();assert.equal(h.output.catalog.exhibitors.length,1);assert.equal(h.output.catalog.exhibitors[0].vendor_id,'fiction-3');
});
async function webhook(body,signature=true,url=env.CALLBACK_URL) {
  let queued=0;
  const e={...env,PUBLICATION:{idFromName:()=>board,get:()=>({fetch:async()=>{queued++;return new Response('Queued',{status:202});}})}};
  const raw=JSON.stringify(body),sig=signature?await hmac(env.TRELLO_APP_SECRET,raw+env.CALLBACK_URL,'SHA-1'):'bad';
  const response=await worker.fetch(new Request(url,{method:'POST',body:raw,headers:{'X-Trello-Webhook':sig}}),e);
  return {response,queued};
}
const event={model:{id:board},action:{id:'1'.repeat(24),type:'updateCard',data:{board:{id:board},card:{id:'2'.repeat(24)},listAfter:{id:published}}}};
test('raw body + exact callback HMAC, board allowlist and HEAD handshake',async()=>{
  assert.equal((await worker.fetch(new Request(env.CALLBACK_URL,{method:'HEAD'}),env)).status,200);
  assert.equal((await webhook(event)).response.status,202);
  assert.equal((await webhook(event,false)).response.status,401);
  assert.equal((await webhook({...event,model:{id:stopped}})).queued,0);
  assert.equal((await webhook(event,true,env.CALLBACK_URL+'?unexpected=1')).queued,0);
  assert.equal(equal('a','a'),true);assert.equal(equal('a','ab'),false);
});
test('old notifications only cause fresh snapshot reconciliation, never old content',async()=>{
  const rows=await fixtures(),h=harness(rows);h.cards.get(rows[0].cardId).idList=stopped;
  const oldEvent=structuredClone(event);oldEvent.action.date='2020-01-01';assert.equal((await webhook(oldEvent)).response.status,202);
  await h.run();assert.ok(!h.output.catalog.exhibitors.some(r=>r.vendor_id==='fiction-1'));
});
class Storage {
  constructor(){this.data=new Map();this.alarmAt=null;}
  async get(key){return this.data.get(key);}
  async put(value){for(const [k,v]of Object.entries(value))this.data.set(k,v);}
  async setAlarm(value){this.alarmAt=value;}
}
test('durable queue deduplicates concurrent notifications without storing raw payloads',async()=>{
  const storage=new Storage(),d=new PublicationCoordinator({storage},env);
  const results=await Promise.all([1,2,3].map(()=>d.fetch(new Request('https://internal/enqueue',{method:'POST',body:JSON.stringify({id:'1'.repeat(24)})}))));
  assert.deepEqual(results.map(r=>r.status),[202,200,200]);assert.equal((await storage.get('seen')).length,1);assert.ok(storage.alarmAt);
  assert.ok(!JSON.stringify([...storage.data]).includes('private-contact'));
});
test('durable failure schedules persistent backoff',async()=>{
  const storage=new Storage(),d=new PublicationCoordinator({storage},env),original=globalThis.fetch;
  globalThis.fetch=async()=>{throw new Error('simulated outage');};
  try{await d.alarm();assert.equal(await storage.get('pending'),true);assert.equal(await storage.get('failures'),1);assert.ok(storage.alarmAt>Date.now());}finally{globalThis.fetch=original;}
});
test('backend rejects forged signed response and nonce mismatch',async()=>{
  const original=globalThis.fetch;
  try{
    globalThis.fetch=async()=>new Response(JSON.stringify({payload:'{}',signature:'forged'}));
    await assert.rejects(backend({...env,BACKEND_SECRET:'test',BACKEND_URL:'https://example.invalid/'},'snapshot'),/signature/);
    globalThis.fetch=async()=>{const payload=JSON.stringify({ok:true,nonce:'wrong'});return new Response(JSON.stringify({payload,signature:await hmac('test',payload)}));};
    await assert.rejects(backend({...env,BACKEND_SECRET:'test',BACKEND_URL:'https://example.invalid/'},'snapshot'),/rejected/);
  }finally{globalThis.fetch=original;}
});
test('GitHub atomic tree deletes stopped images; main disabled; 422 never force pushes',async()=>{
  const [r]=await fixtures(),item=await project(r),catalog={schema_version:1,source:'approved-private-registry',exhibitors:[item.record]};
  const calls=[];
  const api=async(_e,path,body)=>{
    calls.push({path,body});
    if(path.startsWith('git/ref/'))return {object:{sha:'a'.repeat(40)}};
    if(path.startsWith('git/commits/'))return {tree:{sha:'b'.repeat(40)}};
    if(path.startsWith('git/trees/'))return {tree:[{path:'assets/vendors/test-2027/removed/'+'f'.repeat(64)+'.webp',sha:'old'}]};
    return {sha:path==='git/blobs'?'c'.repeat(40):'d'.repeat(40)};
  };
  await assert.rejects(commitCatalog({...env,GITHUB_BRANCH:'main'},catalog,item.files,api),/production-disabled/);
  const original=globalThis.fetch;let patch;
  globalThis.fetch=async(_u,options)=>{patch=JSON.parse(options.body);return new Response('{}',{status:422});};
  try{await assert.rejects(commitCatalog(env,catalog,item.files,api),/422/);assert.equal(patch.force,false);const tree=calls.find(c=>c.path==='git/trees').body.tree;assert.equal(tree.filter(e=>e.sha===null).length,1);assert.ok(tree.some(e=>e.path==='data/exhibitors.json'));assert.ok(tree.some(e=>e.path===item.files[0].path));}finally{globalThis.fetch=original;}
});
test('three-record public build contains only allowlisted data and images; test data never modify checkout',async()=>{
  const rows=await fixtures(),h=harness(rows);await h.run();const root=resolve(import.meta.dirname,'../../..'),tmp=await mkdtemp(join(tmpdir(),'furima-test-'));
  try {
    for(const path of ['scripts','integrations','exhibitors','data','assets','ai-editor','photo'])await cp(join(root,path),join(tmp,path),{recursive:true});
    for(const path of ['index.html','CNAME'])await cp(join(root,path),join(tmp,path));
    await writeFile(join(tmp,'data/exhibitors.json'),JSON.stringify(h.output.catalog));
    for(const f of h.output.files){await mkdir(join(tmp,f.path,'..'),{recursive:true});await writeFile(join(tmp,f.path),f.bytes);}
    execFileSync('bash',['scripts/check-site-safety.sh'],{cwd:tmp,stdio:'pipe'});
    const catalog=await readFile(join(tmp,'_site/data/exhibitors.json'),'utf8');assert.ok(catalog.includes('架空・石敢當文庫'));assert.ok(!catalog.includes('private-contact'));
    await writeFile(join(tmp,'assets/vendors/private.txt'),'PRIVATE-CANARY');
    assert.throws(()=>execFileSync('node',['integrations/exhibitors/validate-public.mjs'],{cwd:tmp,stdio:'pipe'}));
    assert.equal(JSON.parse(await readFile(join(root,'data/exhibitors.json'),'utf8')).exhibitors.length,0);
  }finally{await rm(tmp,{recursive:true,force:true});}
});
