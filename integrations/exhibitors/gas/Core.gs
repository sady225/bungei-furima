// Phase A creates NEW private resources only; it does not open the form or install triggers.
function setupDraft() {
  if(!props_().getProperty('SPREADSHEET_ID')) props_().setProperty('SPREADSHEET_ID',SpreadsheetApp.create('沖縄文芸フリマ 出店者掲載管理【接続試験・非公開】').getId());
  var b=book_();
  Object.keys(HEADERS_).forEach(function(name){var sh=b.getSheetByName(name);if(!sh){sh=b.insertSheet(name);sh.appendRow(HEADERS_[name]);sh.setFrozenRows(1);sh.getRange(1,1,1,HEADERS_[name].length).setFontWeight('bold').setBackground('#e8eee5');}});
  if(!props_().getProperty('FORM_ID')) {
    if(!/^\d{4}-\d{2}-\d{2}$/.test(required_('PUBLICATION_END')))throw new Error('掲載終了日をYYYY-MM-DDで設定');
    var form=FormApp.create('沖縄文芸フリマ 出店者紹介【接続試験・受付停止中】',false);
    props_().setProperty('FORM_ID',form.getId());form.setAcceptingResponses(false);
    form.setDescription('出店の確定と掲載承認は別です。連絡先・同意記録・画像原本は非公開で保管します。ログインが難しい場合は運営窓口への代替提出が可能です。');
    form.setDestination(FormApp.DestinationType.SPREADSHEET,b.getId());
    var ids={};
    QUESTIONS_.forEach(function(title){
      var item;
      if(title==='掲載同意') item=form.addCheckboxItem().setChoiceValues([CONSENT_+' [掲載期限 '+required_('PUBLICATION_END')+']']).setRequired(true);
      else if(['未成年区分','本人意思','保護者同意'].indexOf(title)>=0) item=form.addMultipleChoiceItem().setChoiceValues(title==='未成年区分'?['成人','未成年']:['確認済み','未確認・該当なし']).setRequired(true);
      else if(title==='紹介文') item=form.addParagraphTextItem().setRequired(true).setValidation(FormApp.createParagraphTextValidation().requireTextLengthLessThanOrEqualTo(400).build());
      else item=form.addTextItem().setRequired(['作品名','公開SNS・サイトURL'].indexOf(title)<0);
      item.setTitle(title);ids[title]=String(item.getId());
    });
    props_().setProperty('QUESTION_IDS',JSON.stringify(ids));
  }
  // No invitation, sharing change, webhook or publishing in this operation.
  return {spreadsheet:book_().getUrl(),formEdit:FormApp.openById(required_('FORM_ID')).getEditUrl()};
}
function setupPrivateBoard() {
  if(props_().getProperty('TRELLO_BOARD_ID')) return;
  var board=trello_('boards','post',{name:'沖縄文芸フリマ 出店者掲載管理【試験】',defaultLists:false,prefs_permissionLevel:'private'});
  props_().setProperty('TRELLO_BOARD_ID',board.id);
  setupBoardLists();
}
function setupBoardLists() {
  var boardId=required_('TRELLO_BOARD_ID'),current=trello_('boards/'+boardId+'/lists');
  LISTS_.forEach(function(name){var found=current.filter(function(l){return l.name===name;});if(found.length>1)throw new Error('重複リスト');var list=found[0]||trello_('lists','post',{name:name,idBoard:boardId,pos:'bottom'});props_().setProperty('LIST_'+name,list.id);});
}
function registerWebhook() {
  var url=required_('CALLBACK_URL'),board=required_('TRELLO_BOARD_ID');
  var hooks=trello_('tokens/'+encodeURIComponent(required_('TRELLO_TOKEN'))+'/webhooks');
  if(!hooks.some(function(h){return h.callbackURL===url&&h.idModel===board;})) trello_('webhooks','post',{callbackURL:url,idModel:board,description:'承認済み掲載同期'});
}
function receiveResponse_(response) {
  var lock=LockService.getScriptLock();lock.waitLock(30000);
  try {
    var responseId=response.getId(),id='s-'+hash_(responseId).slice(0,32);
    var existing=rows_('form_responses').filter(function(r){return r.response_id===responseId;})[0];
    if(existing && rows_('vendor_registry').some(function(r){return r.submission_id===id;}) && rows_('publication_reviews').some(function(r){return r.submission_id===id;}) && rows_('public_export').some(function(r){return r.submission_id===id;})){ensureCard_(id);return id;}
    var answers={},byId={};response.getItemResponses().forEach(function(r){byId[String(r.getItem().getId())]=r.getResponse();});
    var ids=JSON.parse(required_('QUESTION_IDS'));Object.keys(ids).forEach(function(title){answers[title]=byId[ids[title]]||'';});
    var consentText=JSON.stringify(answers['掲載同意']),end=consentText.match(/掲載期限 (\d{4}-\d{2}-\d{2})/);
    answers.consentUntil=end?end[1]+'T23:59:59+09:00':'';
    answers['画像原本ID']=byId[required_('UPLOAD_ITEM_ID')]||[];
    // JSON stays a single plain string, never spreadsheet formulas. Raw response edits do not mutate approvals.
    if(!existing)append_('form_responses',{submission_id:id,response_id:responseId,submitted_at:new Date().toISOString(),answers_json:JSON.stringify(answers)});
    if(!rows_('vendor_registry').some(function(r){return r.submission_id===id;}))append_('vendor_registry',{submission_id:id,event_id:answers['開催回ID'],vendor_id:Utilities.getUuid().toLowerCase(),confirmed:false,contact_email:answers['連絡用メール']});
    if(!rows_('publication_reviews').some(function(r){return r.submission_id===id;}))append_('publication_reviews',{submission_id:id,review_state:'未確認',consent_state:'未確認',image_review:'未確認',minor:answers['未成年区分']==='未成年',child_assent:false,guardian_consent:false,owner_approval:false,withdrawn:false,approved_images_json:'[]',card_state:'未作成'});
    if(!rows_('public_export').some(function(r){return r.submission_id===id;}))append_('public_export',{submission_id:id,name:answers['公開用屋号・ペンネーム'],category:answers['ジャンル'],description:answers['紹介文'],work_title:answers['作品名'],website_url:answers['公開SNS・サイトURL']});
    ensureCard_(id);audit_(id,'intake','ok');return id;
  } finally {lock.releaseLock();}
}
function ensureCard_(id) {
  var r=rows_('publication_reviews').filter(function(r){return r.submission_id===id;})[0];
  if(r.card_id)return;
  // Search the private board first: a lost POST acknowledgement must not create a second card.
  var cards=trello_('boards/'+required_('TRELLO_BOARD_ID')+'/cards?fields=name,desc');
  var marker='submission:'+id,found=cards.filter(function(c){return c.desc===marker;});
  if(found.length>1)throw new Error('重複カード要確認');
  var card=found[0]||trello_('cards','post',{name:'掲載申請 '+id,idList:required_('LIST_受付'),desc:marker});
  update_('publication_reviews',id,{card_id:card.id,card_state:'作成済み'});
}
function joined_() {
  var regs=rows_('vendor_registry'),exports=rows_('public_export'),raw=rows_('form_responses');
  return rows_('publication_reviews').map(function(r){
    var regsForId=regs.filter(function(x){return x.submission_id===r.submission_id;}),exForId=exports.filter(function(x){return x.submission_id===r.submission_id;});
    if(regsForId.length!==1||exForId.length!==1)throw new Error('正本の重複・欠落');
    var v=regsForId[0],p=exForId[0],original=raw.filter(function(x){return x.submission_id===r.submission_id;});
    if(original.length!==1)throw new Error('同意原典の欠落・重複');
    var consentUntil=JSON.parse(original[0].answers_json).consentUntil||'';
    var row={consentUntil:consentUntil,eventId:String(v.event_id),vendorId:String(v.vendor_id),cardId:String(r.card_id),confirmed:v.confirmed===true,consent:r.consent_state,review:r.review_state,imageReview:r.image_review,minor:r.minor,childAssent:r.child_assent===true,guardianConsent:r.guardian_consent===true,ownerApproval:r.owner_approval===true,withdrawn:r.withdrawn===true,expiresAt:r.expires_at instanceof Date?r.expires_at.toISOString():String(r.expires_at),name:String(p.name),category:String(p.category),description:String(p.description),workTitle:String(p.work_title),websiteUrl:String(p.website_url),boothNumber:String(p.booth_number),images:JSON.parse(r.approved_images_json||'[]')};
    // Bind approval to every public field, consent/expiry condition and private derivative file/hash manifest.
    row.revision=hash_(JSON.stringify(row));row.approvedRevision=r.approved_revision;row.reviewedBy=String(r.reviewed_by);row.reviewedAt=r.reviewed_at instanceof Date?r.reviewed_at.toISOString():String(r.reviewed_at);
    row.submissionId=r.submission_id;return row;
  });
}
function approveSubmission(id) {
  var actor=Session.getActiveUser().getEmail(),allowed=required_('REVIEWER_EMAILS').split(',').map(function(x){return x.trim();});
  if(!actor||allowed.indexOf(actor)<0)throw new Error('承認者権限なし');
  var row=joined_().filter(function(r){return r.submissionId===id;})[0];
  if(!row||!row.confirmed||row.consent!=='許可済み'||row.review!=='掲載承認'||row.imageReview!=='許可済み'||row.withdrawn||!Number.isFinite(Date.parse(row.consentUntil))||!Number.isFinite(Date.parse(row.expiresAt))||Date.parse(row.expiresAt)<=Date.now()||Date.parse(row.expiresAt)>Date.parse(row.consentUntil)||!row.images.length||row.images.length>3)throw new Error('承認条件不足');
  if(row.minor!==false && !(row.minor===true&&row.childAssent&&row.guardianConsent&&row.ownerApproval))throw new Error('未成年確認不足');
  update_('publication_reviews',id,{approved_revision:row.revision,reviewed_by:actor,reviewed_at:new Date().toISOString()});audit_(id,'approve','ok',row.revision);
}
function snapshot_() {
  var rows=joined_().filter(function(r){return r.approvedRevision===r.revision&&r.confirmed&&r.consent==='許可済み'&&r.review==='掲載承認'&&r.imageReview==='許可済み'&&!r.withdrawn&&Date.parse(r.expiresAt)>Date.now()&&Date.parse(r.expiresAt)<=Date.parse(r.consentUntil);});
  var total=0,validRows=[];
  rows.forEach(function(row){
    try {
    row.images=row.images.map(function(img){
      if(!/^[a-f0-9]{64}$/.test(img.sha256)||typeof img.fileId!=='string')throw new Error('画像台帳不正');
      var file=DriveApp.getFileById(img.fileId), parents=file.getParents(),inApproved=false;
      while(parents.hasNext())if(parents.next().getId()===required_('APPROVED_FOLDER_ID'))inApproved=true;
      if(!inApproved||file.getSize()>1024*1024)throw new Error('画像保管場所・サイズ不正');
      var bytes=file.getBlob().getBytes();total+=bytes.length;if(total>16*1024*1024)throw new Error('試験規模上限');
      if(hash_(bytes)!==img.sha256)throw new Error('承認後画像変更');
      return {sha256:img.sha256,base64:Utilities.base64Encode(bytes)};
    });
    delete row.submissionId;validRows.push(row);
    } catch(_) {audit_(row.submissionId,'image-validation','rejected');}
  });return validRows;
}
function doPost(e) {
  var nonce='';
  try {
    if(!e.postData||e.postData.contents.length>8192)throw new Error('invalid');
    var envelope=JSON.parse(e.postData.contents);
    if(!secureEqual_(envelope.signature,sign_(envelope.payload)))throw new Error('unauthorized');
    var request=JSON.parse(envelope.payload);nonce=request.nonce;
    if(typeof nonce!=='string'||!/^[a-f0-9-]{36}$/.test(nonce)||Math.abs(Date.now()-request.timestamp)>300000)throw new Error('expired');
    var lock=LockService.getScriptLock();lock.waitLock(30000);
    try {
      var cache=CacheService.getScriptCache();if(cache.get(nonce))throw new Error('replay');cache.put(nonce,'1',600);
      if(request.operation==='snapshot')return reply_({ok:true,nonce:nonce,rows:snapshot_()});
      if(request.operation==='ack'&&/^[a-f0-9]{40}$/.test(request.commit)&&Number.isInteger(request.count)) {audit_('','publish','git-committed',request.commit);return reply_({ok:true,nonce:nonce});}
      throw new Error('operation');
    }finally{lock.releaseLock();}
  } catch(_) {return reply_({ok:false,nonce:nonce});}
}
function reply_(value) {var payload=JSON.stringify(value);return ContentService.createTextOutput(JSON.stringify({payload:payload,signature:sign_(payload)})).setMimeType(ContentService.MimeType.JSON);}
