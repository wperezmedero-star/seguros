/* Premium Motion bootstrap — verified card logic stays isolated in card-core.js */
(()=>{
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');

  const iconMarkup={
    vida:'<path d="M12 2.8 19 5.5v5.8c0 4.4-2.8 7.7-7 9.9-4.2-2.2-7-5.5-7-9.9V5.5z"/><path d="M12 15.7s-3.5-2.1-3.5-4.6a2.35 2.35 0 0 1 4.2-1.45 2.35 2.35 0 0 1 4.2 1.45c0 2.5-3.5 4.6-3.5 4.6" transform="translate(-.7 0)"/>',
    salud:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M8 12h2.1l1-2.1 2 4.2 1.2-2.1H17"/><path d="M8 8h3"/>',
    medicare:'<circle cx="8.5" cy="8" r="2.7"/><path d="M3.8 17.8c.6-3 2.2-4.7 4.7-4.7 1.1 0 2 .3 2.8.9"/><rect x="13" y="8" width="8" height="9" rx="2"/><path d="M17 10.5v4M15 12.5h4"/>',
    retiro:'<path d="M12 20v-7"/><path d="M12 13c-2.8 0-5-1.8-5-4.3 2.8 0 5 1.8 5 4.3Z"/><path d="M12 10.8c2.8 0 5-1.8 5-4.3-2.8 0-5 1.8-5 4.3Z"/><circle cx="17.2" cy="17.2" r="3.2"/><path d="M17.2 15.6v3.2M16.2 16.2h1.5c.7 0 .8 1 0 1h-1c-.8 0-.7 1 0 1h1.5"/>'
  };

  const paintIcon=(svg,key)=>{
    if(!svg||!iconMarkup[key])return;
    svg.setAttribute('viewBox','0 0 24 24');
    svg.setAttribute('fill','none');
    svg.setAttribute('stroke','currentColor');
    svg.innerHTML=iconMarkup[key];
    svg.classList.add('edu-icon');
  };

  const applyEducationalIcons=()=>{
    document.querySelectorAll('[data-service]').forEach(el=>paintIcon(el.querySelector('.icon'),el.dataset.service));
    document.querySelectorAll('.card[data-wa]').forEach(el=>paintIcon(el.querySelector('.marca .icon'),el.dataset.wa));
  };

  const bootMotion=()=>{
    applyEducationalIcons();

    const qr=document.querySelector('#qrDialog');
    if(qr && !reduce.matches){
      let closing=false;
      const closeQr=()=>{
        if(closing||!qr.open)return;
        closing=true;
        const animation=qr.animate([
          {opacity:1,transform:'translateY(0) scale(1)'},
          {opacity:.65,transform:'translateY(8px) scale(.985)'},
          {opacity:0,transform:'translateY(18px) scale(.955)'}
        ],{duration:260,easing:'cubic-bezier(.4,0,.6,1)'});
        animation.finished.catch(()=>{}).finally(()=>{
          if(qr.open)qr.close();
          closing=false;
        });
      };
      document.addEventListener('click',e=>{
        if(!qr.open)return;
        const closeButton=e.target.closest('#qrDialog [data-close]');
        const r=qr.getBoundingClientRect();
        const outside=e.target===qr&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom);
        if(!closeButton&&!outside)return;
        e.preventDefault();e.stopImmediatePropagation();closeQr();
      },true);
      qr.addEventListener('cancel',e=>{e.preventDefault();closeQr();});
    }

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
      if(!el||typeof el.animate!=='function')return;
      el.animate([{transform:'scale(1)'},{transform:'scale(.975)'},{transform:'scale(1)'}],{duration:260,easing:'cubic-bezier(.2,.9,.25,1)'});
    },{passive:true});

    const total=document.querySelector('#cTotal');
    if(total && 'MutationObserver' in window){
      const mo=new MutationObserver(()=>{
        if(total.textContent.trim()!=='$0'&&typeof total.animate==='function')total.animate([{transform:'scale(.94)',opacity:.45},{transform:'scale(1.035)',opacity:1},{transform:'scale(1)',opacity:1}],{duration:520,easing:'cubic-bezier(.2,.9,.25,1)'});
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