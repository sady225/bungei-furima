import {sha256,fromBase64} from '../worker/domain.mjs';
export const image='UklGRjAAAABXRUJQVlA4ICQAAABQAQCdASoQABAAAUAmJQBOgCgAAP7qZfSXS5DfXrS3NuIAAAA=';
export const board='a'.repeat(24), published='b'.repeat(24), stopped='c'.repeat(24);
export async function fixtures() {
  const digest=await sha256(fromBase64(image));
  return ['架空・石敢當文庫','架空・デイゴ製本室','架空・サンダンカ工房'].map((name,i)=>({
    eventId:'test-2027',vendorId:`fiction-${i+1}`,cardId:String(i+1).repeat(24),confirmed:true,
    consent:'許可済み',review:'掲載承認',imageReview:'許可済み',withdrawn:false,minor:false,
    childAssent:false,guardianConsent:false,ownerApproval:false,
    expiresAt:'2099-01-01T00:00:00.000Z',consentUntil:'2099-01-01T00:00:00.000Z',reviewedAt:'2026-10-30T00:00:00.000Z',
    reviewedBy:'reviewer@example.invalid',revision:'d'.repeat(64),approvedRevision:'d'.repeat(64),
    name,category:'詩・絵本',description:`架空の出店者${i+1}による動作検証用の紹介です。`,workTitle:'架空の作品',websiteUrl:'https://example.invalid/',boothNumber:`T${i+1}`,
    images:[{base64:image,sha256:digest}],
    // Deliberate private canaries to prove the public projection excludes these fields.
    contact_email:'private-contact@example.invalid',consent_original:'PRIVATE-CONSENT-CANARY',review_note:'PRIVATE-REVIEW-CANARY'
  }));
}
