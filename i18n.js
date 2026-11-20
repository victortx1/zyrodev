(() => {
  const PT = {
    "Configurações do Site":"Site Settings","APARÊNCIA":"APPEARANCE","Preto + laranja":"Black + orange","Branco":"White","Branco + laranja":"White + orange","Configurações":"Settings","Voltar ao site":"Back to site","Salvar":"Save","Salvar alterações":"Save changes","Resetar":"Reset","Tema":"Theme","Idioma":"Language","Português":"Portuguese","English":"English",
    "Início":"Home","Home":"Home","Cursos":"Courses","Curso":"Course","Ranking":"Ranking","Perfil":"Profile","Meu perfil":"My profile","Editar perfil":"Edit profile","Ver perfil público":"View public profile","Voltar ao início":"Back to home","Sair da conta Google":"Sign out of Google",
    "Bate Papo":"Chat","Créditos":"Credits","Login":"Login","Entrar":"Sign in","Sobre":"About","Comunidade":"Community","Atualizações":"Updates","Pesquisar":"Search","Buscar":"Search","Notificações":"Notifications",
    "Loja":"Store","Loja Premium":"Store","ZYRODEV PREMIUM":"ZYRODEV STORE","ZYRODEV STORE":"ZYRODEV STORE","Loja gratuita de personalização":"Free customization store",
    "Molduras":"Frames","Moldura":"Frame","Banners":"Banners","Fotos de perfil":"Profile pictures","Foto de perfil":"Profile picture","Personalização do perfil":"Profile customization",
    "Todas gratuitas para usar no seu perfil.":"All free to use on your profile.","Fundos para deixar seu perfil com a sua identidade.":"Backgrounds to give your profile its own identity.","Avatares gratuitos para escolher no Editar perfil.":"Free avatars to choose in Edit profile.",
    "GRÁTIS":"FREE","Adquirir gratuitamente":"Get for free","Adquirido":"Owned","Como funciona:":"How it works:","clique em Adquirir gratuitamente, o item fica salvo na sua conta e aparece automaticamente no Editar perfil. A loja não possui pagamentos.":"click Get for free, the item is saved to your account and automatically appears in Edit profile. The store has no payments.",
    "Personalize seu perfil.":"Customize your profile.","Escolha molduras, banners e fotos de perfil gratuitas. Adquira com um clique e depois escolha tudo no Editar perfil.":"Choose free frames, banners and profile pictures. Get them with one click and then choose everything in Edit profile.",
    "Nome":"Name","Bio":"Bio","Empresa":"Company","Site / portfólio":"Website / portfolio","opcional":"optional","Cancelar":"Cancel","Carregando...":"Loading...","Carregando perfil...":"Loading profile...",
    "Ativar decoração do perfil":"Enable profile decoration","Brilho no nome":"Name glow","Sem moldura":"No frame","Trusted":"Trusted","Season 1":"Season 1",
    "Sua bio aparece aqui.":"Your bio appears here.","BANNER DO PERFIL":"PROFILE BANNER","ADICIONE UM BANNER NO EDITAR PERFIL":"ADD A BANNER IN EDIT PROFILE",
    "Salvar perfil":"Save profile","Perfil salvo com sucesso!":"Profile saved successfully!","Erro ao carregar perfil.":"Error loading profile.","Não foi possível salvar o perfil.":"Could not save the profile.",
    "Aulas":"Lessons","Conteúdo Gratuito":"Free Content","Tecnologias":"Technologies","Vídeos de Programação":"Programming Videos","Conteúdo Organizado":"Organized Content","Evolução Rápida":"Fast Progress",
    "Entrar no Discord":"Join Discord","Uma comunidade 🇧🇷":"A community 🇧🇷","Redes Sociais":"Social Media","Links":"Links","Informações":"Information","Painel Admin":"Admin Panel","Rodapé":"Footer",
    "Aceitar":"Accept","Agora não":"Not now","Crie sua conta Google":"Create your Google account","Entrar com Google":"Sign in with Google",
    "Admin":"Admin","Administrador":"Administrator","Sair":"Sign out","Voltar":"Back","Adicionar":"Add","Remover":"Remove","Escolher":"Choose","Selecionar":"Select",
    "Personalização":"Customization","Moldura Fogo":"Fire Frame","Moldura Neon":"Neon Frame","Moldura Diamante":"Diamond Frame","Moldura Nova Era":"New Era Frame","Moldura Galáxia":"Galaxy Frame",
    "Banner Aurora":"Aurora Banner","Banner Neon":"Neon Banner","Banner Space":"Space Banner","Banner Sunset":"Sunset Banner","Banner Circuit":"Circuit Banner",
    "Avatar Aurora":"Aurora Avatar","Avatar Neon":"Neon Avatar","Avatar Space":"Space Avatar","Avatar Flame":"Flame Avatar","Avatar Circuit":"Circuit Avatar",
    "Energia e destaque para seu avatar.":"Energy and highlight for your avatar.","Visual moderno com brilho neon.":"Modern neon glow.","Um acabamento brilhante e elegante.":"A bright and elegant finish.","Identidade laranja da ZyroDev.":"ZyroDev orange identity.","Estilo espacial para seu perfil.":"Space style for your profile.",
    "Gradiente espacial com brilho azul.":"Space gradient with blue glow.","Visual tecnológico em neon.":"Neon tech style.","Fundo escuro inspirado no espaço.":"Dark space-inspired background.","Gradiente quente e marcante.":"Warm and bold gradient.","Circuitos e detalhes tecnológicos.":"Circuits and tech details.",
    "Avatar minimalista com laranja.":"Minimal orange avatar.","Avatar com identidade neon.":"Neon identity avatar.","Avatar com estilo espacial.":"Space-style avatar.","Avatar com energia de fogo.":"Flame-energy avatar.","Avatar tecnológico.":"Tech avatar.",
    "Foi adicionado à sua conta.":"was added to your account.","Não foi possível adquirir o item.":"Could not acquire the item.","Não foi possível carregar sua conta.":"Could not load your account.",
    "Aprenda a programar de graça com a ZyroDev.":"Learn to code for free with ZyroDev.","Aprenda a programar":"Learn to code","de graça":"for free","com a":"with",
    "Conteúdo Gratuito":"Free Content","Comunidade":"Community","Curso exclusivo":"Exclusive course",
    "Mudar idioma":"Change language","Idioma do site":"Site language"
  };
  const exact = PT;
  const phrasePairs = Object.entries(PT).filter(([a,b])=>a.length>=5).sort((a,b)=>b[0].length-a[0].length);

  function lang(){ return localStorage.getItem("zyrodev_language") || "pt-BR"; }
  function translateText(s){
    if(lang().startsWith("pt")) return s;
    let out=s;
    const trimmed=s.trim();
    if(exact[trimmed]) {
      const start=s.indexOf(trimmed), end=start+trimmed.length;
      return s.slice(0,start)+exact[trimmed]+s.slice(end);
    }
    for(const [a,b] of phrasePairs) out=out.split(a).join(b);
    return out;
  }
  function translateAttr(el, attr){
    if(!el.hasAttribute(attr)) return;
    const v=el.getAttribute(attr), translated=translateText(v);
    if(translated!==v) el.setAttribute(attr,translated);
  }
  function apply(){
    document.documentElement.setAttribute("lang",lang());
    document.title=translateText(document.title);
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode(node){
      const p=node.parentElement;
      if(!p || ["SCRIPT","STYLE","NOSCRIPT"].includes(p.tagName)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }});
    const nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n=>{const v=n.nodeValue, t=translateText(v); if(t!==v)n.nodeValue=t;});
    document.querySelectorAll("input,textarea").forEach(el=>{translateAttr(el,"placeholder");});
    document.querySelectorAll("[title],[alt]").forEach(el=>{translateAttr(el,"title");translateAttr(el,"alt");});
    document.querySelectorAll("[data-i18n-html]").forEach(el=>{
      const key=el.getAttribute("data-i18n-html");
      const htmlMap={
        freeStoreTitle:["Personalize seu <span>perfil.</span>","Customize your <span>profile.</span>"]
      };
      if(htmlMap[key]) el.innerHTML=lang().startsWith("pt")?htmlMap[key][0]:htmlMap[key][1];
    });
    document.querySelectorAll("[data-i18n]").forEach(el=>{
      const key=el.getAttribute("data-i18n");
      const dict={
        storeName:["Loja","Store"],freeStoreEyebrow:["ZYRODEV STORE","ZYRODEV STORE"],
        freeStoreTitle:["Personalize seu <span>perfil.</span>","Customize your <span>profile.</span>"],
        freeStoreDescription:["Deixa seu perfil com a sua identidade.","Give your profile your own personal touch.."],
        framesTitle:["Molduras","Frames"],framesSubtitle:["Todas gratuitas para usar no seu perfil.","All free to use on your profile."],
        bannersTitle:["Banners","Banners"],bannersSubtitle:["Fundos para deixar seu perfil com a sua identidade.","Backgrounds to give your profile its own identity."],
        avatarsTitle:["Fotos de perfil","Profile pictures"],avatarsSubtitle:["Avatares gratuitos para escolher no Editar perfil.","Free avatars to choose in Edit profile."],
        storeHowTitle:["Como funciona:","How it works:"],storeHowText:["clique em Adquirir gratuitamente, o item fica salvo na sua conta e aparece automaticamente no Editar perfil. A loja não possui pagamentos.","click Get for free, the item is saved to your account and automatically appears in Edit profile. The store has no payments."],
        freeStoreFooter:["Loja gratuita de personalização","Free customization store"],freeTag:["GRÁTIS","FREE"],freePrice:["GRÁTIS","FREE"],owned:["Adquirido","Owned"],acquireFree:["Adquirir gratuitamente","Get for free"],ownedEdit:["Adquirido • Editar perfil","Owned • Edit profile"],
        addedToAccount:["foi adicionado à sua conta.","was added to your account."],storeError:["Não foi possível adquirir o item.","Could not acquire the item."],storeLoadError:["Não foi possível carregar sua conta.","Could not load your account."],
        courses:["Cursos","Courses"],myProfile:["Meu perfil","My profile"]
      };
      if(dict[key]) el.innerHTML=lang().startsWith("pt")?dict[key][0]:dict[key][1];
    });
  }
  window.ZyroI18n={t(key){
    const map={freeTag:lang().startsWith("pt")?"GRÁTIS":"FREE",freePrice:lang().startsWith("pt")?"GRÁTIS":"FREE",owned:lang().startsWith("pt")?"Adquirido":"Owned",acquireFree:lang().startsWith("pt")?"Adquirir gratuitamente":"Get for free",ownedEdit:lang().startsWith("pt")?"Adquirido • Editar perfil":"Owned • Edit profile",addedToAccount:lang().startsWith("pt")?"foi adicionado à sua conta.":"was added to your account.",storeError:lang().startsWith("pt")?"Não foi possível adquirir o item.":"Could not acquire the item.",storeLoadError:lang().startsWith("pt")?"Não foi possível carregar sua conta.":"Could not load your account."}; return map[key]||key;}};
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",apply);
  else apply();
  // Observe dynamic content without allowing apply() to trigger itself forever.
  let applying = false;
  const obs=new MutationObserver(()=>{
    if(applying) return;
    applying = true;
    obs.disconnect();
    try { apply(); } finally {
      applying = false;
      obs.observe(document.body,{childList:true,subtree:true});
    }
  });
  obs.observe(document.body,{childList:true,subtree:true});
  window.addEventListener("storage",e=>{if(e.key==="zyrodev_language") location.reload();});
})();