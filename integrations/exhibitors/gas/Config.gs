/* Secrets and private IDs live only in Script Properties. */
var HEADERS_ = {
  form_responses: ['submission_id','response_id','submitted_at','answers_json'],
  vendor_registry: ['submission_id','event_id','vendor_id','confirmed','contact_email'],
  publication_reviews: ['submission_id','card_id','review_state','consent_state','image_review','minor','child_assent','guardian_consent','owner_approval','withdrawn','expires_at','approved_images_json','approved_revision','reviewed_by','reviewed_at','card_state'],
  public_export: ['submission_id','name','category','description','work_title','website_url','booth_number'],
  audit_log: ['timestamp','submission_id','operation','result','revision_or_commit']
};
var LISTS_ = ['受付','内容確認中','修正依頼','掲載承認','公開','公開停止','取下げ'];
var QUESTIONS_ = ['開催回ID','公開用屋号・ペンネーム','ジャンル','紹介文','作品名','公開SNS・サイトURL','連絡用メール','掲載同意','未成年区分','本人意思','保護者同意'];
var CONSENT_ = 'furima.ryukyu-tane.comでの出店者紹介と作品紹介のため、運営確認済みの紹介文・画像を指定掲載期間中に公開することに同意します。画像の権利を確認済みです。撤回は運営窓口へ連絡します。公開停止後もGit履歴・CDN・第三者の保存に残る可能性があることを理解しました。';
function props_() {return PropertiesService.getScriptProperties();}
function required_(key) {var value=props_().getProperty(key);if(!value) throw new Error('設定不足: '+key);return value;}
function book_() {return SpreadsheetApp.openById(required_('SPREADSHEET_ID'));}
function rows_(name) {
  var values=book_().getSheetByName(name).getDataRange().getValues(), headers=values.shift();
  return values.filter(function(r){return r[0];}).map(function(r){var o={};headers.forEach(function(k,i){o[k]=r[i];});return o;});
}
function append_(name,row) {book_().getSheetByName(name).appendRow(HEADERS_[name].map(function(k){return cell_(row[k]===undefined?'':row[k]);}));}
function cell_(value) {return typeof value==='string' && /^[=+@\-\t\r]/.test(value) ? "'"+value : value;}
function update_(name,id,changes) {
  var sh=book_().getSheetByName(name), values=sh.getDataRange().getValues();
  for(var i=1;i<values.length;i++) if(values[i][0]===id) {Object.keys(changes).forEach(function(k){var c=HEADERS_[name].indexOf(k);if(c<0) throw new Error('unknown column');sh.getRange(i+1,c+1).setValue(cell_(changes[k]));});return;}
  throw new Error('row not found');
}
function audit_(id,operation,result,revision) {append_('audit_log',{timestamp:new Date().toISOString(),submission_id:id,operation:operation,result:result,revision_or_commit:revision||''});}
function hash_(value) {return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,value).map(function(b){return ('0'+((b+256)%256).toString(16)).slice(-2);}).join('');}
function sign_(value) {return Utilities.base64Encode(Utilities.computeHmacSha256Signature(value,required_('BACKEND_SECRET'),Utilities.Charset.UTF_8));}
function secureEqual_(a,b) {if(typeof a!=='string'||typeof b!=='string')return false;var diff=a.length^b.length;for(var i=0;i<Math.max(a.length,b.length);i++)diff|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return diff===0;}
function trello_(path,method,payload) {
  var result=UrlFetchApp.fetch('https://api.trello.com/1/'+path,{method:method||'get',headers:{Authorization:'OAuth oauth_consumer_key="'+encodeURIComponent(required_('TRELLO_KEY'))+'", oauth_token="'+encodeURIComponent(required_('TRELLO_TOKEN'))+'"'},contentType:'application/json',payload:payload?JSON.stringify(payload):undefined,muteHttpExceptions:true});
  if(result.getResponseCode()<200||result.getResponseCode()>=300) throw new Error('Trello API error '+result.getResponseCode());
  return JSON.parse(result.getContentText());
}
