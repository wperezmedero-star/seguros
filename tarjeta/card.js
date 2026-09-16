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

  const applyAccessibilityPolish=()=>{
    if(document.getElementById('premium-a11y-polish'))return;
    const style=document.createElement('style');
    style.id='premium-a11y-polish';
    style.textContent=`
      :root{--sea:#0f6f86;--sea-deep:#0c4e69;--sea-bright:#1688a0;--sea-mist:#e8f5f4;--sand:#f5f0e6}
      body{background:linear-gradient(180deg,#0b4562 0%,#0f6f86 26%,#dfeff0 47%,#f5f0e6 66%,#0f607a 84%,#0a192f 100%)!important;background-attachment:fixed!important}
      .topbar,.hero,.credentials{position:relative;z-index:1}
      .hero{border-radius:0 0 34px 34px}
      .hero-intro,.brand small,.site-link,.reassurance{color:#d7e8ee!important}
      .credentials{background:linear-gradient(90deg,rgba(15,111,134,.62),rgba(12,78,105,.52));border-color:rgba(255,255,255,.22)!important;border-radius:20px;padding-inline:22px;box-shadow:0 18px 38px rgba(5,31,49,.16)}
      .credential-label,.credential-intro small{color:#d8e8ee!important}.credentials strong{color:#fff}.credentials a{color:#fff1b7!important}
      #necesidades::before{background:linear-gradient(180deg,#edf8f7 0%,#e2f2f2 54%,#f8f3e9 100%)!important;border-color:#cfe3e3!important}
      #necesidades>.section-heading h2{color:#123149!important}#necesidades>.section-heading p:last-child{color:#4e6676!important}
      .service-panel{background:linear-gradient(135deg,#0f6f86 0%,#0c4e69 100%)!important;border-color:#5aa3b3!important;box-shadow:0 24px 52px rgba(7,55,75,.20)!important}
      .service-panel .eyebrow{color:#fff0ad!important}.service-panel .service-copy>p:not(.eyebrow){color:#e1f0f3!important}.service-panel .service-copy .service-note{color:#f4fbfc!important}
      .dime-callout{background:linear-gradient(135deg,#fffefa 0%,#f5fbfb 100%)!important;border-color:#c9dfe0!important;box-shadow:0 18px 42px rgba(14,87,108,.12)!important}
      .approach::before{background:linear-gradient(180deg,#fffaf0 0%,#f4efe5 55%,#ebf5f3 100%)!important}
      .areas{position:relative;isolation:isolate;color:#fff;padding-top:42px;padding-bottom:42px}
      .areas::before{content:"";position:absolute;z-index:-1;left:50%;width:100vw;transform:translateX(-50%);inset-block:0;background:linear-gradient(145deg,#13829a 0%,#0f667e 50%,#0b4662 100%);border-block:1px solid rgba(255,255,255,.15)}
      .areas h2,.areas .section-heading p{color:#fff!important}.areas .eyebrow{color:#fff0ad!important}
      .areas .icon-btn{background:#f8f6ef!important;color:#123149!important;border-color:#d9e7e8!important}
      .card{border-color:rgba(255,255,255,.28)!important;box-shadow:0 18px 36px rgba(2,32,46,.22)}
      .keep{position:relative;isolation:isolate;color:#123149;padding-block:44px!important}
      .keep::before{content:"";position:absolute;z-index:-1;left:50%;width:100vw;transform:translateX(-50%);inset-block:0;background:#f8f5ed;border-block:1px solid #e0ddd3}
      .keep p strong{color:#123149}.keep p span{color:#566b79!important}.keep>div>.icon{color:#8a6812!important}
      footer{color:#d9e5ea!important}footer .lic{color:#fff!important}
      dialog.hoja .campo label em{color:#526477!important}
      dialog.hoja .draft-status,dialog.hoja .draft-status strong{color:#705500!important}
      .dime-callout .secondary{background:#0c4e69!important;color:#fff!important;border-color:#0b4058!important;box-shadow:0 10px 24px rgba(12,78,105,.18)!important}
      .dime-callout .secondary:hover,.dime-callout .secondary:focus-visible{background:#0f6f86!important;border-color:#8a6812!important;color:#fff!important}
      @keyframes heroEnterReadable{from{transform:translateY(18px) scale(.99)}to{transform:none}}
      @keyframes portraitEnterReadable{from{transform:translateY(16px) scale(.992)}to{transform:none}}
      .topbar,.hero-copy,.credentials{animation-name:heroEnterReadable!important;filter:none!important;opacity:1!important}
      .portrait{animation-name:portraitEnterReadable!important;filter:none!important;opacity:1!important}
      .motion-ready .motion-reveal{opacity:1!important;filter:none!important;transform:translateY(16px) scale(.996)!important}
      .motion-ready .motion-reveal.motion-in{opacity:1!important;filter:none!important;transform:none!important}
      @media(max-width:699px){
        body{background:linear-gradient(180deg,#0b4562 0%,#11798f 24%,#eaf6f5 46%,#f7f1e6 67%,#0e5d76 83%,#0a192f 100%)!important}
        .credentials{border-radius:16px;padding-inline:16px}.areas{padding-top:32px;padding-bottom:34px}
        .brand{font-size:14px!important}.brand small{font-size:10px!important}.site-link{font-size:13px!important}
        .hero-intro{font-size:17px!important;line-height:1.72!important}.eyebrow{font-size:11px!important}.btn{font-size:14px!important}.reassurance,.text-btn{font-size:12px!important}
        .credentials{font-size:13px!important}.credential-intro small{font-size:11px!important}.credential-label{font-size:9px!important}.credentials strong{font-size:14px!important}.credentials a{font-size:12px!important}
        .section-heading p:last-child,.service-copy>p:not(.eyebrow),.section-intro,.lista li{font-size:14px!important}.need strong{font-size:18px!important}.need small{font-size:12px!important;line-height:1.5!important}
        .service-copy .service-note,.panel-actions .text-btn{font-size:12px!important}.dime-callout p:not(.eyebrow){font-size:13px!important}.dime-callout .btn{font-size:13px!important}
        .lista span{font-size:13px!important}.txt span{font-size:12px!important}.contact-panel p:not(.eyebrow){font-size:14px!important}.contact-links a{font-size:13px!important}.contact-ctas small{font-size:11px!important}
        .keep p strong{font-size:16px!important}.keep p span{font-size:13px!important}.keep .btn{font-size:12px!important}footer{font-size:11px!important}.footer-actions .text-btn{font-size:11px!important}
      }
    `;
    document.head.appendChild(style);
  };

  applyAccessibilityPolish();

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