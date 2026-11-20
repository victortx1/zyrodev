/* Abre o ZYRO PODEPA dentro do site (sem nova aba). Coloque antes de </body> no index.html */
(() => {
  const css = document.createElement("style");
  css.textContent = `
  #podepaOverlay{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.72);backdrop-filter:blur(6px);display:grid;place-items:center;padding:2vh 2vw;animation:pdFade .25s}
  #podepaOverlay .pd-frame{width:min(1200px,100%);height:100%;border:1px solid rgba(255,106,0,.3);border-radius:18px;overflow:hidden;background:#080808;box-shadow:0 30px 90px #000;animation:pdIn .35s cubic-bezier(.2,1.2,.3,1)}
  #podepaOverlay iframe{width:100%;height:100%;border:0;display:block}
  #podepaOverlay.pd-out{animation:pdFade .2s reverse forwards}
  @keyframes pdFade{from{opacity:0}}@keyframes pdIn{from{opacity:0;transform:translateY(30px) scale(.95)}}
  @media(max-width:700px){#podepaOverlay{padding:0}#podepaOverlay .pd-frame{border-radius:0;border:0}}`;
  document.head.appendChild(css);

  let box = null;
  const close = () => {
    if (!box) return;
    box.classList.add("pd-out");
    const b = box; box = null;
    setTimeout(() => { b.remove(); document.body.style.overflow = ""; }, 200);
  };
  const open = () => {
    if (box) return;
    box = document.createElement("div"); box.id = "podepaOverlay";
    box.innerHTML = '<div class="pd-frame"><iframe src="podepa.html?embed=1" title="ZYRO PODEPA" allow="clipboard-write"></iframe></div>';
    box.addEventListener("mousedown", (e) => { if (e.target === box) close(); });
    document.body.appendChild(box); document.body.style.overflow = "hidden";
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href$="podepa.html"]');
    if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault(); open();
  }, true);
  window.addEventListener("message", (e) => { if (e.origin === location.origin && e.data?.type === "podepa-close") close(); });
})();
