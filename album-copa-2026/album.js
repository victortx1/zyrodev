const PACKS_PER_DAY=3;
const CARDS_PER_PACK=5;
const STORAGE={collected:"zyro_album_2026_collected",duplicates:"zyro_album_2026_duplicates",daily:"zyro_album_2026_daily"};

const allCards=window.ZYRO_ALBUM_TEAMS.flatMap((team,ti)=>team.players.map((p,pi)=>({
  id:`${team.code}-${String(pi+1).padStart(2,"0")}`,
  number:ti*100+pi+1,
  team:team.name,
  code:team.code,
  flag:team.flag,
  name:p.name,
  club:p.club||"",
  position:p.position,
  rarity:p.rarity||autoRarity(p.name,p.position,pi)
})));

function autoRarity(name,pos,i){
  const stars=["Messi","Cristiano","Neymar","Mbappé","Haaland","Salah","Vini","Vinícius","Bellingham","Kane","Son","De Bruyne","Modrić","Sadio","Ochoa","Lewandowski","Hakimi","Pulisic","Yamal","Ronaldo"];
  if(stars.some(s=>name.toLowerCase().includes(s.toLowerCase()))) return "Lendária";
  if(pos==="Atacante"&&i%3===0) return "Épica";
  if(i%4===0) return "Rara";
  return "Comum";
}

let collected=JSON.parse(localStorage.getItem(STORAGE.collected)||"[]");
let duplicates=Number(localStorage.getItem(STORAGE.duplicates)||0);
let daily=JSON.parse(localStorage.getItem(STORAGE.daily)||"null");
const today=new Date().toLocaleDateString("pt-BR");
if(!daily||daily.date!==today){daily={date:today,packsLeft:PACKS_PER_DAY};saveDaily();}

const $=id=>document.getElementById(id);
const packsLeft=$("packsLeft"),progress=$("progress"),duplicatesEl=$("duplicates"),teamCount=$("teamCount"),openPackBtn=$("openPackBtn"),packArea=$("packArea"),albumGrid=$("albumGrid"),toast=$("toast"),teamFilter=$("teamFilter");

function saveDaily(){localStorage.setItem(STORAGE.daily,JSON.stringify(daily))}
function save(){localStorage.setItem(STORAGE.collected,JSON.stringify(collected));localStorage.setItem(STORAGE.duplicates,String(duplicates));saveDaily()}
function msg(t){toast.textContent=t;toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),2300)}
function rarityClass(r){return r==="Lendária"?"lendaria":r==="Épica"?"epica":r==="Rara"?"rara":""}
function rarityWeight(r){return r==="Comum"?68:r==="Rara"?23:r==="Épica"?7:2}
function weightedRandom(){
  const expanded=[];
  allCards.forEach(c=>{for(let i=0;i<rarityWeight(c.rarity);i++) expanded.push(c)});
  return expanded[Math.floor(Math.random()*expanded.length)];
}
function update(){
  packsLeft.textContent=daily.packsLeft;
  progress.textContent=`${collected.length}/${allCards.length}`;
  duplicatesEl.textContent=duplicates;
  teamCount.textContent=window.ZYRO_ALBUM_TEAMS.length;
  openPackBtn.disabled=daily.packsLeft<=0;
}
function cardHTML(c,locked=false){
  return `<div class="num">#${String(c.number).padStart(3,"0")} • ${c.flag}</div>
  <div class="ball"></div>
  <div class="name">${locked?"???":c.name}</div>
  <div class="team">${c.team}</div>
  <div class="club">${locked?"Carta não colada":c.club}</div>
  <div class="pos">${locked?"Bloqueada":c.position}</div>
  <div class="rarity">${locked?"Bloqueada":c.rarity}</div>`;
}
function createCard(c,fromPack=false){
  const has=collected.includes(c.id);
  const div=document.createElement("article");
  div.className=`card ${rarityClass(c.rarity)} ${has?"collected":""}`;
  div.innerHTML=cardHTML(c,false);
  if(fromPack){
    const b=document.createElement("button");
    if(has){b.textContent="Repetida";b.disabled=true}
    else{b.textContent="Colar no álbum";b.onclick=()=>{collected.push(c.id);save();renderAlbum();update();b.textContent="Colada";b.disabled=true;div.classList.add("collected");msg("Carta colada!")}}
    div.appendChild(b);
  }
  return div;
}
function renderAlbum(){
  albumGrid.innerHTML="";
  const selected=teamFilter.value||"ALL";
  const list=selected==="ALL"?allCards:allCards.filter(c=>c.code===selected);
  list.forEach(c=>{
    const has=collected.includes(c.id);
    const div=document.createElement("article");
    div.className=`card ${rarityClass(c.rarity)} ${has?"collected":"empty"}`;
    div.innerHTML=cardHTML(c,!has);
    albumGrid.appendChild(div);
  });
}
function openPack(){
  if(daily.packsLeft<=0){msg("Você já abriu os 3 pacotes de hoje.");return}
  packArea.innerHTML="";
  const pack=Array.from({length:CARDS_PER_PACK},weightedRandom);
  pack.forEach(c=>{if(collected.includes(c.id))duplicates++;packArea.appendChild(createCard(c,true))});
  daily.packsLeft--;save();update();msg("Pacote aberto!");
}
function fillTeams(){
  teamFilter.innerHTML=`<option value="ALL">Todas as seleções</option>`+window.ZYRO_ALBUM_TEAMS.map(t=>`<option value="${t.code}">${t.flag} ${t.name}</option>`).join("");
  teamFilter.onchange=renderAlbum;
}
$("resetBtn").onclick=()=>{if(confirm("Resetar álbum neste navegador?")){localStorage.removeItem(STORAGE.collected);localStorage.removeItem(STORAGE.duplicates);localStorage.removeItem(STORAGE.daily);location.reload()}};
openPackBtn.onclick=openPack;
fillTeams();renderAlbum();update();
