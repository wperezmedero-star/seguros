/* Premium Motion bootstrap — keeps the verified card logic isolated in card-core.js */
(()=>{
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  const bootMotion=()=>{
    if(reduce.matches)return;
    document.documentElement.classList.add('motion-ready');
    const targets=[...document.querySelectorAll('.section,.credentials,.keep,footer')];
    targets.forEach(el=>el.classList.add('motion-reveal'));
    if('IntersectionObserver' in window){
      const io=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('motion-in');io.unobserve(entry.target)}})
      },{threshold:.12,rootMargin:'0px 0px -7% 0px'});
      targets.forEach(el=>io.observe(el));
    }else targets.forEach(el=>el.classList.add('motion-in'));

    const portrait=document.querySelector('.portrait');
    if(portrait && matchMedia('(hover:hover) and (pointer:fine)').matches){
      portrait.addEventListener('pointermove',e=>{
        const r=portrait.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
        portrait.style.transform=`translateY(-4px) perspective(900px) rotateX(${-y*2.2}deg) rotateY(${x*2.2}deg)`;
      });
      portrait.addEventListener('pointerleave',()=>portrait.style.removeProperty('transform'));
    }

    document.addEventListener('pointerdown',e=>{
      const el=e.target.closest('.btn,.need,.icon-btn,.card');
      if(!el)return;
      el.animate([{transform:'scale(1)'},{transform:'scale(.975)'},{transform:'scale(1)'}],{duration:260,easing:'cubic-bezier(.2,.9,.25,1)'});
    },{passive:true});

    const total=document.querySelector('#cTotal');
    if(total && 'MutationObserver' in window){
      const mo=new MutationObserver(()=>{
        if(total.textContent.trim()!=='$0')total.animate([{transform:'scale(.94)',opacity:.45},{transform:'scale(1.035)',opacity:1},{transform:'scale(1)',opacity:1}],{duration:520,easing:'cubic-bezier(.2,.9,.25,1)'});
      });
      mo.observe(total,{childList:true,characterData:true,subtree:true});
    }
  };

  const core=document.createElement('script');
  core.src='card-core.js';
  core.defer=true;
  core.onload=()=>requestAnimationFrame(()=>requestAnimationFrame(bootMotion));
  core.onerror=()=>console.error('No se pudo cargar la lógica principal de la tarjeta.');
  document.head.appendChild(core);
})();
