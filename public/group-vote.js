(function(){
  'use strict';
  const NAME_KEY='tatry-field:vote-name:v1';
  let routes=[],savedStore=null,current=null,refreshTimer=null,initialized=false;
  const $=selector=>document.querySelector(selector);
  const i18n=window.TatryI18n||{isEnglish:false,tr:(ru)=>ru,routeHref:id=>`/route/${id}`};
  const tr=i18n.tr;
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const routeById=id=>routes.find(route=>route.id===id);

  function savedCandidates(){return (savedStore?.get()||[]).map(routeById).filter(Boolean)}
  function voteUrl(id){const url=new URL(location.href);url.search='';url.searchParams.set('vote',id);url.hash='group-vote';return url.toString()}
  function rememberedName(){try{return localStorage.getItem(NAME_KEY)||''}catch{return ''}}
  function rememberName(name){try{localStorage.setItem(NAME_KEY,name)}catch{}}
  function message(error){return error?.message||tr('Что-то не сработало. Попробуй ещё раз.','Something did not work. Try again.')}
  async function request(url,options){const response=await fetch(url,{...options,headers:{'content-type':'application/json',...(options?.headers||{})}});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||`${tr('Ошибка','Error')} ${response.status}`);return data.vote}

  function refreshShortlist(){
    const host=$('#voteShortlist'),button=$('#createGroupVote'),candidates=savedCandidates();if(!host)return;
    host.innerHTML=candidates.length?candidates.map((route,index)=>`<div class="vote-shortlist-item"><span>${String(index+1).padStart(2,'0')}</span><b>${esc(route.name)}</b><small>${route.hours} ${tr('ч','h')} · +${route.ascent} ${tr('м','m')} · ${route.diff}/5</small></div>`).join(''):`<p>${tr('Сначала сохрани минимум два маршрута.','Save at least two routes first.')}</p>`;
    if(button)button.disabled=candidates.length<2;
    const trayButton=$('#openGroupVote');if(trayButton)trayButton.disabled=candidates.length<2;
  }

  function totals(vote){return Object.fromEntries(vote.routeIds.map(id=>[id,vote.votes.filter(item=>item.routeId===id)]))}
  function resultLabel(vote,counts){
    if(!vote.votes.length)return tr('Первый голос пока свободен.','The first vote is still open.');
    const max=Math.max(...Object.values(counts).map(list=>list.length));
    const leaders=vote.routeIds.filter(id=>counts[id].length===max).map(id=>routeById(id)?.name).filter(Boolean);
    return leaders.length===1?`${tr('Сейчас лидирует','Current leader')}: ${leaders[0]}.`:`${tr('Пока ничья','Currently tied')}: ${leaders.join(' / ')}.`;
  }
  function renderBoard(vote){
    current=vote;const host=$('#voteBoard');if(!host)return;
    const grouped=totals(vote);const known=rememberedName().trim().toLocaleLowerCase('ru-RU');const mine=vote.votes.find(item=>item.name.trim().toLocaleLowerCase('ru-RU')===known);
    const cards=vote.routeIds.map((id,index)=>{const route=routeById(id);if(!route)return '';const voters=grouped[id];return `<label class="vote-option${mine?.routeId===id?' mine':''}"><input type="radio" name="routeId" value="${id}" ${mine?.routeId===id?'checked':''}><span class="vote-option-index">${String(index+1).padStart(2,'0')}</span><span class="vote-option-copy"><b>${esc(route.name)}</b><small>${route.hours} ${tr('ч','h')} · ${route.km} ${tr('км','km')} · +${route.ascent} ${tr('м','m')} · ${route.chains?tr('цепи','chains'):tr('без цепей','no chains')}</small></span><strong>${voters.length}</strong><span class="vote-people">${voters.length?voters.map(voter=>`<i>${esc(voter.name)}</i>`).join(''):`<i>${tr('пока без голосов','no votes yet')}</i>`}</span><a href="${i18n.routeHref(id)}" target="_blank">${tr('посмотреть маршрут ↗','view route ↗')}</a></label>`}).join('');
    host.innerHTML=`<header class="vote-live-head"><div><span>02 / LIVE VOTE · ${esc(vote.id)}</span><h3>${esc(vote.title)}</h3><p>${esc(resultLabel(vote,grouped))} ${tr('Всего голосов','Total votes')}: ${vote.votes.length}.</p></div><button type="button" class="vote-new" data-new-vote>${tr('НОВОЕ','NEW')}</button></header><div class="vote-share"><input value="${esc(voteUrl(vote.id))}" readonly aria-label="${tr('Ссылка на голосование','Vote link')}"><button type="button" data-copy-vote>${tr('КОПИРОВАТЬ ССЫЛКУ','COPY LINK')}</button><span data-copy-status></span></div><form class="vote-cast" id="voteCastForm"><label class="vote-name">${tr('Твоё имя','Your name')}<input name="name" maxlength="32" minlength="2" required autocomplete="name" value="${esc(rememberedName())}" placeholder="${tr('например, Дима','for example, Alex')}"></label><fieldset><legend>${tr('Выбери один маршрут. Голос можно изменить.','Choose one route. You can change your vote.')}</legend>${cards}</fieldset><button type="submit" class="vote-action">${mine?tr('ИЗМЕНИТЬ ГОЛОС →','CHANGE VOTE →'):tr('ПРОГОЛОСОВАТЬ →','VOTE →')}</button><p class="vote-status" id="voteCastStatus"></p></form>`;
    host.querySelector('[data-copy-vote]')?.addEventListener('click',copyLink);
    host.querySelector('[data-new-vote]')?.addEventListener('click',newVote);
    host.querySelector('#voteCastForm')?.addEventListener('submit',castVote);
  }

  async function copyLink(){
    const status=$('[data-copy-status]'),value=voteUrl(current.id);
    try{await navigator.clipboard.writeText(value);status.textContent=tr('Скопировано ✓','Copied ✓')}catch{const input=$('.vote-share input');input?.select();document.execCommand('copy');status.textContent=tr('Скопировано ✓','Copied ✓')}
    setTimeout(()=>{if(status)status.textContent=''},1800);
  }
  function newVote(){
    current=null;clearInterval(refreshTimer);refreshTimer=null;
    const url=new URL(location.href);url.searchParams.delete('vote');history.pushState({},'',`${url.pathname}${url.search}${url.hash}`);
    $('#voteBoard').innerHTML=`<div class="vote-board-empty"><span>02 / LIVE VOTE</span><strong>${tr('Готово для нового<br>голосования.','Ready for a new<br>vote.')}</strong><p>${tr('Обнови сохранённые маршруты и создай следующую ссылку.','Update the saved routes and create another link.')}</p></div>`;
    $('#voteCreateForm').hidden=false;refreshShortlist();
  }
  async function castVote(event){
    event.preventDefault();const form=event.currentTarget,status=$('#voteCastStatus'),data=new FormData(form),name=String(data.get('name')||'').trim(),routeId=String(data.get('routeId')||'');
    if(!routeId){status.textContent=tr('Сначала выбери маршрут.','Choose a route first.');return}
    status.textContent=tr('Сохраняю голос…','Saving vote…');
    try{rememberName(name);renderBoard(await request(`/api/group-votes/${current.id}/vote`,{method:'POST',body:JSON.stringify({name,routeId})}))}catch(error){status.textContent=message(error)}
  }
  async function createVote(event){
    event.preventDefault();const status=$('#voteCreateStatus'),routeIds=savedCandidates().map(route=>route.id),title=new FormData(event.currentTarget).get('title');
    if(routeIds.length<2){status.textContent=tr('Сохрани хотя бы два маршрута.','Save at least two routes.');return}
    status.textContent=tr('Создаю общую ссылку…','Creating the shared link…');
    try{
      const vote=await request('/api/group-votes',{method:'POST',body:JSON.stringify({routeIds,title})});
      const url=new URL(location.href);url.searchParams.set('vote',vote.id);url.hash='group-vote';history.pushState({},'',`${url.pathname}${url.search}${url.hash}`);
      event.currentTarget.hidden=true;renderBoard(vote);startRefresh();await copyLink();
    }catch(error){status.textContent=message(error)}
  }
  async function load(code){
    const host=$('#voteBoard');if(host)host.innerHTML=`<div class="vote-board-empty"><span>02 / LIVE VOTE</span><strong>${tr('Загружаю<br>голоса…','Loading<br>votes…')}</strong></div>`;
    try{$('#voteCreateForm').hidden=true;renderBoard(await request(`/api/group-votes/${encodeURIComponent(code)}`));startRefresh();setTimeout(()=>$('#group-vote')?.scrollIntoView({block:'start'}),80)}catch(error){if(host)host.innerHTML=`<div class="vote-board-empty error"><span>VOTE NOT FOUND</span><strong>${tr('Ссылка не найдена<br>или устарела.','The link was not found<br>or has expired.')}</strong><p>${esc(message(error))}</p><button type="button" class="vote-action" data-new-vote>${tr('СОЗДАТЬ НОВОЕ →','CREATE A NEW VOTE →')}</button></div>`;host?.querySelector('[data-new-vote]')?.addEventListener('click',newVote)}
  }
  function startRefresh(){clearInterval(refreshTimer);refreshTimer=setInterval(async()=>{if(!current||document.hidden||$('#voteBoard')?.contains(document.activeElement))return;try{renderBoard(await request(`/api/group-votes/${current.id}`))}catch{}},8000)}
  function init(options){
    routes=options.routes||[];savedStore=options.savedStore;refreshShortlist();
    if(!initialized){initialized=true;$('#voteCreateForm')?.addEventListener('submit',createVote);$('#openGroupVote')?.addEventListener('click',()=>{$('#group-vote')?.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>$('#voteCreateForm input')?.focus(),400)});window.addEventListener('tatry:saved-routes',refreshShortlist)}
    const code=new URLSearchParams(location.search).get('vote');if(code)load(code);
  }
  window.TatryGroupVote={init,refreshShortlist};
})();
