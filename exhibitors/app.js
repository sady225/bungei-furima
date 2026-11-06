'use strict';
document.addEventListener('DOMContentLoaded', async () => {
  const container=document.getElementById('cards'),status=document.getElementById('status'),select=document.getElementById('event');
  let records=[];
  const node=(tag,value,cls)=>{const n=document.createElement(tag);if(value)n.textContent=value;if(cls)n.className=cls;return n;};
  function render() {
    container.replaceChildren();
    const current=records.filter(r=>(!select.value||r.event_id===select.value)&&Date.parse(r.expires_at)>Date.now());
    status.textContent=current.length?`${current.length}組のつくり手をご紹介します。`:'現在掲載中の出店者紹介はありません。';
    current.forEach(r=>{
      const card=node('article',null,'card'),body=node('div',null,'body');
      for(const path of r.image_urls) {
        if(!/^\/assets\/vendors\/[a-z0-9-]+\/[a-z0-9-]+\/[a-f0-9]{64}\.webp$/.test(path))continue;
        const img=node('img');img.src=path;img.alt=r.work_title||`${r.name}の作品`;img.loading='lazy';img.width=640;img.height=480;img.referrerPolicy='no-referrer';card.appendChild(img);
      }
      body.appendChild(node('p',`${r.event_id} / ${r.category}`,'meta'));body.appendChild(node('h2',r.name));
      if(r.work_title)body.appendChild(node('p',r.work_title));body.appendChild(node('p',r.description));
      if(r.booth_number)body.appendChild(node('p',`ブース：${r.booth_number}`));
      if(r.website_url){try{const url=new URL(r.website_url);if(url.protocol==='https:'&&!url.username&&!url.password){const a=node('a','つくり手のサイトへ');a.href=url.href;a.target='_blank';a.rel='noopener noreferrer';body.appendChild(a);}}catch{}}
      body.appendChild(node('p',`掲載内容の確認日：${r.published_at.slice(0,10)}`,'meta'));card.appendChild(body);container.appendChild(card);
    });
  }
  try {
    const response=await fetch('../data/exhibitors.json',{cache:'no-store'});if(!response.ok)throw new Error('load');
    const catalog=await response.json();if(catalog.schema_version!==1||!Array.isArray(catalog.exhibitors))throw new Error('schema');
    records=catalog.exhibitors;
    [...new Set(records.map(r=>r.event_id))].sort().forEach(id=>{const o=node('option',id);o.value=id;select.appendChild(o);});
    select.addEventListener('change',render);render();setInterval(render,60000);
  } catch {status.textContent='紹介を読み込めませんでした。時間をおいて、もう一度お試しください。';}
});
