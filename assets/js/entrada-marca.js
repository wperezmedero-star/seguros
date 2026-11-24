/* Una vuelta y media del WP en relieve y una disolución en polvo dorado. El vídeo solo se pide en la primera entrada. */
(function () {
  const page = document.documentElement;
  if (!page.classList.contains('brand-entrance-active')) return;

  const intro = document.querySelector('.brand-entrance');
  const symbol = intro.querySelector('.brand-entrance__symbol');
  const film = document.createElement('video');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const skipEvents = ['pointerdown', 'touchstart', 'keydown', 'wheel', 'pagehide'];
  let phase = 'loading';
  let timer;

  function finish() {
    if (phase === 'done') return;
    phase = 'done';
    clearTimeout(timer);
    skipEvents.forEach(type => window.removeEventListener(type, finish, true));
    reducedMotion.removeEventListener('change', finish);
    page.classList.remove('brand-entrance-active');
    film.pause();
    film.removeAttribute('src');
    film.load();
    film.remove();
  }

  function revealPage() {
    if (phase === 'done' || phase === 'leaving') return;
    phase = 'leaving';
    clearTimeout(timer);
    intro.classList.add('is-leaving');
    timer = setTimeout(finish, 380);
  }

  function useFallback() {
    if (phase !== 'loading' && phase !== 'playing') return;
    if (phase === 'playing') return revealPage();
    phase = 'fallback';
    clearTimeout(timer);
    film.pause();
    const animation = new Image();
    animation.alt = '';
    animation.className = 'brand-entrance__fallback';
    animation.onload = () => {
      if (phase !== 'fallback') return;
      clearTimeout(timer);
      intro.classList.add('is-fallback');
      timer = setTimeout(revealPage, 4580);
    };
    animation.onerror = revealPage;
    symbol.appendChild(animation);
    timer = setTimeout(revealPage, 1000);
    animation.src = 'assets/brand/wp-giro-polvo.webp?v=media-v3';
  }

  skipEvents.forEach(type => window.addEventListener(type, finish, { capture: true, passive: true }));
  reducedMotion.addEventListener('change', finish);

  film.className = 'brand-entrance__film';
  film.muted = true;
  film.playsInline = true;
  film.disablePictureInPicture = true;
  film.setAttribute('aria-hidden', 'true');
  film.addEventListener('playing', () => {
    if (phase !== 'loading') return;
    phase = 'playing';
    clearTimeout(timer);
    intro.classList.add('is-playing');
    timer = setTimeout(revealPage, 5050);
  }, { once: true });
  film.addEventListener('ended', revealPage, { once: true });
  film.addEventListener('error', useFallback, { once: true });
  timer = setTimeout(revealPage, 1400);
  symbol.appendChild(film);
  film.src = 'assets/brand/wp-giro-polvo.mp4?v=media-v3';
  film.play().catch(useFallback);
})();
