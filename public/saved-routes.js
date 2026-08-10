(function(){
  'use strict';
  const STORAGE_KEY='tatry-field:saved-routes:v1';
  const MAX_ROUTES=3;
  let memory=[];

  function normalize(value){
    if(!Array.isArray(value))return [];
    return [...new Set(value.filter(id=>typeof id==='string'&&/^[a-z0-9-]+$/.test(id)))].slice(0,MAX_ROUTES);
  }
  function read(){
    try{
      const stored=normalize(JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]'));
      memory=stored;
      return [...stored];
    }catch{
      return [...memory];
    }
  }
  function emit(ids){
    window.dispatchEvent(new CustomEvent('tatry:saved-routes',{detail:{ids:[...ids]}}));
  }
  function write(value){
    const ids=normalize(value);
    memory=ids;
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(ids))}catch{}
    emit(ids);
    return [...ids];
  }
  function add(id){
    const ids=read();
    if(ids.includes(id))return {ok:true,changed:false,ids};
    if(ids.length>=MAX_ROUTES)return {ok:false,changed:false,reason:'limit',ids};
    return {ok:true,changed:true,ids:write([...ids,id])};
  }
  function remove(id){
    const ids=read();
    const next=ids.filter(savedId=>savedId!==id);
    return {ok:true,changed:next.length!==ids.length,ids:next.length===ids.length?ids:write(next)};
  }
  function toggle(id){return read().includes(id)?remove(id):add(id)}
  function set(ids){return write(ids)}
  function clear(){return write([])}
  function has(id){return read().includes(id)}

  window.addEventListener('storage',event=>{
    if(event.key!==STORAGE_KEY)return;
    let ids=[];
    try{ids=normalize(JSON.parse(event.newValue||'[]'))}catch{}
    memory=ids;
    emit(ids);
  });
  window.TatrySavedRoutes={key:STORAGE_KEY,max:MAX_ROUTES,get:read,set,has,add,remove,toggle,clear};
})();
