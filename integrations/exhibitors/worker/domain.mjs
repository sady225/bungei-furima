// Only this projection may cross into the public repository.
export const idPattern = /^[a-z0-9][a-z0-9-]{0,63}$/;
export function assert(ok, code) { if (!ok) throw new Error(code); }
export function text(value, max, optional = false) {
  assert(typeof value === 'string' && (optional || value.trim().length > 0) && value.length <= max, 'invalid-text');
  assert(!/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value), 'invalid-control');
  return value.trim();
}
export function website(value) {
  if (!value) return '';
  const url = new URL(text(value, 500));
  assert(url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash, 'invalid-website');
  assert(!/^(localhost|127\.|10\.|192\.168\.|169\.254\.|\[)/.test(url.hostname), 'invalid-website');
  assert(!['docs.google.com','drive.google.com'].includes(url.hostname),'private-document-url');
  return url.href;
}
export function publicText(value,max,optional=false) {
  const result=text(value,max,optional);
  assert(!/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|(?:0\d{1,4}[-ー ]?\d{1,4}[-ー ]?\d{3,4})|(?:drive|docs)\.google\.com/i.test(result),'contact-in-public-text');
  return result;
}
export function eligible(row, now = Date.now()) {
  return row.confirmed === true && row.consent === '許可済み' && row.review === '掲載承認' &&
    row.imageReview === '許可済み' && row.withdrawn === false && row.approvedRevision === row.revision &&
    typeof row.reviewedBy === 'string' && row.reviewedBy.length > 0 &&
    Number.isFinite(Date.parse(row.expiresAt)) && Date.parse(row.expiresAt) > now &&
    Number.isFinite(Date.parse(row.consentUntil)) && Date.parse(row.expiresAt) <= Date.parse(row.consentUntil) &&
    Number.isFinite(Date.parse(row.reviewedAt)) && Date.parse(row.reviewedAt) <= now &&
    (row.minor === false || (row.minor === true && row.childAssent === true && row.guardianConsent === true && row.ownerApproval === true));
}
export async function sha256(bytes) {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2, '0')).join('');
}
export function fromBase64(value) {
  assert(typeof value === 'string' && value.length <= 1400000 && /^[A-Za-z0-9+/]*={0,2}$/.test(value), 'invalid-image');
  return Uint8Array.from(atob(value), c => c.charCodeAt(0));
}
export function toBase64(bytes) {
  let s = ''; for (let i = 0; i < bytes.length; i += 8192) s += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(s);
}
// Accept only metadata-free static WebP derivatives, never arbitrary uploads/SVG.
export function checkWebp(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const tag = i => String.fromCharCode(...bytes.subarray(i, i + 4));
  assert(bytes.length >= 20 && bytes.length <= 1024 * 1024 && tag(0) === 'RIFF' && tag(8) === 'WEBP' && view.getUint32(4, true) + 8 === bytes.length, 'invalid-webp');
  let pixels = 0, offset = 12;
  for (; offset + 8 <= bytes.length;) {
    const type = tag(offset), size = view.getUint32(offset + 4, true);
    assert(['VP8 ', 'VP8L', 'VP8X', 'ALPH'].includes(type), 'webp-metadata-or-animation');
    assert(offset + 8 + size <= bytes.length, 'invalid-webp');
    if (type === 'VP8 ' || type === 'VP8L') pixels++;
    if (type === 'VP8X') assert(size === 10 && !(bytes[offset + 8] & 0x2e), 'webp-metadata-or-animation');
    offset += 8 + size + (size % 2);
  }
  assert(offset === bytes.length && pixels === 1, 'invalid-webp');
}
export async function project(row) {
  assert(idPattern.test(row.eventId) && idPattern.test(row.vendorId), 'invalid-id');
  assert(/^[a-f0-9]{64}$/.test(row.revision), 'invalid-revision');
  assert(Array.isArray(row.images) && row.images.length >= 1 && row.images.length <= 3, 'invalid-images');
  const files = [], image_urls = [];
  for (const item of row.images) {
    const bytes = fromBase64(item.base64); checkWebp(bytes);
    const hash = await sha256(bytes); assert(hash === item.sha256, 'image-hash-mismatch');
    const path = `assets/vendors/${row.eventId}/${row.vendorId}/${hash}.webp`;
    image_urls.push('/' + path); files.push({path, bytes});
  }
  return {files, record: {
    event_id: row.eventId, vendor_id: row.vendorId, name: publicText(row.name, 80), category: publicText(row.category, 80),
    description: publicText(row.description, 400), work_title: publicText(row.workTitle || '', 100, true), image_urls,
    website_url: website(row.websiteUrl), booth_number: publicText(row.boothNumber || '', 20, true),
    published_at: row.reviewedAt, source_revision: row.revision, expires_at: row.expiresAt
  }};
}
export function validateCatalog(catalog) {
  assert(catalog.schema_version === 1 && Array.isArray(catalog.exhibitors) && catalog.exhibitors.length <= 150, 'invalid-catalog');
  const allowed = ['event_id','vendor_id','name','category','description','work_title','image_urls','website_url','booth_number','published_at','source_revision','expires_at'];
  const ids = new Set();
  for (const r of catalog.exhibitors) {
    assert(Object.keys(r).length === allowed.length && Object.keys(r).every(k => allowed.includes(k)), 'non-public-field');
    assert(idPattern.test(r.event_id) && idPattern.test(r.vendor_id), 'invalid-id');
    const key = r.event_id + '/' + r.vendor_id; assert(!ids.has(key), 'duplicate-id'); ids.add(key);
    publicText(r.name,80); publicText(r.category,80); publicText(r.description,400); publicText(r.work_title,100,true); publicText(r.booth_number,20,true); website(r.website_url);
    assert(/^[a-f0-9]{64}$/.test(r.source_revision) && Number.isFinite(Date.parse(r.published_at)) && Number.isFinite(Date.parse(r.expires_at)), 'invalid-revision-or-date');
    assert(Array.isArray(r.image_urls) && r.image_urls.length >= 1 && r.image_urls.length <= 3 && r.image_urls.every(p => new RegExp('^/assets/vendors/' + key + '/[a-f0-9]{64}\\.webp$').test(p)), 'invalid-image-path');
  }
  return catalog;
}
