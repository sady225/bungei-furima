function onExhibitorFormSubmit(e) {if(!e||!e.response)throw new Error('Form trigger required');receiveResponse_(e.response);}
// Run only after the new form's manual upload field and all private permissions are verified.
function installIntakeTrigger() {
  var form=FormApp.openById(required_('FORM_ID')),upload=form.getItemById(Number(required_('UPLOAD_ITEM_ID')));
  if(!upload||String(upload.getType())!=='FILE_UPLOAD')throw new Error('画像アップロード欄が必要');
  protectReviewSheets();
  if(!ScriptApp.getProjectTriggers().some(function(t){return t.getHandlerFunction()==='onExhibitorFormSubmit';}))ScriptApp.newTrigger('onExhibitorFormSubmit').forForm(form).onFormSubmit().create();
}
// Owner + explicitly named reviewers only; no domain-wide or warning-only protection.
function protectReviewSheets() {
  var allowed=required_('REVIEWER_EMAILS').split(',').map(function(x){return x.trim();}).filter(Boolean);
  ['form_responses','vendor_registry','publication_reviews','public_export','audit_log'].forEach(function(name){
    var sh=book_().getSheetByName(name),p=sh.getProtections(SpreadsheetApp.ProtectionType.SHEET)[0]||sh.protect();
    p.setDescription('出店者紹介：承認者のみ編集').setWarningOnly(false);p.addEditors(allowed);
    p.getEditors().forEach(function(user){if(allowed.indexOf(user.getEmail())<0&&user.getEmail()!==Session.getEffectiveUser().getEmail())p.removeEditor(user);});
    if(p.canDomainEdit())p.setDomainEdit(false);
  });
}
// Manually recover failed/uncertain intake after reviewing Apps Script execution failures.
function reconcileIntake() {FormApp.openById(required_('FORM_ID')).getResponses().forEach(receiveResponse_);}
function onOpen() {SpreadsheetApp.getUi().createMenu('掲載審査').addItem('選択行を掲載承認','approveSelectedRow').addToUi();}
function approveSelectedRow() {
  var b=SpreadsheetApp.getActiveSpreadsheet(),sh=b.getActiveSheet(),row=b.getActiveRange().getRow();
  if(sh.getName()!=='publication_reviews'||row<2)throw new Error('審査行を選択');
  var id=sh.getRange(row,1).getValue(),ui=SpreadsheetApp.getUi();
  if(ui.alert('掲載承認','本文・画像単位の権利/個人情報・同意期間・未成年確認を完了し、この版を承認しますか？',ui.ButtonSet.YES_NO)===ui.Button.YES)approveSubmission(id);
}
