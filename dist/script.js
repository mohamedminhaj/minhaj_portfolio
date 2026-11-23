(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;

  $('#year').textContent = new Date().getFullYear();

  /* ---------- Theme ---------- */
  const photo = $('#hero-photo');
  const setPhoto = () => {
    const want = root.getAttribute('data-theme') === 'light' ? photo.dataset.light : photo.dataset.dark;
    if (photo.getAttribute('src') !== want) photo.setAttribute('src', want);
  };
  setPhoto();
  const metaTheme = $('meta[name="theme-color"]');
  const applyTheme = t => {
    root.setAttribute('data-theme', t);
    metaTheme.setAttribute('content', t === 'light' ? '#f2f5f6' : '#010304');
    try { localStorage.setItem('theme', t); } catch (e) {}
    neural && neural.recolor();
    setPhoto();
  };
  metaTheme.setAttribute('content', root.getAttribute('data-theme') === 'light' ? '#f2f5f6' : '#010304');
  $('.theme-toggle').addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    if (document.startViewTransition && !reduced) document.startViewTransition(() => applyTheme(next));
    else applyTheme(next);
  });

  /* ---------- Mobile menu ---------- */
  const menuBtn = $('.menu-btn'), nav = $('#menu');
  const setMenu = open => {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  $$('a', nav).forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', e => { if (!e.target.closest('.nav')) setMenu(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Scroll: progress, header, active link ---------- */
  const progress = $('.scroll-progress'), shell = $('.nav-shell');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    shell.classList.toggle('scrolled', scrollY > 20);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  const links = $$('nav a[href^="#"]');
  const navObs = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.hash === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50%' });
  $$('main section[id]').forEach(s => navObs.observe(s));

  /* ---------- Reveal + counters ---------- */
  const countUp = el => {
    const target = +el.dataset.count, suffix = el.dataset.suffix || '';
    if (reduced) { el.textContent = target + suffix; return; }
    const t0 = performance.now(), dur = 1400;
    const step = now => {
      const p = Math.min((now - t0) / dur, 1), v = Math.round(target * (1 - Math.pow(1 - p, 3)));
      el.textContent = v + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const revObs = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('visible');
    $$('[data-count]', e.target).forEach(countUp);
    revObs.unobserve(e.target);
  }), { threshold: .12, rootMargin: '0px 0px -40px' });
  $$('.reveal').forEach((el, i) => {
    if (el.classList.contains('card')) el.style.transitionDelay = (i % 3) * 80 + 'ms';
    revObs.observe(el);
  });

  /* ---------- Project filters ---------- */
  const fBtns = $$('.filters button');
  fBtns.forEach(b => b.addEventListener('click', () => {
    fBtns.forEach(x => x.classList.toggle('active', x === b));
    const f = b.dataset.filter;
    $$('.card').forEach(c => {
      const show = f === 'all' || c.dataset.cat.split(' ').includes(f);
      c.classList.toggle('hidden', !show);
      if (show) c.classList.add('visible');
    });
  }));

  /* ---------- Typing role ---------- */
  const roles = ['Computer Vision Engineer', 'AI Engineer', 'Robotics Developer', 'GenAI Builder'];
  const roleEl = $('#role');
  if (!reduced) {
    let r = 0, i = roles[0].length, del = true;
    const type = () => {
      const w = roles[r];
      roleEl.textContent = w.slice(0, i);
      if (!del && i < w.length) { i++; setTimeout(type, 65); }
      else if (!del) { del = true; setTimeout(type, 1600); }
      else if (i > 0) { i--; setTimeout(type, 30); }
      else { del = false; r = (r + 1) % roles.length; setTimeout(type, 250); }
    };
    setTimeout(type, 1800);
  }

  /* ---------- Copy email ---------- */
  const toast = $('.toast');
  const showToast = msg => { toast.textContent = msg; toast.classList.add('show'); clearTimeout(showToast.t); showToast.t = setTimeout(() => toast.classList.remove('show'), 1800); };
  $$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); showToast('Email copied ✓'); }
    catch (e) { showToast(b.dataset.copy); }
  }));

  /* ---------- Pointer effects (desktop only) ---------- */
  if (finePointer && !reduced) {
    const spot = $('.spotlight');
    let sx = innerWidth / 2, sy = innerHeight / 2;
    addEventListener('pointermove', e => {
      sx = e.clientX; sy = e.clientY;
      document.body.classList.add('has-pointer');
      spot.style.transform = `translate(${sx - 260}px,${sy - 260}px)`;
    }, { passive: true });

    $$('.card').forEach(card => {
      card.addEventListener('pointermove', e => {
        const q = card.getBoundingClientRect(), px = (e.clientX - q.left) / q.width, py = (e.clientY - q.top) / q.height;
        card.style.setProperty('--mx', px * 100 + '%');
        card.style.setProperty('--my', py * 100 + '%');
        card.style.transform = `perspective(900px) rotateY(${(px - .5) * 4}deg) rotateX(${(.5 - py) * 4}deg) translateY(-4px)`;
      });
      card.addEventListener('pointerleave', () => card.style.transform = '');
    });

    const heroImg = $('.hero-visual img'), heroSec = $('.hero');
    heroSec.addEventListener('pointermove', e => {
      const px = e.clientX / innerWidth - .5, py = e.clientY / innerHeight - .5;
      heroImg.style.transform = `translate(${px * -14}px,${py * -10}px) scale(1.03)`;
    });
    heroSec.addEventListener('pointerleave', () => heroImg.style.transform = '');

    $$('.magnetic').forEach(m => {
      m.addEventListener('pointermove', e => {
        const q = m.getBoundingClientRect();
        m.style.transform = `translate(${(e.clientX - q.left - q.width / 2) * .2}px,${(e.clientY - q.top - q.height / 2) * .3}px)`;
      });
      m.addEventListener('pointerleave', () => m.style.transform = '');
    });
  }

  /* ---------- Neural network background ---------- */
  var neural = null;
  if (!reduced) {
    const cv = $('#neural'), ctx = cv.getContext('2d');
    let W, H, nodes = [], rgb = '23,233,180', mouse = { x: -9999, y: -9999 }, running = true;
    const recolor = () => { rgb = getComputedStyle(root).getPropertyValue('--neural').trim() || rgb; };
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = innerWidth; H = innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(90, Math.max(28, W * H / 16000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
        r: Math.random() * 1.6 + .6
      }));
    };
    const LINK = () => Math.min(150, Math.max(100, W / 10));
    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      const link = LINK();
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > W) a.vx *= -1;
        if (a.y < 0 || a.y > H) a.vy *= -1;
        const mdx = a.x - mouse.x, mdy = a.y - mouse.y, md = Math.hypot(mdx, mdy);
        if (md < 140) { a.x += mdx / md * .6; a.y += mdy / md * .6; }
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < link) {
            ctx.strokeStyle = `rgba(${rgb},${(1 - d / link) * .12})`;
            ctx.lineWidth = .8;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        ctx.fillStyle = `rgba(${rgb},.3)`;
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
      }
      requestAnimationFrame(draw);
    };
    let rt, lastW = innerWidth; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (Math.abs(innerWidth - lastW) > 40 || innerHeight > H + 120) { lastW = innerWidth; size(); } }, 200); });
    addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) draw(); });
    recolor(); size(); draw();
    neural = { recolor };
  }
})();
