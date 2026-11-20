/* ==========================================================================
   GUIA ZYRODEV — tutorial interativo com o robô "Guia Zyro"
   --------------------------------------------------------------------------
   • Script clássico (defer) incluído nas páginas do tour. Não depende de
     nenhum outro arquivo do site e não altera funções existentes.
   • Progresso salvo em localStorage (funciona antes do login) e sincronizado
     com a conta Firebase em  usuarios/{uid}.guiaZyro  (campo próprio; as
     regras do Firestore atuais já permitem o próprio usuário gravar nele).
   • Nenhuma chave/credencial aqui: o Firebase é lido de ./firebase.js, o
     mesmo módulo que o site já usa.
   ========================================================================== */
(function () {
  'use strict';
  if (window.__zyroGuiaCarregado) return;
  window.__zyroGuiaCarregado = true;

  /* ------------------------------------------------------------------ */
  /* Constantes                                                          */
  /* ------------------------------------------------------------------ */
  var KEY = 'zyro_guia_v1';
  var KEY_ANTIGO = 'zyrodev_guia_visto';          // mini-tour antigo de cursos.html
  var KEY_SYNC = 'zyro_guia_sync_sessao';
  var FB_AUTH = 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
  var FB_STORE = 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
  var TOTAL_ETAPAS = 10;
  var ETAPAS = ['Cadastro', 'Página principal', 'Bate-papo', 'Créditos dos professores', 'Configurações',
    'Loja', 'Perfil', 'Mensagens e amigos', 'Aulas e tecnologias', 'Ranking', 'Finalização'];

  // Tecnologias que realmente existem em cursos.html
  var TECH = {
    logica:     { nome: 'Lógica de Programação', pagina: 'logica-programacao.html', nota: 'Recomendado para iniciantes' },
    htmlcss:    { nome: 'HTML e CSS',            pagina: 'cursohtmlecss.html',      nota: 'Sites e páginas' },
    javascript: { nome: 'JavaScript',            pagina: 'javascript.html',         nota: 'Interatividade' },
    python:     { nome: 'Python',                pagina: 'python.html',             nota: 'Versátil' },
    php:        { nome: 'PHP',                   pagina: 'php.html',                nota: 'Back-end web' },
    java:       { nome: 'Java',                  pagina: 'java.html',               nota: 'Orientação a objetos' },
    csharp:     { nome: 'C#',                    pagina: 'csharp.html',             nota: 'Sistemas e jogos' }
  };

  function cardCurso(chave) {
    var t = TECH[chave];
    if (!t) return null;
    var a = document.querySelector('#cardsContainer a[href="' + t.pagina + '"]');
    return a ? (a.closest('.card') || a) : null;
  }
  function cardEscolhido() { return cardCurso(S.tecnologia) || null; }

  /* ------------------------------------------------------------------ */
  /* Passos do tour                                                      */
  /* ------------------------------------------------------------------ */
  // st(id, etapa, página, alvo, título, texto, opções)
  var STEPS = [];
  function st(id, etapa, page, target, title, text, opt) {
    var o = opt || {};
    var s = { id: id, etapa: etapa, page: page, title: title, text: text };
    if (Array.isArray(target) || typeof target === 'string' || typeof target === 'function') s.target = target;
    for (var k in o) s[k] = o[k];
    STEPS.push(s);
  }

  /* ---- Cadastro / login (login.html) ---- */
  st('a1', 0, 'login', null, 'Oi! Eu sou o Guia Zyro',
    '<p>Vou acompanhar você durante todo o tutorial. Primeiro vamos <b>criar sua conta</b> (ou entrar, se você já tem uma). Depois eu mostro a plataforma por dentro.</p>',
    { pos: 'c' });
  st('a2', 0, 'login', ['#btnGoogle'], 'Entrar com Google',
    '<p>O jeito mais rápido: clique em <b>Entrar com Google</b>, escolha sua conta e pronto. A conta é criada (ou acessada) na hora.</p>',
    { dim: false });
  st('a3', 0, 'login', null, 'Cadastro com e-mail',
    '<p>Prefere e-mail? Preencha <b>nome</b>, <b>e-mail</b> e <b>senha</b> (mínimo de 6 caracteres) e clique em <b>Create Account</b>.</p>',
    { union: ['#nomeInput', '#emailInput', '#senhaInput', '.submit-btn'], dim: false });
  st('a4', 0, 'login', ['.register-row'], 'Já tem conta?',
    '<p>Clique em <b>Login</b> para entrar com e-mail e senha. Se esquecer a senha, aparece o link <b>Esqueci minha senha</b>.</p>',
    { dim: false, aguardaAuth: true });

  /* ---- ETAPA 1 — Página principal (index.html) ---- */
  st('i1', 1, 'index', ['.hero-title', '.hero-inner'], 'Esta é a página principal',
    '<p>Aqui começa tudo. A <b>ZyroDev</b> ensina programação <b>de graça</b>, com aulas em vídeo organizadas para quem está começando.</p><p>Vou mostrar cada parte. Clique em <b>Próximo</b> quando quiser.</p>');
  st('i2', 1, 'index', ['.menu-icons'], 'Menu de navegação',
    '<p>Os ícones levam para as áreas principais:</p><ul><li><b>Casa</b>: volta para esta página</li><li><b>Balão</b>: Bate-papo da comunidade</li><li><b>Interrogação</b>: Créditos dos professores</li><li><b>Engrenagem</b>: Configurações</li><li><b>Loja</b>: banners e imagens para o perfil</li></ul>');
  st('i3', 1, 'index', ['#perfilLink'], 'Seu perfil',
    '<p>Aqui aparecem sua <b>foto</b> e seu <b>nome</b>. Clique para abrir o seu perfil. Se você ainda não entrou, o botão mostra <b>Entrar</b>.</p>');
  st('i4', 1, 'index', ['#btnPlayHero'], 'Botão de cursos',
    '<p>Este botão leva à página de <b>cursos</b>, onde ficam todas as aulas. É preciso estar com a conta conectada. Mais adiante vamos lá juntos.</p>');
  st('i5', 1, 'index', ['#zyroFlexCarousel'], 'Tecnologias em destaque',
    '<p>Este carrossel mostra as tecnologias da plataforma. Use as setinhas <b>‹ ›</b> para passar de uma para outra. Daqui a pouco explico cada uma.</p>');
  st('i6', 1, 'index', ['#stat'], 'Números da plataforma',
    '<p>A ZyroDev mostra aqui o tamanho do projeto: quantidade de vídeos, de tecnologias e que o conteúdo é <b>100% gratuito</b>.</p>');
  st('i7', 1, 'index', ['#sobre'], 'O que você encontra aqui',
    '<p>Três pontos fortes: <b>conteúdo organizado</b> para facilitar sua evolução, <b>evolução rápida</b> com bons conteúdos gratuitos e <b>comunidade</b>.</p>');
  st('i8', 1, 'index', ['.zr-community'], 'Comunidade',
    '<p>A ZyroDev também é uma comunidade de devs. O botão <b>Entrar no Discord</b> leva ao servidor, onde você troca experiência com outros estudantes.</p>');
  st('i9', 1, 'index', ['.zyro-footer-container', '#rodape'], 'Rodapé: atalhos e redes',
    '<p>No rodapé ficam atalhos (<b>Créditos</b>, <b>Configurações</b>, <b>Bate Papo</b>), o link de informações do Delar e as redes sociais: <b>YouTube, Instagram, Discord e GitHub</b>.</p>');
  st('i10', 1, 'index', ['.footer-bottom-inner'], 'Direitos autorais',
    '<p>No final da página ficam o aviso <b>© 2026 ZyroDev • Todos os direitos reservados</b> e o link <b>Termos e direitos</b>, que abre as regras e os direitos do site.</p>');
  st('i11', 1, 'index', ['.menu-icons a[href="podepa.html"]'], 'Primeira parada: Bate-papo',
    '<p>Está vendo o ícone do balão? É o <b>Bate-papo</b>. Clique em <b>Próximo</b> e eu levo você até lá.</p>');

  /* ---- ETAPA 2 — Bate-papo (podepa.html) ---- */
  st('p1', 2, 'podepa', ['.chat-header'], 'Bate-papo da comunidade',
    '<p>Esta é a <b>ZYRO PODEPA</b>, o chat da comunidade de programação. Aqui você conversa e troca ideias com outros estudantes. É preciso estar conectado para usar.</p>');
  st('p2', 2, 'podepa', ['#generalBtn', '#menuBtn'], 'Chat Geral',
    '<p>O <b>Chat Geral</b> é a sala onde todo mundo conversa junto. No celular, o botão <b>☰</b> abre este menu.</p>');
  st('p3', 2, 'podepa', ['#messageForm', '#chatSection', '#loginBox'], 'Enviar mensagens',
    '<p>Escreva no campo de texto e clique em <b>Enviar</b> (ou aperte Enter). <b>Shift + Enter</b> quebra a linha. Cada mensagem pode ter até 2.000 caracteres.</p>');
  st('p4', 2, 'podepa', ['.photo-btn'], 'Enviar fotos',
    '<p>O botão da câmera <b>📷</b> envia imagens (JPG, PNG, WEBP ou GIF, até 20 MB). Você também pode arrastar ou colar a imagem na conversa.</p>');
  st('p5', 2, 'podepa', ['#messages'], 'Conhecer as pessoas',
    '<p>Clique na <b>foto</b> de alguém para ver um resumo do perfil e abrir o perfil completo. Assim você descobre quem está na comunidade.</p>');
  st('p6', 2, 'podepa', ['.hint'], 'Regras de convivência',
    '<p>Nada de palavrões: quem escreve é bloqueado do chat por <b>30 minutos</b>. Respeito vem primeiro!</p>');
  st('p7', 2, 'podepa', ['#meBtn'], 'Seu perfil aqui',
    '<p>No canto ficam seu nome e sua foto. Clique para ver o seu perfil.</p>');
  st('p8', 2, 'podepa', null, 'Conversas privadas',
    '<p>Para conversar em particular existe a área <b>Amigos e mensagens</b>, dentro do seu perfil. Lá você procura pessoas pelo nome, adiciona amigos e conversa no privado. Vamos ver isso com calma mais adiante.</p><p>Agora vou levar você de volta à página principal.</p>',
    { pos: 'c' });

  /* ---- Ponte: volta à principal → Créditos ---- */
  st('b3', 3, 'index', ['.menu-icons a[href="creditos.html"]'], 'De volta à página principal',
    '<p>Próxima parada: os <b>Créditos</b>. É o ícone de interrogação. Clique em <b>Próximo</b> para conhecer os professores.</p>');

  /* ---- ETAPA 3 — Créditos (creditos.html) ---- */
  st('c1', 3, 'creditos', ['header'], 'Créditos dos professores',
    '<p>Esta página agradece aos criadores que ajudaram a construir a ZyroDev e a sua evolução. Muitas aulas do site vêm de <b>professores e canais do YouTube</b>.</p>');
  st('c2', 3, 'creditos', ['.container'], 'Quem são os professores',
    '<p>Cada cartão é um professor ou canal: <b>Gustavo Guanabara</b>, <b>DevDojo</b> (Java do iniciante ao avançado), <b>Hashtag Programação</b> (Introdução à Lógica de Programação), <b>Sharpax</b>, <b>Programando Juntos</b> e <b>Aguiar Dev</b>.</p>');
  st('c3', 3, 'creditos', ['.card a'], 'Canais dos professores',
    '<p>O botão <b>Visitar Canal</b> (ou <b>Ver Canal</b>) abre o canal do professor no YouTube, em uma nova aba. Lá você encontra muito mais conteúdo.</p>');
  st('c4', 3, 'creditos', ['footer'], 'Como apoiar os criadores',
    '<p>A forma mais simples de apoiar é <b>visitar os canais</b>, assistir aos vídeos, curtir e se inscrever. A ZyroDev foi criada por <b>DELAR</b>, e os créditos lembram que cada professor merece reconhecimento.</p>');

  /* ---- ETAPA 4 — Configurações (configuracoes.html) ---- */
  st('g1', 4, 'configuracoes', ['.topo'], 'Configurações do site',
    '<p>Aqui você ajusta como o site aparece para você. Vou explicar cada opção que existe nesta página.</p>');
  st('g2', 4, 'configuracoes', function () { return fieldDe('theme'); }, 'Tema',
    '<p>Muda as cores do site: <b>Preto + laranja</b> (padrão), <b>Branco</b> ou <b>Branco + laranja</b>. A mudança vale depois que você clicar em <b>Salvar</b>.</p>');
  st('g3', 4, 'configuracoes', function () { return fieldDe('language'); }, 'Idioma',
    '<p>Escolha entre <b>Português</b> e <b>English</b>. Depois de salvar, o site passa a mostrar os textos no idioma escolhido. (O guia continua em português.)</p>');
  st('g4', 4, 'configuracoes', ['#saveSiteConfig'], 'Salvar',
    '<p>Guarda o que você escolheu, aplica no site e leva você de volta à página principal. Só clique se quiser mudar algo.</p>');
  st('g5', 4, 'configuracoes', ['#resetSiteConfig'], 'Resetar',
    '<p>Volta tudo ao padrão: tema <b>Preto + laranja</b> e idioma <b>Português</b>.</p>');
  st('g6', 4, 'configuracoes', ['#btnPerfilDelar'], 'Perfil do Delar',
    '<p>Abre o perfil público do criador da ZyroDev, o <b>Delar</b>.</p>');
  st('g7', 4, 'configuracoes', ['.actions a[href="./index.html"]'], 'Voltar ao site',
    '<p>Sai das configurações e volta para a página principal.</p>');
  st('g8', 4, 'configuracoes', ['#zyroGuiaConfig'], 'Guia ZyroDev',
    '<p>Aqui você pode <b>ver este guia de novo</b> ou <b>reiniciar</b> quando quiser. Ele também fica disponível no rodapé da página principal.</p>');
  st('g9', 4, 'configuracoes', ['.site-info'], 'Sobre e avisos',
    '<p>Mostra quem criou a ZyroDev (<b>Delarotaldev</b>) e um aviso importante: o site está em constante desenvolvimento, então funções e conteúdos podem mudar.</p>');

  /* ---- ETAPA 5 — Loja (loja-vip.html) ---- */
  st('l1', 5, 'loja-vip', ['.hero'], 'Loja de personalização',
    '<p>Aqui você deixa o perfil com a sua cara. A loja é <b>gratuita</b>: não tem pagamento, nem pontos ou moedas para gastar.</p>');
  st('l2', 5, 'loja-vip', ['#badges'], 'Badges',
    '<p>Os badges (<b>Sócio</b>, <b>Patrocinador</b> e <b>Criador</b>) aparecem para todos. Para receber um, clique em <b>Solicitar badge</b> e aguarde um administrador analisar.</p>');
  st('l3', 5, 'loja-vip', ['#molduras'], 'Molduras',
    '<p>Molduras ficam em volta da sua foto. Várias são gratuitas. Outras são exclusivas (administradores, patrocinadores, criadores e Season 1) e mostram <b>Exclusivo</b> se você não tiver permissão.</p>');
  st('l4', 5, 'loja-vip', ['#banners'], 'Banners',
    '<p>Banners são o fundo do topo do seu perfil. Veja a imagem e a descrição de cada um antes de escolher.</p>');
  st('l5', 5, 'loja-vip', ['#avatars'], 'Fotos de perfil',
    '<p>Avatares prontos para usar no lugar da sua foto.</p>');
  st('l6', 5, 'loja-vip', ['.info'], 'Como conseguir e conferir seus itens',
    '<p>Clique em <b>Adquirir gratuitamente</b>: o item fica salvo na sua conta e o botão muda para <b>Adquirido • Editar perfil</b>. É assim que você confere o que já tem. Para usar, abra o <b>Editar perfil</b>.</p>');
  st('l7', 5, 'loja-vip', ['.nav-actions'], 'Atalhos da loja',
    '<p>Os botões do topo levam aos <b>Cursos</b> e ao <b>Meu perfil</b>. Agora vou levar você de volta à página principal.</p>');
  st('b6', 6, 'index', ['#perfilLink'], 'De volta à página principal',
    '<p>Próxima parada: o seu <b>perfil</b>. É só clicar na sua foto e no seu nome aqui em cima. Clique em <b>Próximo</b> e eu levo você.</p>');

  /* ---- ETAPA 6 — Perfil (perfil.html → editar-perfil.html → perfil-publico.html) ---- */
  st('f1', 6, 'perfil', ['#bannerPerfil'], 'Seu perfil',
    '<p>Esta é a página do <b>seu perfil</b>. No topo fica o seu <b>banner</b>, a imagem de fundo que você escolhe.</p>');
  st('f2', 6, 'perfil', ['#perfilMediaWrap'], 'Sua foto',
    '<p>Sua <b>foto de perfil</b>, com a moldura que você escolher.</p>');
  st('f3', 6, 'perfil', ['.nome-linha'], 'Nome, cargos e distintivos',
    '<p>Seu <b>nome</b> aparece junto dos seus <b>badges</b>. Eles mostram conquistas e cargos, como Fundador, Sócio, Patrocinador ou Criador, e alguns cargos mudam a cor do seu nome.</p>');
  st('f4', 6, 'perfil', ['#bioPerfil'], 'Descrição (bio)',
    '<p>Um texto curto sobre você. Se você preencher <b>empresa</b> e <b>site</b>, eles aparecem logo abaixo.</p>');
  st('f5', 6, 'perfil', ['.acoes'], 'Botões do perfil',
    '<ul><li><b>Editar perfil</b>: muda suas informações</li><li><b>Ver perfil público</b>: como os outros veem você</li><li><b>Amigos e mensagens</b>: conversas privadas</li><li><b>Voltar ao início</b>: página principal</li><li><b>Sair da conta</b>: desconecta (não clique agora, para o guia continuar)</li></ul>');
  st('e1', 6, 'editar-perfil', ['#bannerPreview'], 'Trocar o banner',
    '<p>Em <b>Escolher banner</b> você envia uma imagem de fundo para o perfil. Pode ser grande: o site reduz e comprime sozinho antes de salvar.</p>');
  st('e2', 6, 'editar-perfil', ['.media-row'], 'Trocar a foto',
    '<p>Em <b>Escolher foto</b> você troca a sua foto de perfil.</p>');
  st('e3', 6, 'editar-perfil', ['.grid'], 'Informações pessoais',
    '<p>Edite seu <b>nome</b>, a <b>empresa</b> (opcional), a <b>bio</b> (sua descrição) e o <b>site ou portfólio</b> (opcional).</p>');
  st('e4', 6, 'editar-perfil', ['.vip-panel'], 'Personalização do perfil',
    '<p>Escolha uma <b>moldura</b> para a foto e ative a <b>decoração do perfil</b> ou o <b>brilho no nome</b>. As opções disponíveis dependem do que você adquiriu e das permissões da sua conta.</p>');
  st('e5', 6, 'editar-perfil', ['.collection-panel'], 'Itens da loja',
    '<p>Aqui aparecem os <b>banners</b> e as <b>fotos de perfil</b> que você adquiriu na loja. É só escolher.</p>');
  st('e6', 6, 'editar-perfil', ['#btnSalvar'], 'Salvar alterações',
    '<p>Nada muda no seu perfil até você clicar em <b>Salvar alterações</b>. <b>Cancelar</b> descarta o que você mexeu.</p>');
  st('u1', 6, 'perfil-publico', ['.stats-grid'], 'Pontos e curtidas',
    '<p>Aqui você vê a sua <b>Pontuação</b> e as <b>Curtidas recebidas</b>. Os pontos vêm das aulas que você conclui; as curtidas vêm de outras pessoas.</p>',
    { href: function () { return 'perfil-publico.html?uid=' + encodeURIComponent(U ? U.uid : ''); }, precisaLogin: true });
  st('u2', 6, 'perfil-publico', ['.like-area'], 'Curtir perfis',
    '<p>No perfil de outra pessoa aparece o botão <b>Curtir perfil</b>: dá para curtir <b>1 vez por dia</b> cada pessoa. No seu próprio perfil o botão fica desativado.</p>',
    { precisaLogin: true });

  /* ---- ETAPA 7 — Mensagens e amigos (amizades.html) ---- */
  st('m1', 7, 'amizades', ['.top'], 'Amigos e mensagens',
    '<p>Aqui você encontra pessoas, adiciona amigos e conversa em particular. Para chegar aqui: <b>perfil → Amigos e mensagens</b>.</p>');
  st('m2', 7, 'amizades', ['.search'], 'Encontrar pessoas',
    '<p>Digite o <b>nome</b> da pessoa e clique na lupa <b>⌕</b>. Os resultados aparecem logo abaixo.</p>');
  st('m3', 7, 'amizades', ['.search'], 'Adicionar amigos',
    '<p>Em cada resultado aparece o botão <b>Adicionar</b>. Ao clicar, a pessoa entra na sua lista de amigos.</p>');
  st('m4', 7, 'amizades', ['#friends'], 'Meus amigos',
    '<p>Todos os seus amigos ficam nesta lista. Clique em um deles para abrir a conversa.</p>');
  st('m5', 7, 'amizades', ['main.chat', '#chatHead'], 'Conversar',
    '<p>Com um amigo selecionado aparece o campo para escrever. Digite e clique em <b>Enviar</b>. As mensagens que você recebe aparecem aqui, na conversa. O chat privado aceita só <b>texto</b> por enquanto (versão de teste).</p>');
  st('m6', 7, 'amizades', null, 'Convidar amigos',
    '<p>Quer trazer um amigo? Chame-o para criar a conta na ZyroDev ou para o Discord da comunidade. Depois é só procurar o nome dele aqui. Para falar com todo mundo, use o <b>Bate-papo</b> da página principal.</p>',
    { pos: 'c' });

  /* ---- ETAPA 8 — Aulas e tecnologias (cursos.html) ---- */
  st('s1', 8, 'cursos', ['.section-top'], 'Aulas e tecnologias',
    '<p>Aqui ficam <b>todas as aulas</b>. Cada cartão é um curso, com o número de aulas e o seu progresso.</p>');
  st('s2', 8, 'cursos', function () { return cardCurso('logica'); }, 'Quem nunca programou começa aqui',
    '<p>Se você nunca programou, comece por <b>Lógica de Programação</b>.</p><p><b>O que é:</b> aprender a pensar em passos para resolver um problema, antes de escrever código.</p><p><b>Por que primeiro:</b> toda linguagem usa a mesma base (decisões, repetições, variáveis). Quem aprende lógica entende qualquer linguagem mais rápido.</p>',
    { inline: true });
  st('s3', 8, 'cursos', function () { var c = cardCurso('logica'); return c ? (c.querySelector('.btn') || c) : null; }, 'Como achar as aulas para iniciantes',
    '<p>É o primeiro cartão, marcado como <b>Iniciante</b>. Clique em <b>Assistir</b> para abrir as aulas. Seu progresso aparece no próprio cartão.</p>',
    { inline: true });
  st('s4', 8, 'cursos', ['.search-box'], 'Buscar um curso',
    '<p>Use a busca para achar um curso pelo nome e as setas <b>‹ ›</b> para passar pelos cartões.</p><p>Agora vou apresentar as tecnologias disponíveis.</p>');
  st('s5', 8, 'cursos', function () { return cardCurso('htmlcss'); }, 'HTML e CSS',
    '<p><b>HTML</b> monta a estrutura da página (títulos, textos, imagens, botões) e <b>CSS</b> cuida da aparência (cores, tamanhos, layout).</p><p><b>Pontos positivos:</b> você vê o resultado no navegador na hora e é a base de todo site.</p><p><b>Serve para:</b> criar sites e páginas (front-end).</p>',
    { inline: true });
  st('s6', 8, 'cursos', function () { return cardCurso('javascript'); }, 'JavaScript',
    '<p>Dá vida às páginas: botões que reagem, menus, formulários, jogos.</p><p><b>Pontos positivos:</b> roda direto no navegador e combina com HTML e CSS.</p><p><b>Serve para:</b> sites interativos e aplicações web.</p>',
    { inline: true });
  st('s7', 8, 'cursos', function () { return cardCurso('python'); }, 'Python',
    '<p><b>Pontos positivos:</b> escrita simples e fácil de ler, ótima para começar.</p><p><b>Serve para:</b> automações, sistemas, análise de dados e muito mais.</p>',
    { inline: true });
  st('s8', 8, 'cursos', function () { return cardCurso('php'); }, 'PHP',
    '<p>Linguagem de <b>back-end</b>: roda no servidor.</p><p><b>Pontos positivos:</b> muito usada na web e ajuda a entender a lógica do servidor.</p><p><b>Serve para:</b> criar sites e sistemas web mais completos.</p>',
    { inline: true });
  st('s9', 8, 'cursos', function () { return cardCurso('java'); }, 'Java',
    '<p>Linguagem forte, com <b>orientação a objetos</b>.</p><p><b>Pontos positivos:</b> dá uma base sólida para sistemas maiores.</p><p><b>Serve para:</b> sistemas e aplicações de grande porte.</p>',
    { inline: true });
  st('s10', 8, 'cursos', function () { return cardCurso('csharp'); }, 'C#',
    '<p><b>Pontos positivos:</b> ótima para aprender lógica e orientação a objetos.</p><p><b>Serve para:</b> sistemas e jogos.</p>',
    { inline: true });
  st('s11', 8, 'cursos', ['#cardsContainer', '.carousel-wrapper'], 'Escolha por onde começar',
    '<p>Qual tecnologia você quer estudar primeiro? Toque em uma opção abaixo. Eu mostro o cartão dela e, no fim do tour, levo você direto para as aulas.</p>',
    { escolher: true });
  st('s12', 8, 'cursos', cardEscolhido, function () {
    return 'Boa escolha: ' + (TECH[S.tecnologia] ? TECH[S.tecnologia].nome : 'sua tecnologia');
  }, function () {
    var t = TECH[S.tecnologia];
    var extra = S.tecnologia === 'logica' ? ' Ótimo começo para quem está começando!' : '';
    return '<p>Este é o cartão de <b>' + (t ? t.nome : 'sua tecnologia') + '</b>.' + extra + ' Quando quiser estudar, clique em <b>Assistir</b>.</p><p>Falta pouco: ainda vou mostrar o ranking.</p>';
  }, { inline: true });

  /* ---- ETAPA 9 — Ranking (cursos.html → ranking.html) ---- */
  st('r1', 9, 'cursos', ['.ranking-btn'], 'Ranking dos Estudantes',
    '<p>Este botão abre o <b>ranking</b>. Clique em <b>Próximo</b> e vamos juntos.</p>');
  st('r2', 9, 'ranking', ['.ranking-header'], 'Como funciona a classificação',
    '<p>O <b>Top 10 ZyroDev</b> mostra os estudantes com mais pontos. A ordem é: mais <b>pontos</b> primeiro; se empatar, mais <b>curtidas</b>; depois o nome.</p>');
  st('r3', 9, 'ranking', ['#top3', '#loadingBox'], 'Pódio',
    '<p>Os 3 primeiros ficam no pódio, com foto, nome, pontos <b>⭐</b> e curtidas <b>♥</b>.</p>');
  st('r4', 9, 'ranking', ['.table-wrapper', '#loadingBox'], 'Acompanhar outros participantes',
    '<p>Da 4ª à 10ª posição a lista mostra <b>Posição, Perfil, Curtidas e Pontos</b>. Clique em qualquer pessoa para abrir o perfil dela e ver quem está evoluindo.</p>');
  st('r5', 9, 'ranking', null, 'Como ganhar pontos',
    '<ul><li><b>+5 pontos</b> a cada aula que você conclui (botão de concluir dentro da aula)</li><li><b>+25 pontos extras</b> e o selo do curso quando você conclui todas as aulas dele</li></ul><p>Cada aula só conta uma vez.</p>',
    { pos: 'c' });
  st('r6', 9, 'ranking', null, 'Curtidas e a sua posição',
    '<p><b>Curtidas:</b> cada pessoa pode curtir o seu perfil 1 vez por dia. Elas aparecem no seu perfil e servem de desempate no ranking.</p><p><b>Sua posição:</b> o ranking mostra só o Top 10. Se você estiver entre os 10 primeiros, aparece aqui; seus pontos sempre aparecem no seu perfil.</p><p>Estude um pouco todo dia e suba de posição!</p>',
    { pos: 'c' });

  /* ---- ETAPA 10 — Finalização (index.html) ---- */
  st('z1', 10, 'index', null, 'Tudo pronto!',
    '<p>Parabéns! Você conheceu a ZyroDev e agora está pronto para começar sua jornada na programação. Escolha sua primeira tecnologia, explore nossas aulas e evolua com a comunidade!</p>',
    { pos: 'c', ultimo: true });

  var IDX = {};
  STEPS.forEach(function (s, i) { IDX[s.id] = i; });
  var PRIMEIRO_AUTH = IDX.a1;
  var PRIMEIRO_TOUR = IDX.i1;
  var TOTAL_TOUR = STEPS.length - PRIMEIRO_TOUR;

  /* ------------------------------------------------------------------ */
  /* Utilidades                                                          */
  /* ------------------------------------------------------------------ */
  function nomePagina() {
    var p = (location.pathname || '/').split('/').pop().toLowerCase();
    if (!p) return 'index';
    return p.replace(/\.html?$/, '');
  }
  var PAGE = nomePagina();
  function q1(sel) { try { return document.querySelector(sel); } catch (e) { return null; } }
  function fieldDe(chave) {
    var i = q1('[data-config-key="' + chave + '"]');
    return i ? (i.closest('.setting-field') || i) : null;
  }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function visivel(e) {
    if (!e || !e.getBoundingClientRect) return false;
    var r = e.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    if (r.right <= 0 || r.left >= window.innerWidth) return false;
    var cs = window.getComputedStyle(e);
    return cs.visibility !== 'hidden' && cs.display !== 'none';
  }
  function fixoOuSticky(e) {
    for (var n = e; n && n.nodeType === 1; n = n.parentElement) {
      var p = window.getComputedStyle(n).position;
      if (p === 'fixed' || p === 'sticky') return true;
    }
    return false;
  }
  var mobile = function () { return window.innerWidth <= 640; };

  /* ------------------------------------------------------------------ */
  /* Estado (localStorage + Firebase)                                    */
  /* ------------------------------------------------------------------ */
  var S = lerLocal();
  var U = null;          // usuário autenticado (Firebase)
  var cur = -1;          // índice do passo atual

  function estadoVazio() {
    return { v: 1, escolha: null, passo: null, fase: null, concluido: false, pulado: false, tecnologia: null, t: 0, dirty: false };
  }
  function lerLocal() {
    try {
      var j = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (j && typeof j === 'object') return Object.assign(estadoVazio(), j);
    } catch (e) { /* ignora */ }
    return estadoVazio();
  }
  function salvarLocal() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignora */ }
  }
  function decidido() { return S.escolha === 'nao' || S.concluido || S.pulado; }
  function ativo() { return S.escolha === 'sim' && !S.concluido && !S.pulado; }
  function marcarAntigoVisto() { try { localStorage.setItem(KEY_ANTIGO, '1'); } catch (e) { /* ignora */ } }
  function tocar() {
    S.t = Date.now();
    S.dirty = true;
    salvarLocal();
    agendarPush();
  }

  var fbPromise = null;
  function carregarFb() {
    if (!fbPromise) {
      fbPromise = Promise.all([import('./firebase.js'), import(FB_AUTH), import(FB_STORE)]).then(function (m) {
        return { auth: m[0].auth, db: m[0].db, A: m[1], F: m[2] };
      });
    }
    return fbPromise;
  }
  function aguardarAuth() {
    return carregarFb().then(function (fb) {
      return new Promise(function (resolve) {
        var feito = false;
        var to = setTimeout(function () { if (!feito) { feito = true; resolve(fb.auth.currentUser || null); } }, 4500);
        fb.A.onAuthStateChanged(fb.auth, function (u) {
          U = u || null;
          if (!feito) { feito = true; clearTimeout(to); resolve(U); }
        });
      });
    }).catch(function () { return null; });
  }

  function dadosRemotos() {
    return {
      escolha: S.escolha, passo: S.passo, fase: S.fase, concluido: !!S.concluido,
      pulado: !!S.pulado, tecnologia: S.tecnologia || null, t: S.t || Date.now()
    };
  }
  var pushTimer = null;
  function agendarPush() {
    clearTimeout(pushTimer);
    pushTimer = setTimeout(pushRemoto, 500);
  }
  function pushRemoto() {
    if (!U) return Promise.resolve();
    return carregarFb().then(function (fb) {
      return fb.F.updateDoc(fb.F.doc(fb.db, 'usuarios', U.uid), { guiaZyro: dadosRemotos() });
    }).then(function () { S.dirty = false; salvarLocal(); }).catch(function (e) {
      if (window.console) console.warn('[Guia Zyro] não foi possível sincronizar o progresso agora:', e && e.code ? e.code : e);
    });
  }
  function adotarRemoto(r) {
    var n = estadoVazio();
    n.escolha = r.escolha === 'sim' || r.escolha === 'nao' ? r.escolha : null;
    n.passo = IDX[r.passo] != null ? r.passo : null;
    n.concluido = !!r.concluido;
    n.pulado = !!r.pulado;
    n.tecnologia = TECH[r.tecnologia] ? r.tecnologia : null;
    n.t = Number(r.t) || 0;
    n.fase = r.fase || null;
    S = n;
    salvarLocal();
  }
  function sincronizar() {
    if (!U) return Promise.resolve();
    return carregarFb().then(function (fb) {
      return fb.F.getDoc(fb.F.doc(fb.db, 'usuarios', U.uid));
    }).then(function (snap) {
      var r = snap.exists() ? snap.data().guiaZyro : null;
      if (r && typeof r === 'object') {
        var remotoMaisNovo = (Number(r.t) || 0) > (S.t || 0);
        if (r.concluido || !S.escolha || remotoMaisNovo) adotarRemoto(r);
        else if (S.dirty || (S.t || 0) > (Number(r.t) || 0)) return pushRemoto();
      } else if (S.escolha) {
        return pushRemoto();
      }
    }).catch(function (e) {
      if (window.console) console.warn('[Guia Zyro] leitura do progresso falhou:', e && e.code ? e.code : e);
    });
  }

  /* ------------------------------------------------------------------ */
  /* UI: elementos base                                                  */
  /* ------------------------------------------------------------------ */
  var ring, dock, card, bot, uiTitulo, uiTexto, uiEtapa, uiBarra, uiExtra, uiVoltar, uiProximo, uiPular, uiEspera, uiSecundario;
  var modal = null, toastEl = null;
  var rafId = 0, ultimoRect = '', tentativas = 0, retryTimer = 0, alvoAtual = null;

  function criarBot() {
    var b = el('div', 'zg-bot');
    b.innerHTML = '<div class="zg-bot-antenna"></div><div class="zg-bot-ear l"></div><div class="zg-bot-ear r"></div>' +
      '<div class="zg-bot-head"><img src="./fotos/guia-zyro.png" alt="Guia Zyro" width="64" height="64" decoding="async"></div>' +
      '<div class="zg-bot-foot"></div>';
    return b;
  }

  function montarUI() {
    if (dock) return;
    ring = el('div', 'zg-ring');
    ring.setAttribute('aria-hidden', 'true');

    dock = el('div', 'zg-dock');
    dock.setAttribute('role', 'dialog');
    dock.setAttribute('aria-label', 'Guia ZyroDev');
    dock.setAttribute('data-pos', 'br');
    bot = criarBot();
    card = el('div', 'zg-card');
    card.setAttribute('aria-live', 'polite');
    var head = el('div', 'zg-head');
    var nome = el('span', 'zg-name', 'Guia Zyro');
    uiEtapa = el('span', 'zg-stage');
    head.appendChild(nome); head.appendChild(uiEtapa);
    var barra = el('div', 'zg-bar');
    uiBarra = document.createElement('i');
    barra.appendChild(uiBarra);
    uiTitulo = el('h3', 'zg-title');
    uiTexto = el('div', 'zg-text');
    uiExtra = el('div');
    uiEspera = el('div', 'zg-wait');
    uiEspera.hidden = true;
    var acoes = el('div', 'zg-actions');
    uiVoltar = el('button', 'zg-btn zg-ghost', 'Voltar'); uiVoltar.type = 'button';
    uiSecundario = el('button', 'zg-btn zg-ghost'); uiSecundario.type = 'button'; uiSecundario.hidden = true;
    uiProximo = el('button', 'zg-btn zg-primary', 'Próximo'); uiProximo.type = 'button';
    acoes.appendChild(uiVoltar); acoes.appendChild(uiSecundario); acoes.appendChild(uiProximo);
    uiPular = el('button', 'zg-skip', 'Pular tutorial'); uiPular.type = 'button';
    card.appendChild(head); card.appendChild(barra); card.appendChild(uiTitulo); card.appendChild(uiTexto);
    card.appendChild(uiExtra); card.appendChild(uiEspera); card.appendChild(acoes); card.appendChild(uiPular);
    dock.appendChild(bot); dock.appendChild(card);
    document.body.appendChild(ring);
    document.body.appendChild(dock);

    uiVoltar.addEventListener('click', function () { if (cfgAtual && cfgAtual.onVoltar) cfgAtual.onVoltar(); });
    uiProximo.addEventListener('click', function () { if (cfgAtual && cfgAtual.onProximo) cfgAtual.onProximo(); });
    uiSecundario.addEventListener('click', function () { if (cfgAtual && cfgAtual.onSecundario) cfgAtual.onSecundario(); });
    uiPular.addEventListener('click', pular);
    window.addEventListener('resize', function () { if (cfgAtual) reposicionar(true); });
  }

  /* ------------------------------------------------------------------ */
  /* UI: exibir uma "tela" do guia                                       */
  /* ------------------------------------------------------------------ */
  var cfgAtual = null;
  // cfg: {title, html, stageLabel, progresso(0-1), resolver(), dim, pos, extra, espera,
  //       voltar:{show,disabled}, proximo:{label,disabled,hidden}, secundario:{label}, pular, onVoltar, onProximo...}
  function mostrar(cfg) {
    montarUI();
    cfgAtual = cfg;
    document.body.classList.add('zg-on');
    marcarAntigoVisto();

    uiTitulo.textContent = cfg.title || '';
    uiTexto.innerHTML = cfg.html || '';
    uiEtapa.textContent = cfg.stageLabel || '';
    uiBarra.style.width = Math.max(0, Math.min(1, cfg.progresso || 0)) * 100 + '%';
    uiExtra.innerHTML = '';
    if (cfg.extra) uiExtra.appendChild(cfg.extra);
    uiEspera.hidden = !cfg.espera;
    uiEspera.textContent = cfg.espera || '';

    uiVoltar.hidden = !(cfg.voltar && cfg.voltar.show);
    uiVoltar.disabled = !!(cfg.voltar && cfg.voltar.disabled);
    uiProximo.hidden = !!(cfg.proximo && cfg.proximo.hidden);
    uiProximo.textContent = (cfg.proximo && cfg.proximo.label) || 'Próximo';
    uiProximo.disabled = !!(cfg.proximo && cfg.proximo.disabled);
    uiSecundario.hidden = !cfg.secundario;
    if (cfg.secundario) uiSecundario.textContent = cfg.secundario.label;
    uiPular.hidden = cfg.pular === false;
    uiPular.textContent = cfg.pularLabel || 'Pular tutorial';

    card.scrollTop = 0;
    bot.classList.remove('zg-talk'); void bot.offsetWidth; bot.classList.add('zg-talk');
    requestAnimationFrame(function () { dock.classList.add('zg-show'); });

    tentativas = 0;
    clearTimeout(retryTimer);
    resolverEFocar(true);
  }

  function resolverAlvo(cfg) {
    if (!cfg.resolver) return null;
    try { return cfg.resolver(); } catch (e) { return null; }
  }

  function resolverEFocar(primeiraVez) {
    var r = resolverAlvo(cfgAtual);
    alvoAtual = r;
    if (r) {
      if (primeiraVez || !alvoAtual._focado) { focar(r); }
      r._focado = true;
      ring.classList.add('zg-show');
      ring.classList.toggle('zg-dim', cfgAtual.dim !== false);
      ultimoRect = '';
      iniciarLoop();
      setTimeout(function () { reposicionar(true); }, 450);
      setTimeout(function () { reposicionar(true); }, 1100);
    } else {
      ring.classList.remove('zg-show', 'zg-dim');
      pararLoop();
      escolherPos(null);
      // o alvo pode aparecer depois (ex.: ranking carregando)
      if (cfgAtual.temAlvo && tentativas < 8) {
        tentativas++;
        retryTimer = setTimeout(function () { if (cfgAtual) resolverEFocar(true); }, 700);
      }
    }
    reposicionar(true);
  }

  function retanguloDe(r) {
    if (!r) return null;
    if (r.rect) return r.rect();
    var b = r.el.getBoundingClientRect();
    return { left: b.left, top: b.top, right: b.right, bottom: b.bottom, width: b.width, height: b.height };
  }

  function focar(r) {
    var e = r.el;
    if (!e) return;
    if (cfgAtual && cfgAtual.inline) {
      try { e.scrollIntoView({ block: 'nearest', inline: 'center' }); } catch (x) { /* ignora */ }
    }
    if (fixoOuSticky(e)) return;
    var b = retanguloDe(r);
    var vh = window.innerHeight;
    var topo = 92;
    var reservado = mobile() ? Math.min(vh * 0.5, 340) : 0;
    var disp = vh - topo - reservado;
    var cabe = b.height <= disp;
    var jaOk = b.top >= topo - 12 && b.bottom <= vh - reservado + 12;
    if (cabe && jaOk) return;
    var alvoTop = cabe ? topo + (disp - b.height) / 2 : topo;
    window.scrollBy({ top: b.top - alvoTop, behavior: 'smooth' });
  }

  function iniciarLoop() {
    pararLoop();
    (function tick() {
      rafId = requestAnimationFrame(tick);
      if (!alvoAtual) return;
      var b = retanguloDe(alvoAtual);
      if (!b || b.width < 2 || b.height < 2) { ring.classList.remove('zg-show'); return; }
      var chave = [b.left, b.top, b.width, b.height].map(Math.round).join(',');
      if (chave === ultimoRect) return;
      ultimoRect = chave;
      var pad = 6;
      ring.style.left = (b.left - pad) + 'px';
      ring.style.top = (b.top - pad) + 'px';
      ring.style.width = (b.width + pad * 2) + 'px';
      ring.style.height = (b.height + pad * 2) + 'px';
      ring.classList.add('zg-show');
    })();
  }
  function pararLoop() { if (rafId) cancelAnimationFrame(rafId); rafId = 0; }

  function reposicionar() {
    if (!cfgAtual || !dock) return;
    escolherPos(alvoAtual ? retanguloDe(alvoAtual) : null);
  }

  function sobreposicao(a, b) {
    var w = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
    var h = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    return w * h;
  }
  function escolherPos(alvo) {
    var vw = window.innerWidth, vh = window.innerHeight;
    var pref = (cfgAtual && cfgAtual.pos) || '';
    if (!alvo || pref === 'c') { dock.setAttribute('data-pos', 'c'); return; }
    var w = dock.offsetWidth || 400, h = dock.offsetHeight || 220;
    var cands = mobile() ? ['br', 'tr'] : ['br', 'bl', 'tr', 'tl'];
    var m = 18, topoOff = 84;
    function caixa(p) {
      if (mobile()) {
        return p === 'br' ? { left: 8, right: vw - 8, top: vh - h - 8, bottom: vh - 8 }
                          : { left: 8, right: vw - 8, top: topoOff - 6, bottom: topoOff - 6 + h };
      }
      var l = (p === 'br' || p === 'tr') ? vw - m - w : m;
      var t = (p === 'br' || p === 'bl') ? vh - m - h : topoOff;
      return { left: l, right: l + w, top: t, bottom: t + h };
    }
    var inflado = { left: alvo.left - 10, right: alvo.right + 10, top: alvo.top - 10, bottom: alvo.bottom + 10 };
    var melhor = cands[0], menor = Infinity;
    cands.forEach(function (p) {
      var s = sobreposicao(caixa(p), inflado);
      if (s < menor) { menor = s; melhor = p; }
    });
    dock.setAttribute('data-pos', melhor);
  }

  function esconder() {
    cfgAtual = null;
    pararLoop();
    clearTimeout(retryTimer);
    alvoAtual = null;
    if (ring) ring.classList.remove('zg-show', 'zg-dim');
    if (dock) dock.classList.remove('zg-show');
    document.body.classList.remove('zg-on');
  }

  /* ------------------------------------------------------------------ */
  /* Aviso rápido                                                         */
  /* ------------------------------------------------------------------ */
  function aviso(msg, acaoLabel, acao) {
    if (!toastEl) {
      toastEl = el('div', 'zg-modal');
      toastEl.style.cssText = 'background:none;backdrop-filter:none;-webkit-backdrop-filter:none;pointer-events:none;align-items:end;justify-items:center;';
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = '';
    var box = el('div', 'zg-card');
    box.style.cssText = 'pointer-events:auto;width:min(420px,100%);margin-bottom:calc(10px + env(safe-area-inset-bottom,0px));padding:14px 16px;';
    var p = el('div', 'zg-text'); p.textContent = msg; box.appendChild(p);
    if (acaoLabel) {
      var b = el('button', 'zg-btn zg-primary', ''); b.textContent = acaoLabel; b.type = 'button';
      b.style.marginTop = '10px'; b.style.width = '100%';
      b.addEventListener('click', function () { fecharAviso(); acao(); });
      box.appendChild(b);
    }
    toastEl.appendChild(box);
    requestAnimationFrame(function () { toastEl.classList.add('zg-show'); });
    clearTimeout(aviso._t);
    aviso._t = setTimeout(fecharAviso, acaoLabel ? 9000 : 6000);
  }
  function fecharAviso() { if (toastEl) toastEl.classList.remove('zg-show'); }

  /* ------------------------------------------------------------------ */
  /* Boas-vindas (primeira entrada)                                       */
  /* ------------------------------------------------------------------ */
  function mostrarBoasVindas() {
    if (modal) return;
    document.body.classList.add('zg-on');
    document.documentElement.classList.remove('zg-pending');
    modal = el('div', 'zg-modal');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Bem-vindo à ZyroDev');
    var box = el('div', 'zg-modal-box');
    box.appendChild(criarBot());
    box.appendChild(el('h2', '', 'Bem-vindo à ZyroDev!'));
    box.appendChild(el('p', '', 'Estamos aqui para ajudar você a começar sua jornada no mundo da programação.'));
    var acoes = el('div', 'zg-modal-actions');
    var sim = el('button', 'zg-btn zg-primary', 'SIM, QUERO CONHECER'); sim.type = 'button';
    var nao = el('button', 'zg-btn zg-ghost', 'NÃO, OBRIGADO'); nao.type = 'button';
    acoes.appendChild(sim); acoes.appendChild(nao);
    box.appendChild(acoes);
    modal.appendChild(box);
    document.body.appendChild(modal);
    document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(function () { modal.classList.add('zg-show'); sim.focus({ preventScroll: true }); });

    sim.addEventListener('click', function () { fecharModal(); iniciar(); });
    nao.addEventListener('click', function () {
      fecharModal();
      S.escolha = 'nao'; S.pulado = false; S.concluido = false;
      marcarAntigoVisto();
      tocar();
      document.body.classList.remove('zg-on');
      if (!U) { location.assign('login.html'); }
    });
  }
  function fecharModal() {
    document.documentElement.style.overflow = '';
    if (modal) { modal.remove(); modal = null; }
  }

  /* ------------------------------------------------------------------ */
  /* Navegação do tour                                                    */
  /* ------------------------------------------------------------------ */
  function urlDoPasso(s) {
    return typeof s.href === 'function' ? s.href() : s.page + '.html';
  }
  function ir(i) {
    // pula passos que dependem de login quando não há usuário
    while (i < STEPS.length && STEPS[i].precisaLogin && !U) i++;
    if (i >= STEPS.length || i < 0) return;
    var s = STEPS[i];
    S.passo = s.id;
    S.fase = s.etapa === 0 ? 'auth' : 'tour';
    tocar();
    if (s.page === PAGE) { cur = i; desenhar(i); }
    else { location.assign(urlDoPasso(s)); }
  }
  function proximo() {
    var s = STEPS[cur];
    if (s && s.ultimo) return finalizar();
    ir(cur + 1);
  }
  function voltar() {
    var j = cur - 1;
    while (j >= 0 && STEPS[j].precisaLogin && !U) j--;
    if (j < 0) return;
    ir(j);
  }

  function progressoDe(i) {
    if (i < PRIMEIRO_TOUR) return (i + 1) * 0.02;
    return Math.min(1, (i - PRIMEIRO_TOUR + 1) / TOTAL_TOUR);
  }
  function rotuloEtapa(s) {
    if (s.etapa === 0) return 'Cadastro';
    return 'Etapa ' + s.etapa + ' de ' + TOTAL_ETAPAS + ' • ' + ETAPAS[s.etapa];
  }

  function desenhar(i) {
    var s = STEPS[i];
    var texto = typeof s.text === 'function' ? s.text() : s.text;
    var titulo = typeof s.title === 'function' ? s.title() : s.title;
    var temAlvo = !!(s.target || s.union);
    var cfg = {
      title: titulo, html: texto, stageLabel: rotuloEtapa(s), progresso: progressoDe(i),
      pos: s.pos, dim: s.dim, inline: s.inline, temAlvo: temAlvo,
      resolver: temAlvo ? function () { return resolverPasso(s); } : null,
      voltar: { show: i > 0 && !(i === PRIMEIRO_TOUR) },
      proximo: { label: s.ultimo ? 'FINALIZAR GUIA' : 'Próximo' },
      onProximo: proximo, onVoltar: voltar
    };
    if (s.aguardaAuth && !U) {
      cfg.proximo.hidden = true;
      cfg.espera = 'Estou esperando você concluir o cadastro ou o login. Assim que terminar, eu continuo sozinho.';
    } else if (s.aguardaAuth && U) {
      cfg.proximo.label = 'Começar o tour';
    }
    if (s.escolher) {
      cfg.extra = montarEscolhas(cfg);
      cfg.proximo.disabled = !S.tecnologia;
    }
    if (s.ultimo && S.tecnologia && TECH[S.tecnologia]) {
      var t = TECH[S.tecnologia];
      cfg.secundario = { label: 'Finalizar e ir para ' + t.nome };
      cfg.onSecundario = function () { finalizar(t.pagina); };
    }
    mostrar(cfg);
  }

  function resolverPasso(s) {
    if (s.union) {
      var els = s.union.map(q1).filter(visivel);
      if (els.length) {
        return {
          el: els[0],
          rect: function () {
            var l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
            els.forEach(function (e) {
              var x = e.getBoundingClientRect();
              l = Math.min(l, x.left); t = Math.min(t, x.top); r = Math.max(r, x.right); b = Math.max(b, x.bottom);
            });
            return { left: l, top: t, right: r, bottom: b, width: r - l, height: b - t };
          }
        };
      }
    }
    var tg = s.target;
    if (typeof tg === 'function') {
      var e = null;
      try { e = tg(); } catch (x) { e = null; }
      if (e && s.inline) {
        try { e.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'instant' }); } catch (x2) { /* ignora */ }
      }
      return e && visivel(e) ? { el: e } : null;
    }
    var lista = Array.isArray(tg) ? tg : (tg ? [tg] : []);
    for (var k = 0; k < lista.length; k++) {
      var c = q1(lista[k]);
      if (c && visivel(c)) return { el: c };
    }
    return null;
  }

  function montarEscolhas(cfg) {
    var box = el('div', 'zg-choices');
    Object.keys(TECH).forEach(function (chave) {
      var t = TECH[chave];
      var b = el('button', 'zg-choice' + (chave === 'logica' ? ' zg-wide' : ''));
      b.type = 'button';
      b.setAttribute('aria-pressed', S.tecnologia === chave ? 'true' : 'false');
      b.innerHTML = '';
      b.appendChild(document.createTextNode(t.nome));
      var small = el('small'); small.textContent = t.nota; b.appendChild(small);
      b.addEventListener('click', function () {
        S.tecnologia = chave; tocar();
        Array.prototype.forEach.call(box.children, function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        uiProximo.disabled = false;
        if (cfgAtual && cfgAtual.proximo) cfgAtual.proximo.disabled = false;
      });
      box.appendChild(b);
    });
    return box;
  }

  /* ------------------------------------------------------------------ */
  /* Ações: iniciar, pular, finalizar, retomar                            */
  /* ------------------------------------------------------------------ */
  function iniciar() {
    var tec = S.tecnologia;
    S = estadoVazio();
    S.escolha = 'sim';
    S.tecnologia = tec && TECH[tec] ? tec : null;
    marcarAntigoVisto();
    var primeiro = U ? PRIMEIRO_TOUR : PRIMEIRO_AUTH;
    S.passo = STEPS[primeiro].id;
    S.fase = U ? 'tour' : 'auth';
    tocar();
    fecharModal();
    ir(primeiro);
  }

  function pular() {
    S.pulado = true;
    tocar();
    esconder();
    aviso('Tudo bem! Você pode abrir o Guia ZyroDev de novo em Configurações ou no rodapé da página principal.');
  }

  function finalizar(irPara) {
    S.concluido = true;
    S.escolha = 'sim';
    S.passo = 'z1';
    S.fase = 'fim';
    tocar();
    esconder();
    pushRemoto();
    if (irPara) { setTimeout(function () { location.assign(irPara); }, 250); return; }
    aviso('Guia finalizado! Você pode rever quando quiser em Configurações ou no rodapé desta página.');
  }

  function continuar() {
    if (!ativo()) return iniciar();
    var i = IDX[S.passo] != null ? IDX[S.passo] : (U ? PRIMEIRO_TOUR : PRIMEIRO_AUTH);
    ir(i);
  }

  function oferecerRetomada() {
    var i = IDX[S.passo] != null ? IDX[S.passo] : PRIMEIRO_TOUR;
    var s = STEPS[i];
    mostrar({
      title: 'Continuar o guia?',
      html: '<p>Você parou em <b>' + (s.etapa === 0 ? 'Cadastro' : 'Etapa ' + s.etapa + ' • ' + ETAPAS[s.etapa]) + '</b>. Quer continuar de onde parou?</p>',
      stageLabel: 'Tutorial em andamento', progresso: progressoDe(i), pos: 'c',
      voltar: { show: false }, proximo: { label: 'Continuar de onde parei' },
      secundario: { label: 'Recomeçar' },
      onProximo: function () { ir(i); },
      onSecundario: function () { iniciar(); }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Entradas fixas (configurações / rodapé)                              */
  /* ------------------------------------------------------------------ */
  function textoStatus() {
    if (ativo()) {
      var i = IDX[S.passo] != null ? IDX[S.passo] : PRIMEIRO_TOUR;
      var s = STEPS[i];
      return 'Guia em andamento — ' + (s.etapa === 0 ? 'Cadastro' : 'Etapa ' + s.etapa + ' de ' + TOTAL_ETAPAS + ' (' + ETAPAS[s.etapa] + ')') + '.';
    }
    if (S.concluido) return 'Você concluiu o guia. Pode rever quando quiser.';
    if (S.pulado || S.escolha === 'nao') return 'Você pulou o guia. Pode começar quando quiser.';
    return 'Você ainda não fez o guia.';
  }
  var atualizarEntradas = function () {};
  function ligarEntradas() {
    var box = document.getElementById('zyroGuiaConfig');
    if (box) {
      var status = document.getElementById('zyroGuiaStatus');
      var bIni = document.getElementById('zyroGuiaIniciar');
      var bRei = document.getElementById('zyroGuiaReiniciar');
      var atualizar = function () {
        if (status) status.textContent = textoStatus();
        if (bIni) bIni.textContent = ativo() ? 'Continuar o guia' : (S.concluido ? 'Ver o guia de novo' : 'Iniciar o guia');
        if (bRei) bRei.hidden = !ativo();
      };
      atualizar();
      atualizarEntradas = atualizar;
      if (bIni) bIni.addEventListener('click', function () { if (ativo()) continuar(); else iniciar(); });
      if (bRei) bRei.addEventListener('click', function () { iniciar(); });
      window.addEventListener('storage', atualizar);
    }
    document.addEventListener('click', function (ev) {
      var a = ev.target && ev.target.closest ? ev.target.closest('[data-zyro-guia]') : null;
      if (!a) return;
      ev.preventDefault();
      if (ativo()) continuar(); else iniciar();
    });
  }

  /* ------------------------------------------------------------------ */
  /* API pública (útil para botões e testes)                              */
  /* ------------------------------------------------------------------ */
  window.ZyroGuia = {
    iniciar: iniciar,
    continuar: continuar,
    reiniciar: iniciar,
    estado: function () { return JSON.parse(JSON.stringify(S)); },
    passos: function () { return STEPS.map(function (s) { return { id: s.id, etapa: s.etapa, page: s.page }; }); }
  };

  /* ------------------------------------------------------------------ */
  /* Inicialização                                                        */
  /* ------------------------------------------------------------------ */
  function injetarCss() {
    if (document.querySelector('link[data-zyro-guia-css]')) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = './guia-zyro.css'; l.setAttribute('data-zyro-guia-css', '1');
    document.head.appendChild(l);
  }
  function aguardarPronto() {
    return new Promise(function (res) {
      var t0 = Date.now();
      (function chk() {
        var p = document.getElementById('preloader');
        var vis = p && window.getComputedStyle(p).display !== 'none' && !p.classList.contains('hide');
        if ((document.readyState === 'complete' && !vis) || Date.now() - t0 > 6000) res();
        else setTimeout(chk, 150);
      })();
    });
  }

  function iniciarPagina() {
    injetarCss();
    ligarEntradas();

    // O mini-tour antigo de cursos.html não deve competir com este guia.
    if (S.escolha) marcarAntigoVisto();
    if (ativo()) document.body.classList.add('zg-on');

    var naoDecidido = !decidido();
    if (PAGE === 'index' && naoDecidido) {
      document.documentElement.classList.add('zg-pending');
      setTimeout(function () { document.documentElement.classList.remove('zg-pending'); }, 9000);
    }

    var precisaFb = ativo() || S.dirty || (PAGE === 'index' && naoDecidido);
    var preparo = precisaFb ? aguardarAuth().then(function () { return U ? sincronizar() : null; }) : Promise.resolve();

    Promise.all([preparo, aguardarPronto()]).then(function () {
      document.documentElement.classList.remove('zg-pending');
      atualizarEntradas();
      if (S.dirty && U) pushRemoto();

      // 1) primeira entrada → boas-vindas (só na página principal)
      if (PAGE === 'index' && !decidido() && !S.escolha) { mostrarBoasVindas(); return; }

      if (!ativo()) { document.body.classList.remove('zg-on'); return; }

      // 2) cadastro concluído: segue automaticamente para o tour
      var i = IDX[S.passo] != null ? IDX[S.passo] : (U ? PRIMEIRO_TOUR : PRIMEIRO_AUTH);
      if (STEPS[i].etapa === 0 && U && PAGE !== 'login') { ir(PRIMEIRO_TOUR); return; }
      // login em andamento: login.js cuida do redirecionamento; não interferir
      if (STEPS[i].etapa === 0 && U && PAGE === 'login') { desenhar(i); return; }

      // 3) mesma página do passo → retoma exatamente de onde parou
      if (STEPS[i].page === PAGE) { cur = i; desenhar(i); return; }

      // 4) outra página → oferece continuar
      oferecerRetomada();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciarPagina);
  else iniciarPagina();
})();
