'use strict';
(async()=>{
  const openButton=document.getElementById('zoomOpen');
  if(!openButton)return;
  let pages,links;
  try{
    [pages,links]=await Promise.all([
      fetch('pages.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error();return r.json();}),
      fetch('config.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(c=>c.links||[])
    ]);
    if(!Array.isArray(pages)||!pages.length)throw Error();
  }catch{openButton.textContent='확대 불가';openButton.title='페이지 설정을 불러오지 못했습니다.';return;}
  const dialog=document.createElement('dialog');dialog.id='zoomDialog';dialog.setAttribute('aria-labelledby','zoomTitle');
  dialog.innerHTML=`<header class="zoom-toolbar"><h2 id="zoomTitle">페이지 확대</h2><button id="zoomClose" aria-label="확대 창 닫기">✕ 닫기</button><div class="zoom-tools"><button id="zoomPrev" aria-label="확대 창 이전 페이지">←</button><label for="zoomPage">페이지</label><input id="zoomPage" type="number" min="1" max="${pages.length}" inputmode="numeric"><span>/ ${pages.length}</span><button id="zoomGo">이동</button><button id="zoomNext" aria-label="확대 창 다음 페이지">→</button></div><div class="zoom-tools"><button id="zoomMinus" aria-label="축소">−</button><output id="zoomPercent" aria-live="polite">100%</output><button id="zoomPlus" aria-label="확대">＋</button><button id="zoomReset">원래 크기</button></div></header><div id="zoomViewport" tabindex="0" aria-label="확대 페이지. 드래그하거나 방향키로 이동"><div id="zoomCanvas"><img id="zoomImage" alt=""></div></div><p class="zoom-hint">＋ / − 확대·축소 · 드래그·스크롤로 이동 · 휴대폰은 두 손가락 확대 · Esc 닫기 <span id="zoomState" role="status"></span></p>`;
  document.body.append(dialog);
  const $=id=>document.getElementById(id),viewport=$('zoomViewport'),canvas=$('zoomCanvas'),image=$('zoomImage');
  let pageIndex=0,scale=1,baseWidth=1,baseHeight=1,token=0,gesture=null,moved=false;
  const pointers=new Map();
  function dimensions(){
    const ratio=(image.naturalWidth||595.276)/(image.naturalHeight||737.008);
    baseWidth=Math.max(1,Math.min(viewport.clientWidth-32,(viewport.clientHeight-32)*ratio));
    baseHeight=baseWidth/ratio;
    canvas.style.width=baseWidth*scale+'px';canvas.style.height=baseHeight*scale+'px';
    $('zoomPercent').textContent=Math.round(scale*100)+'%';$('zoomMinus').disabled=scale<=1;$('zoomPlus').disabled=scale>=3;
  }
  function setScale(value,point){
    const old=scale;value=Math.max(1,Math.min(3,value));if(Math.abs(value-old)<.001)return;
    const r=viewport.getBoundingClientRect(),cx=point?point.x-r.left:viewport.clientWidth/2,cy=point?point.y-r.top:viewport.clientHeight/2;
    const box=canvas.getBoundingClientRect();
    const x=(r.left+cx-box.left)/(baseWidth*old),y=(r.top+cy-box.top)/(baseHeight*old);
    scale=value;dimensions();
    const after=canvas.getBoundingClientRect();
    viewport.scrollLeft+=after.left+x*baseWidth*scale-(r.left+cx);
    viewport.scrollTop+=after.top+y*baseHeight*scale-(r.top+cy);
  }
  function reset(){scale=1;dimensions();viewport.scrollTo(0,0);}
  function clearGesture(){pointers.clear();gesture=null;moved=false;viewport.classList.remove('dragging');}
  async function showPage(index){
    const n=Number(index);if(!Number.isInteger(n)||n<0||n>=pages.length){$('zoomState').textContent='올바른 페이지 번호를 입력해 주세요.';return;}
    const thisToken=++token;clearGesture();pageIndex=n;const page=pages[n];
    $('zoomPage').value=n+1;$('zoomPrev').disabled=n===0;$('zoomNext').disabled=n===pages.length-1;
    $('zoomState').textContent='불러오는 중…';canvas.querySelectorAll('a').forEach(a=>a.remove());image.alt=(n+1)+'페이지 확대';
    image.onload=()=>{if(thisToken!==token)return;$('zoomState').textContent='';reset();};
    image.onerror=()=>{if(thisToken===token)$('zoomState').textContent='페이지 이미지를 불러오지 못했습니다.';};
    image.src=page.image;reset();
    if(image.complete&&image.naturalWidth)$('zoomState').textContent='';
    for(const h of links){
      if(h.page!==page.page)continue;
      let url;try{url=new URL(h.url);if(!['https:','http:','mailto:','tel:'].includes(url.protocol))continue;}catch{continue;}
      const [x,y,w,height]=['x','y','width','height'].map(k=>Number(h[k]));
      if([x,y,w,height].some(v=>!Number.isFinite(v))||x<0||y<0||w<=0||height<=0||x+w>100.1||y+height>100.1)continue;
      const a=document.createElement('a');a.className='hotspot';a.href=url.href;a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label',h.label||'관련 자료 열기');a.title=h.label||'관련 자료 열기';Object.assign(a.style,{left:x+'%',top:y+'%',width:w+'%',height:height+'%'});canvas.append(a);
    }
  }
  function open(){
    if(dialog.open)return;
    const play=document.getElementById('play');if(play?.getAttribute('aria-pressed')==='true')play.click();
    const sheets=[...document.querySelectorAll('#book > .sheet[data-page]')];
    const hashPage=Number(new URLSearchParams(location.hash.slice(1)).get('page'))||1;
    dialog.showModal();showPage(Number(sheets[0]?.dataset.page||hashPage)-1);$('zoomPlus').focus();
  }
  function close(){clearGesture();dialog.close();openButton.focus();}
  openButton.disabled=false;openButton.onclick=open;
  $('zoomClose').onclick=close;dialog.addEventListener('close',clearGesture);
  $('zoomPlus').onclick=()=>setScale(Math.round(scale*100+25)/100);
  $('zoomMinus').onclick=()=>setScale(Math.round(scale*100-25)/100);
  $('zoomReset').onclick=reset;
  $('zoomPrev').onclick=()=>showPage(pageIndex-1);$('zoomNext').onclick=()=>showPage(pageIndex+1);
  $('zoomGo').onclick=()=>showPage(Number($('zoomPage').value)-1);
  $('zoomPage').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();showPage(Number(e.target.value)-1);}};
  // Stop the underlying book's shortcuts while this dialog is active.
  dialog.addEventListener('keydown',e=>{
    e.stopPropagation();if(e.target.closest('input,button,a'))return;
    if(e.key==='+'||e.key==='='){e.preventDefault();setScale(scale+.25);}
    else if(e.key==='-'){e.preventDefault();setScale(scale-.25);}
    else if(e.key==='0'){e.preventDefault();reset();}
    else if(e.key==='ArrowLeft'){e.preventDefault();viewport.scrollBy(-60,0);}
    else if(e.key==='ArrowRight'){e.preventDefault();viewport.scrollBy(60,0);}
    else if(e.key==='ArrowUp'){e.preventDefault();viewport.scrollBy(0,-60);}
    else if(e.key==='ArrowDown'){e.preventDefault();viewport.scrollBy(0,60);}
  });
  const distance=()=>{const [a,b]=[...pointers.values()];return Math.hypot(a.x-b.x,a.y-b.y);};
  const midpoint=()=>{const [a,b]=[...pointers.values()];return{x:(a.x+b.x)/2,y:(a.y+b.y)/2};};
  function startGesture(){
    if(pointers.size>=2){gesture={kind:'pinch',distance:distance(),scale,midpoint:midpoint()};moved=true;}
    else if(pointers.size===1){const p=[...pointers.values()][0];gesture={kind:'drag',x:p.x,y:p.y,left:viewport.scrollLeft,top:viewport.scrollTop};}
    else gesture=null;
  }
  viewport.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse'&&e.button!==0)return;
    // Keep a simple QR tap as a native link click; capture only background drags.
    if(!pointers.size)moved=false;
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});startGesture();
    if(!e.target.closest('a'))viewport.setPointerCapture(e.pointerId);
  });
  viewport.addEventListener('pointermove',e=>{
    if(!pointers.has(e.pointerId)||!gesture)return;
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pointers.size>=2&&gesture.kind==='pinch'){
      e.preventDefault();const mid=midpoint();setScale(gesture.scale*distance()/Math.max(1,gesture.distance),mid);
      viewport.scrollLeft-=mid.x-gesture.midpoint.x;viewport.scrollTop-=mid.y-gesture.midpoint.y;gesture.midpoint=mid;
    }else if(gesture.kind==='drag'){
      const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;
      if(Math.hypot(dx,dy)>5)moved=true;
      if(moved){e.preventDefault();viewport.classList.add('dragging');viewport.scrollLeft=gesture.left-dx;viewport.scrollTop=gesture.top-dy;}
    }
  },{passive:false});
  const release=e=>{pointers.delete(e.pointerId);viewport.classList.remove('dragging');startGesture();};
  viewport.addEventListener('pointerup',release);viewport.addEventListener('pointercancel',release);viewport.addEventListener('lostpointercapture',release);
  viewport.addEventListener('click',e=>{if(moved){e.preventDefault();e.stopPropagation();}},true);
  viewport.addEventListener('wheel',e=>{if(e.ctrlKey){e.preventDefault();setScale(scale*Math.exp(-e.deltaY*.01),{x:e.clientX,y:e.clientY});}},{passive:false});
  new ResizeObserver(()=>{if(dialog.open){clearGesture();dimensions();}}).observe(viewport);
})();
