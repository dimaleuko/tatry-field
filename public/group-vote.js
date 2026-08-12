(function(){
  'use strict';
  const NAME_KEY='tatry-field:vote-name:v1';
  let routes=[],savedStore=null,current=null,refreshTimer=null,initialized=false;
  const $=selector=>document.querySelector(selector);
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const routeById=id=>routes.find(route=>route.id===id);

  function savedCandidates(){return (savedStore?.get()||[]).map(routeById).filter(Boolean)}
  function voteUrl(id){const url=new URL(location.href);url.search='';url.searchParams.set('vote',id);url.hash='group-vote';return url.toString()}
  function rememberedName(){try{return localStorage.getItem(NAME_KEY)||''}catch{return ''}}
  function rememberName(name){try{localStorage.setItem(NAME_KEY,name)}catch{}}
  function message(error){return error?.message||'Что-то не сработало. Попробуй ещё раз.'}
  async function request(url,options){const response=await fetch(url,{...options,headers:{'content-type':'application/json',...(options?.headers||{})}});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||`Ошибка ${response.status}`);return data.vote}

  function refreshShortlist(){
    const host=$('#voteShortlist'),button=$('#createGroupVote'),candidates=savedCandidates();if(!host)return;
    host.innerHTML=candidates.length?candidates.map((route,index)=>`<div class="vote-shortlist-item"><span>${String(index+1).padStart(2,'0')}</span><b>${esc(route.name)}</b><small>${route.hours} ч · +${route.ascent} м · ${route.diff}/5</small></div>`).join(''):'<p>Сначала сохрани минимум два маршрута.</p>';
    if(button)button.disabled=candidates.length<2;
    const trayButton=$('#openGroupVote');if(trayButton)trayButton.disabled=candidates.length<2;
  }

  function totals(vote){return Object.fromEntries(vote.routeIds.map(id=>[id,vote.votes.filter(item=>item.routeId===id)]))}
  function resultLabel(vote,counts){
    if(!vote.votes.length)return 'Первый голос пока свободен.';
    const max=Math.max(...Object.values(counts).map(list=>list.length));
    const leaders=vote.routeIds.filter(id=>counts[id].length===max).map(id=>routeById(id)?.name).filter(Boolean);
    return leaders.length===1?`Сейчас лидирует ${leaders[0]}.`:`Пока ничья: ${leaders.join(' / ')}.`;
  }
  function renderBoard(vote){
    current=vote;const host=$('#voteBoard');if(!host)return;
    const grouped=totals(vote);const known=rememberedName().trim().toLocaleLowerCase('ru-RU');const mine=vote.votes.find(item=>item.name.trim().toLocaleLowerCase('ru-RU')===known);
    const cards=vote.routeIds.map((id,index)=>{const route=routeById(id);if(!route)return '';const voters=grouped[id];return `<label class="vote-option${mine?.routeId===id?' mine':''}"><input type="radio" name="routeId" value="${id}" ${mine?.routeId===id?'checked':''}><span class="vote-option-index">${String(index+1).padStart(2,'0')}</span><span class="vote-option-copy"><b>${esc(route.name)}</b><small>${route.hours} ч · ${route.km} км · +${route.ascent} м · ${route.chains?'цепи':'без цепей'}</small></span><strong>${voters.length}</strong><span class="vote-people">${voters.length?voters.map(voter=>`<i>${esc(voter.name)}</i>`).join(''):'<i>пока без голосов</i>'}</span><a href="/route/${id}" target="_blank">посмотреть маршрут ↗</a></label>`}).join('');
    host.innerHTML=`<header class="vote-live-head"><div><span>02 / LIVE VOTE · ${esc(vote.id)}</span><h3>${esc(vote.title)}</h3><p>${esc(resultLabel(vote,grouped))} Всего голосов: ${vote.votes.length}.</p></div><button type="button" class="vote-new" data-new-vote>НОВОЕ</button></header><div class="vote-share"><input value="${esc(voteUrl(vote.id))}" readonly aria-label="Ссылка на голосование"><button type="button" data-copy-vote>КОПИРОВАТЬ ССЫЛКУ</button><span data-copy-status></span></div><form class="vote-cast" id="voteCastForm"><label class="vote-name">Твоё имя<input name="name" maxlength="32" minlength="2" required autocomplete="name" value="${esc(rememberedName())}" placeholder="например, Дима"></label><fieldset><legend>Выбери один маршрут. Голос можно изменить.</legend>${cards}</fieldset><button type="submit" class="vote-action">${mine?'ИЗМЕНИТЬ ГОЛОС →':'ПРОГОЛОСОВАТЬ →'}</button><p class="vote-status" id="voteCastStatus"></p></form>`;
    host.querySelector('[data-copy-vote]')?.addEventListener('click',copyLink);
    host.querySelector('[data-new-vote]')?.addEventListener('click',newVote);
    host.querySelector('#voteCastForm')?.addEventListener('submit',castVote);
  }

  async function copyLink(){
    const status=$('[data-copy-status]'),value=voteUrl(current.id);
    try{await navigator.clipboard.writeText(value);status.textContent='Скопировано ✓'}catch{const input=$('.vote-share input');input?.select();document.execCommand('copy');status.textContent='Скопировано ✓'}
    setTimeout(()=>{if(status)status.textContent=''},1800);
  }
  function newVote(){
    current=null;clearInterval(refreshTimer);refreshTimer=null;
    const url=new URL(location.href);url.searchParams.delete('vote');history.pushState({},'',`${url.pathname}${url.search}${url.hash}`);
    $('#voteBoard').innerHTML='<div class="vote-board-empty"><span>02 / LIVE VOTE</span><strong>Готово для нового<br>голосования.</strong><p>Обнови сохранённые маршруты и создай следующую ссылку.</p></div>';
    $('#voteCreateForm').hidden=false;refreshShortlist();
  }
  async function castVote(event){
    event.preventDefault();const form=event.currentTarget,status=$('#voteCastStatus'),data=new FormData(form),name=String(data.get('name')||'').trim(),routeId=String(data.get('routeId')||'');
    if(!routeId){status.textContent='Сначала выбери маршрут.';return}
    status.textContent='Сохраняю голос…';
    try{rememberName(name);renderBoard(await request(`/api/group-votes/${current.id}/vote`,{method:'POST',body:JSON.stringify({name,routeId})}))}catch(error){status.textContent=message(error)}
  }
  async function createVote(event){
    event.preventDefault();const status=$('#voteCreateStatus'),routeIds=savedCandidates().map(route=>route.id),title=new FormData(event.currentTarget).get('title');
    if(routeIds.length<2){status.textContent='Сохрани хотя бы два маршрута.';return}
    status.textContent='Создаю общую ссылку…';
    try{
      const vote=await request('/api/group-votes',{method:'POST',body:JSON.stringify({routeIds,title})});
      const url=new URL(location.href);url.searchParams.set('vote',vote.id);url.hash='group-vote';history.pushState({},'',`${url.pathname}${url.search}${url.hash}`);
      event.currentTarget.hidden=true;renderBoard(vote);startRefresh();await copyLink();
    }catch(error){status.textContent=message(error)}
  }
  async function load(code){
    const host=$('#voteBoard');if(host)host.innerHTML='<div class="vote-board-empty"><span>02 / LIVE VOTE</span><strong>Загружаю<br>голоса…</strong></div>';
    try{$('#voteCreateForm').hidden=true;renderBoard(await request(`/api/group-votes/${encodeURIComponent(code)}`));startRefresh();setTimeout(()=>$('#group-vote')?.scrollIntoView({block:'start'}),80)}catch(error){if(host)host.innerHTML=`<div class="vote-board-empty error"><span>VOTE NOT FOUND</span><strong>Ссылка не найдена<br>или устарела.</strong><p>${esc(message(error))}</p><button type="button" class="vote-action" data-new-vote>СОЗДАТЬ НОВОЕ →</button></div>`;host?.querySelector('[data-new-vote]')?.addEventListener('click',newVote)}
  }
  function startRefresh(){clearInterval(refreshTimer);refreshTimer=setInterval(async()=>{if(!current||document.hidden||$('#voteBoard')?.contains(document.activeElement))return;try{renderBoard(await request(`/api/group-votes/${current.id}`))}catch{}},8000)}
  function init(options){
    routes=options.routes||[];savedStore=options.savedStore;refreshShortlist();
    if(!initialized){initialized=true;$('#voteCreateForm')?.addEventListener('submit',createVote);$('#openGroupVote')?.addEventListener('click',()=>{$('#group-vote')?.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>$('#voteCreateForm input')?.focus(),400)});window.addEventListener('tatry:saved-routes',refreshShortlist)}
    const code=new URLSearchParams(location.search).get('vote');if(code)load(code);
  }
  window.TatryGroupVote={init,refreshShortlist};
})();
