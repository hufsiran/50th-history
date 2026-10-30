'use strict';
(async () => {
  const $ = id => document.getElementById(id);
  const storage = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k,v) { try { localStorage.setItem(k,v); } catch {} } };
  const toast = message => { $('toast').textContent=message; $('toast').hidden=false; clearTimeout(toast.timer); toast.timer=setTimeout(()=>$('toast').hidden=true,4500); };
  const normalize = text => String(text).normalize('NFKC').toLocaleLowerCase().replace(/\s+/g,'');
  const safeURL = value => { try { const u=new URL(value); return ['https:','http:','mailto:','tel:'].includes(u.protocol) ? u.href : null; } catch { return null; } };
  let config, pages;
  try {
    const results=await Promise.all(['config.json','pages.json'].map(async path=>{const r=await fetch(path,{cache:'no-cache'}); if(!r.ok)throw Error(path); return r.json();}));
    [config,pages]=results;
    if(!Array.isArray(pages)||!pages.length)throw Error('빈 페이지 목록');
  } catch(error) { $('loading').textContent='파일을 불러오지 못했습니다. GitHub Pages 주소로 접속하거나 안내문의 로컬 실행 방법을 확인해 주세요.'; console.error(error); return; }
  const book=$('book'), stage=$('stage'), audio=$('audio'), total=pages.length;
  let wide=false, current=0, busy=false, playing=false, musicWanted=false, clock=performance.now(), generation=0, activeAnimation=null, ready=false;
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const chapterList=Array.isArray(config.toc)?config.toc:[];
  const hotspotMap=new Map();
  for(const h of config.links||[]) {
    if(!Number.isInteger(h.page)||h.page<1||h.page>total||!safeURL(h.url))continue;
    const values=['x','y','width','height'].map(k=>Number(h[k]));
    if(values.some(v=>!Number.isFinite(v))||values[0]<0||values[1]<0||values[2]<=0||values[3]<=0||values[0]+values[2]>100.1||values[1]+values[3]>100.1)continue;
    if(!hotspotMap.has(h.page))hotspotMap.set(h.page,[]);
    hotspotMap.get(h.page).push(h);
  }
  $('title').textContent=config.title||'50주년사'; document.title=config.title||'50주년사 온라인 뷰어';
  audio.src=config.bgm||'assets/audio/bgm.mp3';
  audio.volume=Math.max(0,Math.min(1,Number(config.volume??.45)));
  $('volume').value=Math.round(audio.volume*100); $('volumeValue').textContent=$('volume').value+'%';
  for(const seconds of config.speedOptions||[3,5,8,12,20,30]) { if(Number(seconds)>=2) { const o=new Option(seconds+'초',Number(seconds)); $('speed').add(o); } }
  if(!$('speed').options.length)$('speed').add(new Option('8초',8));
  $('speed').value=String(config.autoTurnSeconds||8); if(!$('speed').value)$('speed').selectedIndex=0;
  $('pageInput').max=total; $('totalPages').textContent='/ '+total;
  // Keep the actual PDF's spreads together, including separate front/back covers.
  const fallbackSpreads=[[null,0]];
  for(let i=1;i<total;i+=2)fallbackSpreads.push([i,i+1<total?i+1:null]);
  const supplied=config.spreadGroups;
  const validSpreads=Array.isArray(supplied)&&supplied.every(g=>Array.isArray(g)&&g.length===2&&g.some(p=>p!==null)&&g.every(p=>p===null||(Number.isInteger(p)&&p>=1&&p<=total)))&&supplied.flat().filter(p=>p!==null).every((p,i)=>p===i+1)&&supplied.flat().filter(p=>p!==null).length===total;
  const spreads=validSpreads?supplied.map(g=>g.map(p=>p===null?null:p-1)):fallbackSpreads;
  const groupOf=new Map();spreads.forEach((g,k)=>g.forEach(p=>{if(p!==null)groupOf.set(p,k);}));
  const firstPage=g=>g.find(p=>p!==null);
  const anchor=index=>wide?firstPage(spreads[groupOf.get(index)]):index;
  const visible=index=>wide?spreads[groupOf.get(index)]:[index];
  const adjacent=(index,direction)=>{
    if(!wide)return index+direction;
    const group=groupOf.get(index)+direction;
    return group<0?-1:group>=spreads.length?total:firstPage(spreads[group]);
  };
  const resetClock=()=>{clock=performance.now();$('timerFill').style.width='0%';};
  function sheet(index,side='right') {
    const el=document.createElement('div'); el.className='sheet '+side;
    if(index===null||index<0||index>=total){el.classList.add('blank');return el;}
    const p=pages[index], img=document.createElement('img'); img.className='page-image'; img.src=p.image; img.alt='50주년사 뷰어 '+p.page+'페이지'; img.draggable=false; img.decoding='async';
    el.dataset.page=String(p.page); el.append(img);
    for(const h of hotspotMap.get(p.page)||[]) {
      const a=document.createElement('a'); a.className='hotspot'; a.href=safeURL(h.url); a.target='_blank'; a.rel='noopener noreferrer'; a.title=h.label||'관련 자료 열기'; a.setAttribute('aria-label',a.title);
      Object.assign(a.style,{left:h.x+'%',top:h.y+'%',width:h.width+'%',height:h.height+'%'});
      a.addEventListener('click',()=>setPlaying(false)); el.append(a);
    }
    return el;
  }
  function render(index) { book.replaceChildren(); visible(index).forEach((p,k)=>book.append(sheet(p,wide&&k===0?'left':'right'))); }
  async function preload(index) {
    await Promise.all(visible(index).filter(p=>p!==null).map(p=>new Promise(resolve=>{const img=new Image();img.onload=resolve;img.onerror=resolve;img.src=pages[p].image;})));
  }
  function update() {
    const ids=visible(current).filter(x=>x!==null).map(x=>x+1);
    $('pageStatus').textContent=ids.join('–')+' / '+total;
    if(document.activeElement!==$('pageInput'))$('pageInput').value=ids[0];
    const chapter=chapterList.filter(c=>c.page<=ids[0]).sort((a,b)=>b.page-a.page)[0];
    $('chapter').textContent=chapter?chapter.title:'50년의 기록';
    $('prev').disabled=busy||current===0; $('next').disabled=busy||current>=total-1;
    const url=new URL(location.href);url.hash='page='+ids[0];history.replaceState(null,'',url);
    book.querySelectorAll('.sheet').forEach(el=>{el.setAttribute('aria-label',el.dataset.page?el.dataset.page+'페이지':'빈 면');});
    for(const delta of [-2,2,4]) { const n=current+delta; if(n>=0&&n<total){const img=new Image();img.src=pages[n].image;} }
  }
  async function go(index,animate=true) {
    index=anchor(Math.max(0,Math.min(total-1,index)));
    if(busy&&!animate){generation++;if(activeAnimation)activeAnimation.cancel();activeAnimation=null;busy=false;}
    if(busy||index===current){resetClock();return;}
    busy=true;update(); const token=++generation, old=current, direction=index>old?'forward':'backward';
    $('loading').hidden=false;
    await preload(index);
    if(token!==generation)return;
    $('loading').hidden=true;current=index;
    if(animate&&!media.matches) {
      const before=visible(old),after=visible(index);render(index);
      if(wide){book.replaceChildren(sheet(direction==='forward'?before[0]:after[0],'left'),sheet(direction==='forward'?after[1]:before[1],'right'));}
      const leaf=document.createElement('div');leaf.className='leaf '+direction;
      const front=document.createElement('div'),back=document.createElement('div');front.className='face';back.className='face back';
      const forward=direction==='forward';
      front.append(sheet(wide?before[forward?1:0]:before[0]));back.append(sheet(wide?after[forward?0:1]:after[0]));
      leaf.append(front,back);book.append(leaf);
      activeAnimation=leaf.animate([{transform:'rotateY(0deg)'},{transform:`rotateY(${forward?-180:180}deg)`}],{duration:Math.max(250,Math.min(1500,Number(config.flipDurationMs)||750)),easing:'cubic-bezier(.3,.05,.25,1)',fill:'forwards'});
      try {await activeAnimation.finished;} catch {} if(token!==generation)return;render(index);activeAnimation=null;
    } else render(index);
    busy=false;update();resetClock();
  }
  function next(manual=false) { if(manual)setPlaying(false); const n=adjacent(current,1);if(n>=total){if(config.loop===true&&!manual)go(0,false);else setPlaying(false);}else go(n); }
  function prev() {setPlaying(false);go(Math.max(0,adjacent(current,-1)));}
  function setPlaying(value){playing=!!value;resetClock();$('play').textContent=playing?'❚❚ 일시정지':'▶ 자동 넘김';$('play').setAttribute('aria-pressed',String(playing));}
  async function setMusic(value) {
    musicWanted=!!value;
    if(musicWanted) { try {await audio.play();} catch {musicWanted=false;toast('음악을 재생하지 못했습니다. 음악 켜기를 다시 누르거나 음원 파일을 확인해 주세요.');} }
    else audio.pause();
    $('music').textContent=musicWanted?'♫ 음악 끄기':'♫ 음악 켜기';$('music').setAttribute('aria-pressed',String(musicWanted));
  }
  audio.addEventListener('error',()=>{if(musicWanted){musicWanted=false;$('music').textContent='♫ 음악 켜기';$('music').setAttribute('aria-pressed','false');toast('음원 파일을 불러올 수 없습니다.');}});
  function layout() {
    const rect=stage.getBoundingClientRect(),oldWide=wide;
    wide=rect.width>=Math.max(650,Number(config.doublePageMinWidth)||760);
    const ratio=Number(config.pageAspectRatio)||595.276/737.008;
    const w=Math.floor(Math.min(rect.width,rect.height*ratio*(wide?2:1),wide?1500:800));
    Object.assign(book.style,{width:w+'px',height:Math.floor(w/(ratio*(wide?2:1)))+'px'});
    book.className='book '+(wide?'double':'single');
    if(ready&&(oldWide!==wide||busy)) { generation++;if(activeAnimation)activeAnimation.cancel();activeAnimation=null;busy=false;current=anchor(current);render(current);$('loading').hidden=true;update();resetClock(); }
  }
  new ResizeObserver(layout).observe(stage);
  $('prev').onclick=prev;$('next').onclick=()=>next(true);$('play').onclick=()=>setPlaying(!playing);
  $('speed').onchange=resetClock;$('music').onclick=()=>setMusic(!musicWanted);
  $('volume').oninput=()=>{audio.volume=Number($('volume').value)/100;$('volumeValue').textContent=$('volume').value+'%';};
  $('jumpForm').onsubmit=e=>{e.preventDefault();const v=Number($('pageInput').value);if(!Number.isInteger(v)||v<1||v>total){toast('1~'+total+' 사이의 페이지 번호를 입력해 주세요.');return;}setPlaying(false);go(v-1,false);};
  $('fullscreen').onclick=async()=>{try {if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();} catch {toast('이 브라우저에서는 전체 화면을 사용할 수 없습니다.');}};
  document.addEventListener('fullscreenchange',()=>{$('fullscreen').textContent=document.fullscreenElement?'전체 화면 종료':'전체 화면';});
  function closeDrawer(){$('drawer').hidden=true;$('scrim').hidden=true;if(closeDrawer.opener)closeDrawer.opener.focus();resetClock();}
  function openDrawer(title,opener) {setPlaying(false);$('drawerTitle').textContent=title;$('drawerBody').replaceChildren();$('drawer').hidden=false;$('scrim').hidden=false;closeDrawer.opener=opener;$('closeDrawer').focus();}
  $('closeDrawer').onclick=closeDrawer;$('scrim').onclick=closeDrawer;
  function jump(index){closeDrawer();setPlaying(false);go(index,false);}
  $('contentsBtn').onclick=()=>{openDrawer('목차',$('contentsBtn'));for(const c of chapterList){const b=document.createElement('button');b.className='toc-item';b.textContent=c.title;const sm=document.createElement('small');sm.textContent='뷰어 '+c.page+'페이지';b.append(sm);b.onclick=()=>jump(c.page-1);$('drawerBody').append(b);}};
  $('thumbsBtn').onclick=()=>{openDrawer('전체 페이지',$('thumbsBtn'));const grid=document.createElement('div');grid.className='thumb-grid';pages.forEach((p,i)=>{const b=document.createElement('button');b.className='thumb'+(visible(current).includes(i)?' active':'');const img=document.createElement('img');img.src=p.thumb;img.loading='lazy';img.alt=p.page+'페이지 미리보기';const sm=document.createElement('small');sm.textContent=p.page+'페이지';b.append(img,sm);b.onclick=()=>jump(i);grid.append(b);});$('drawerBody').append(grid);};
  $('searchBtn').onclick=()=>{
    openDrawer('본문 검색',$('searchBtn'));
    const form=document.createElement('form');form.className='search-form';const input=document.createElement('input');input.type='search';input.placeholder='이름, 연도, 내용 검색';input.setAttribute('aria-label','검색어');const submit=document.createElement('button');submit.textContent='찾기';form.append(input,submit);
    const results=document.createElement('div');results.setAttribute('aria-live','polite');const note=document.createElement('p');note.className='empty';note.textContent='PDF에서 추출한 본문을 검색합니다. 사진 속 글자나 특수 글꼴은 검색되지 않을 수 있습니다.';
    $('drawerBody').append(form,note,results);input.focus();
    form.onsubmit=e=>{e.preventDefault();results.replaceChildren();const q=normalize(input.value.trim());if(!q)return;let count=0;pages.forEach((p,i)=>{const raw=p.text||'', compact=normalize(raw),at=compact.indexOf(q);if(at<0)return;count++;const b=document.createElement('button');b.className='result';const strong=document.createElement('strong');strong.textContent='뷰어 '+p.page+'페이지';const snippet=document.createElement('p');const clean=raw.replace(/\s+/g,' ');const offset=clean.toLocaleLowerCase().indexOf(input.value.trim().toLocaleLowerCase());snippet.textContent=offset>=0?'… '+clean.slice(Math.max(0,offset-45),offset+130)+' …':clean.slice(0,150)+' …';b.append(strong,snippet);b.onclick=()=>jump(i);results.append(b);});note.textContent=count?count+'개 페이지에서 찾았습니다.':'검색 결과가 없습니다. 다른 단어나 띄어쓰기를 사용해 보세요.';};
  };
  const welcome=$('welcome');
  const showHelp=()=>{setPlaying(false);if(!welcome.open)welcome.showModal();};
  $('helpBtn').onclick=showHelp;
  function dismiss(){storage.set('history50-help-v1',$('remember').checked?'seen':'');welcome.close();resetClock();}
  $('readStart').onclick=()=>{dismiss();setPlaying(false);};
  $('autoStart').onclick=()=>{dismiss();setPlaying(true);setMusic(true);};
  let pointer=null;
  stage.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'||e.target.closest('a,button')||busy)return;pointer={x:e.clientX,y:e.clientY};});
  stage.addEventListener('pointerup',e=>{if(!pointer)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;pointer=null;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.3){if(dx<0)next(true);else prev();}});
  stage.addEventListener('pointercancel',()=>pointer=null);
  document.addEventListener('keydown',e=>{
    if(welcome.open||!$('drawer').hidden){if(e.key==='Escape')closeDrawer();return;}
    if(e.target.closest('input,select,textarea,button,a,[contenteditable]'))return;
    if(e.key==='ArrowRight'){e.preventDefault();next(true);}else if(e.key==='ArrowLeft'){e.preventDefault();prev();}else if(e.code==='Space'){e.preventDefault();setPlaying(!playing);}
  });
  window.addEventListener('hashchange',()=>{const n=Number(new URLSearchParams(location.hash.slice(1)).get('page'));if(n>=1&&n<=total){setPlaying(false);go(n-1,false);}});
  document.addEventListener('visibilitychange',()=>{resetClock();});
  function tick(t){if(playing&&!busy&&!document.hidden&&!welcome.open&&$('drawer').hidden){const p=Math.min(1,(t-clock)/(Number($('speed').value)*1000));$('timerFill').style.width=p*100+'%';if(p>=1){resetClock();next();}}requestAnimationFrame(tick);}
  layout();const initial=Number(new URLSearchParams(location.hash.slice(1)).get('page'));current=anchor(Number.isInteger(initial)&&initial>=1&&initial<=total?initial-1:0);render(current);await preload(current);ready=true;$('loading').hidden=true;update();requestAnimationFrame(tick);
  if(storage.get('history50-help-v1')!=='seen')showHelp();
})();
