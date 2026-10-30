import {assert, eligible, project, validateCatalog, toBase64, fromBase64} from './domain.mjs';

const enc = new TextEncoder();
export async function hmac(secret, value, algorithm = 'SHA-256') {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), {name:'HMAC',hash:algorithm}, false, ['sign']);
  return toBase64(new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(value))));
}
export function equal(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  let diff = a.length ^ b.length;
  for (let i=0; i<Math.max(a.length,b.length); i++) diff |= (a.charCodeAt(i)||0) ^ (b.charCodeAt(i)||0);
  return diff === 0;
}
async function bounded(response, max) {
  assert(response.ok, 'upstream-' + response.status);
  assert(Number(response.headers.get('content-length') || 0) <= max, 'upstream-too-large');
  const reader=response.body.getReader(); let length=0, chunks=[];
  for (;;) {const {done,value}=await reader.read(); if(done) break; length+=value.length; if(length>max){await reader.cancel();throw new Error('upstream-too-large');} chunks.push(value);}
  const bytes=new Uint8Array(length); let pos=0; for(const c of chunks){bytes.set(c,pos);pos+=c.length;}
  return new TextDecoder().decode(bytes);
}
export async function backend(env, operation, fields = {}) {
  const request = JSON.stringify({operation, timestamp:Date.now(), nonce:crypto.randomUUID(), ...fields});
  const response=await fetch(env.BACKEND_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({payload:request,signature:await hmac(env.BACKEND_SECRET,request)}),signal:AbortSignal.timeout(25000)});
  const envelope=JSON.parse(await bounded(response,24*1024*1024));
  assert(equal(envelope.signature,await hmac(env.BACKEND_SECRET,envelope.payload)), 'backend-signature');
  const result=JSON.parse(envelope.payload);
  assert(result.nonce === JSON.parse(request).nonce && result.ok === true, 'backend-rejected');
  return result;
}
export async function trelloCard(env, id) {
  assert(/^[a-f0-9]{24}$/.test(id),'invalid-card');
  // OAuth1 token/key in Authorization, never in loggable URLs.
  const auth=`OAuth oauth_consumer_key="${encodeURIComponent(env.TRELLO_KEY)}", oauth_token="${encodeURIComponent(env.TRELLO_TOKEN)}"`;
  const response=await fetch(`https://api.trello.com/1/cards/${id}?fields=idBoard,idList,closed`,{headers:{Authorization:auth},signal:AbortSignal.timeout(10000)});
  if(response.status===404) return null;
  return JSON.parse(await bounded(response,8192));
}
export async function github(env, path, body) {
  const response=await fetch(`https://api.github.com/repos/sady225/bungei-furima/${path}`,{
    method:body===undefined?'GET':'POST',headers:{Authorization:`Bearer ${env.GITHUB_TOKEN}`,'User-Agent':'furima-publication','Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'},
    body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
  return JSON.parse(await bounded(response,4*1024*1024));
}
export async function commitCatalog(env, catalog, files, api=github) {
  validateCatalog(catalog);
  const branch=env.GITHUB_BRANCH;
  assert(typeof branch==='string' && /^[a-zA-Z0-9/_-]+$/.test(branch),'invalid-branch');
  assert(branch!=='main' || env.PRODUCTION_ENABLED==='true','production-disabled');
  const ref=await api(env,`git/ref/heads/${branch}`);
  const head=await api(env,`git/commits/${ref.object.sha}`);
  const tree=await api(env,`git/trees/${head.tree.sha}?recursive=1`);
  assert(!tree.truncated,'github-tree-truncated');
  const old=new Map(tree.tree.map(x=>[x.path,x]));
  const desired=new Map(files.map(f=>[f.path,f.bytes]));
  desired.set('data/exhibitors.json',enc.encode(JSON.stringify(catalog,null,2)+'\n'));
  const entries=[];
  for(const [path,bytes] of desired) {
    assert(path==='data/exhibitors.json'||/^assets\/vendors\/[a-z0-9-]+\/[a-z0-9-]+\/[a-f0-9]{64}\.webp$/.test(path),'github-path');
    const blob=await api(env,'git/blobs',{content:toBase64(bytes),encoding:'base64'});
    if(old.get(path)?.sha!==blob.sha) entries.push({path,mode:'100644',type:'blob',sha:blob.sha});
  }
  for(const [path] of old) if(path.startsWith('assets/vendors/') && path.endsWith('.webp') && !desired.has(path)) entries.push({path,mode:'100644',type:'blob',sha:null});
  if(!entries.length) return {sha:ref.object.sha,changed:false};
  const nextTree=await api(env,'git/trees',{base_tree:head.tree.sha,tree:entries});
  const commit=await api(env,'git/commits',{message:'Sync approved exhibitor snapshot',tree:nextTree.sha,parents:[ref.object.sha]});
  // Non-force CAS: concurrent human edits cause 422, then the durable retry rebuilds from the new head.
  const response=await fetch(`https://api.github.com/repos/sady225/bungei-furima/git/refs/heads/${branch}`,{method:'PATCH',headers:{Authorization:`Bearer ${env.GITHUB_TOKEN}`,'User-Agent':'furima-publication','Content-Type':'application/json','X-GitHub-Api-Version':'2022-11-28'},body:JSON.stringify({sha:commit.sha,force:false}),signal:AbortSignal.timeout(15000)});
  await bounded(response,8192);
  return {sha:commit.sha,changed:true};
}
export async function synchronize(env, deps={}) {
  const source=deps.backend || backend, cardRead=deps.card || trelloCard, commit=deps.commit || commitCatalog;
  const snapshot=await source(env,'snapshot');
  assert(Array.isArray(snapshot.rows)&&snapshot.rows.length<=150,'invalid-snapshot');
  const records=[], files=[], seen=new Set();
  for(const row of snapshot.rows) {
    if(!eligible(row)) continue;
    const card=await cardRead(env,row.cardId);
    if(!card||card.closed||card.idBoard!==env.TRELLO_BOARD_ID||card.idList!==env.TRELLO_PUBLIC_LIST_ID) continue;
    let item;
    try {item=await project(row);} catch {console.error('publication-record-rejected');continue;}
    const key=item.record.event_id+'/'+item.record.vendor_id;
    assert(!seen.has(key),'duplicate-vendor');seen.add(key);records.push(item.record);files.push(...item.files);
  }
  records.sort((a,b)=>(a.event_id+'/'+a.vendor_id).localeCompare(b.event_id+'/'+b.vendor_id));
  // Stable snapshots make a replay or lost acknowledgement a no-op in Git.
  const catalog={schema_version:1,source:'approved-private-registry',exhibitors:records};
  const result=await commit(env,catalog,files);
  await source(env,'ack',{commit:result.sha,count:records.length});
  return result;
}

export default {
  async fetch(request,env) {
    if(new URL(request.url).pathname!=='/trello') return new Response('Not found',{status:404});
    if(request.method==='HEAD') return new Response(null,{status:200});
    if(request.method!=='POST') return new Response('Method not allowed',{status:405});
    try {
      assert(request.url===env.CALLBACK_URL,'callback-url');
      const raw=await bounded(new Response(request.body),128*1024);
      if(!equal(request.headers.get('X-Trello-Webhook'),await hmac(env.TRELLO_APP_SECRET,raw+env.CALLBACK_URL,'SHA-1'))) return new Response('Unauthorized',{status:401});
      const event=JSON.parse(raw), action=event.action;
      assert(event.model?.id===env.TRELLO_BOARD_ID && action?.data?.board?.id===env.TRELLO_BOARD_ID,'board');
      if(!['updateCard','deleteCard','moveCardFromBoard','moveCardToBoard'].includes(action.type)) return new Response('Ignored');
      assert(/^[a-f0-9]{24}$/.test(action.id)&&/^[a-f0-9]{24}$/.test(action.data.card?.id),'action');
      const object=env.PUBLICATION.get(env.PUBLICATION.idFromName(env.TRELLO_BOARD_ID));
      // Only the action ID crosses into durable storage; raw webhook/PII is discarded.
      return object.fetch('https://internal/enqueue',{method:'POST',body:JSON.stringify({id:action.id})});
    } catch { return new Response('Rejected',{status:400}); }
  }
};

export class PublicationCoordinator {
  constructor(ctx,env) {this.ctx=ctx;this.env=env;this.tail=Promise.resolve();}
  serial(fn) {const p=this.tail.then(fn);this.tail=p.catch(()=>{});return p;}
  fetch(request) {return this.serial(async()=>{
    const {id}=await request.json(), s=this.ctx.storage;
    const seen=await s.get('seen')||[];
    if(seen.includes(id)) return new Response('Duplicate');
    // Persist wakeup before acknowledging so process termination cannot drop work.
    await s.setAlarm(Date.now()+1000);
    await s.put({pending:true,seen:[...seen.slice(-511),id]});
    return new Response('Queued',{status:202});
  });}
  alarm() {return this.serial(async()=>{
    const s=this.ctx.storage;
    try {
      await synchronize(this.env);
      await s.put({pending:false,failures:0,lastSuccess:Date.now()});
      // Also re-evaluate expiry/consent and lost webhooks hourly, without polling all Trello cards every minute.
      await s.setAlarm(Date.now()+3600000);
    } catch {
      const failures=(await s.get('failures')||0)+1;
      await s.put({pending:true,failures,lastFailure:Date.now()});
      await s.setAlarm(Date.now()+Math.min(3600000,30000*2**Math.min(failures,7)));
      // No raw payloads, names, secrets or upstream exception text in logs.
      console.error('publication-sync-failed');
    }
  });}
}
