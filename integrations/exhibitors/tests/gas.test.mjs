import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {createHash,createHmac} from 'node:crypto';
async function runtime(){
  const properties=new Map([['UPLOAD_ITEM_ID','12'],['REVIEWER_EMAILS','reviewer@example.invalid'],['BACKEND_SECRET','test-only'],['TRELLO_BOARD_ID','a'.repeat(24)],['LIST_受付','b'.repeat(24)]]);
  const questions=['開催回ID','公開用屋号・ペンネーム','ジャンル','紹介文','作品名','公開SNS・サイトURL','連絡用メール','掲載同意','未成年区分','本人意思','保護者同意'];
  properties.set('QUESTION_IDS',JSON.stringify(Object.fromEntries(questions.map((q,i)=>[q,String(i+1)]))));
  const data={},cards=[],cache=new Map();let actor='reviewer@example.invalid',failTable='';
  const ctx=vm.createContext({Date,console,Utilities:{getUuid:()=>`fiction-${cards.length+1}`,DigestAlgorithm:{SHA_256:'sha256'},Charset:{UTF_8:'utf-8'},computeDigest:(_a,v)=>[...createHash('sha256').update(typeof v==='string'?v:Buffer.from(v)).digest()],computeHmacSha256Signature:(v,key)=>[...createHmac('sha256',key).update(v).digest()],base64Encode:b=>Buffer.from(b).toString('base64')},PropertiesService:{getScriptProperties:()=>({getProperty:k=>properties.get(k),setProperty:(k,v)=>properties.set(k,v)})},Session:{getActiveUser:()=>({getEmail:()=>actor})},LockService:{getScriptLock:()=>({waitLock:()=>{},releaseLock:()=>{}})},CacheService:{getScriptCache:()=>({get:k=>cache.get(k),put:(k,v)=>cache.set(k,v)})},ContentService:{MimeType:{JSON:'json'},createTextOutput:text=>({text,setMimeType(){return this;}})}});
  for(const file of ['Config.gs','Core.gs','Triggers.gs'])vm.runInContext(await readFile(new URL('../gas/'+file,import.meta.url),'utf8'),ctx,{filename:file});
  Object.keys(ctx.HEADERS_).forEach(name=>data[name]=[]);
  ctx.rows_=name=>structuredClone(data[name]);
  ctx.append_=(name,row)=>{if(failTable===name){failTable='';throw new Error('simulated partial intake');}data[name].push(structuredClone(row));};
  ctx.update_=(name,id,changes)=>Object.assign(data[name].find(r=>r.submission_id===id),changes);
  ctx.trello_=(path,_method,body)=>{if(path.includes('/cards?'))return cards;if(path==='cards'){const c={id:String(cards.length+1).repeat(24),...body};cards.push(c);return c;}throw new Error('unexpected API');};
  const response=(i)=>({getId:()=>`fictional-response-${i}`,getItemResponses:()=>['test-2027',`架空テスト出店者${i}`,'詩・絵本','動作確認用の文章です','架空作品','https://example.invalid/','private@example.invalid',['同意 [掲載期限 2099-01-01]'],'成人','確認済み','未確認・該当なし',['private-drive-file']].map((v,j)=>({getItem:()=>({getId:()=>j+1}),getResponse:()=>v}))});
  return {ctx,data,cards,response,setActor:v=>actor=v,setFail:v=>failTable=v};
}
test('actual GAS form handler accepts 3 fictional submissions; duplicate retry creates no duplicate cards or rows',async()=>{
  const r=await runtime();for(let i=1;i<=3;i++)r.ctx.onExhibitorFormSubmit({response:r.response(i)});
  r.ctx.onExhibitorFormSubmit({response:r.response(1)});
  for(const name of ['form_responses','vendor_registry','publication_reviews','public_export'])assert.equal(r.data[name].length,3);
  assert.equal(r.cards.length,3);assert.ok(r.data.form_responses[0].answers_json.includes('private@example.invalid'));
  assert.ok(!JSON.stringify(r.cards).includes('private@example.invalid'));assert.ok(!JSON.stringify(r.cards).includes('private-drive-file'));
  assert.ok(r.data.publication_reviews.every(x=>x.review_state==='未確認'));
});
test('GAS resumes partially written intake without losing a submission',async()=>{
  const r=await runtime();r.setFail('public_export');assert.throws(()=>r.ctx.receiveResponse_(r.response(1)));
  r.ctx.receiveResponse_(r.response(1));assert.equal(r.data.form_responses.length,1);assert.equal(r.data.public_export.length,1);assert.equal(r.cards.length,1);
});
test('GAS approval checks reviewer identity and binds approval to text, image manifest, expiry and consent',async()=>{
  const r=await runtime(),id=r.ctx.receiveResponse_(r.response(1)),review=r.data.publication_reviews[0],registry=r.data.vendor_registry[0];
  assert.throws(()=>r.ctx.approveSubmission(id),/条件/);
  registry.confirmed=true;Object.assign(review,{consent_state:'許可済み',review_state:'掲載承認',image_review:'許可済み',expires_at:'2099-01-01',approved_images_json:JSON.stringify([{fileId:'private-file',sha256:'a'.repeat(64)}])});
  r.setActor('outsider@example.invalid');assert.throws(()=>r.ctx.approveSubmission(id),/権限/);
  r.setActor('reviewer@example.invalid');r.ctx.approveSubmission(id);
  let row=r.ctx.joined_()[0];assert.equal(row.revision,row.approvedRevision);
  r.data.public_export[0].description='変更後';row=r.ctx.joined_()[0];assert.notEqual(row.revision,row.approvedRevision);
  r.ctx.approveSubmission(id);review.consent_state='撤回';row=r.ctx.joined_()[0];assert.notEqual(row.revision,row.approvedRevision);
});
test('GAS rejects invalid signatures, expired timestamps and replayed nonces',async()=>{
  const r=await runtime(),nonce='12345678-1234-1234-1234-123456789012';
  const request=(timestamp=Date.now(),signature)=>{const payload=JSON.stringify({operation:'ack',timestamp,nonce,commit:'a'.repeat(40),count:0});return {postData:{contents:JSON.stringify({payload,signature:signature||r.ctx.sign_(payload)})}};};
  const parse=e=>JSON.parse(JSON.parse(r.ctx.doPost(e).text).payload);
  assert.equal(parse(request(Date.now(),'forged')).ok,false);
  assert.equal(parse(request(Date.now()-400000)).ok,false);
  assert.equal(parse(request()).ok,true);assert.equal(parse(request()).ok,false);
});
test('formula-like input is stored as text',async()=>{const r=await runtime();assert.equal(r.ctx.cell_('=IMPORTXML("https://example.invalid")'),'\'=IMPORTXML("https://example.invalid")');});
