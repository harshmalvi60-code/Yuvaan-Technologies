// NAV SCROLL EFFECT
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// HAMBURGER MENU
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', open);
  if (!open) closeAllDropdowns();
});

// MOBILE ACCORDION DROPDOWNS
const MOBILE_BREAKPOINT = 900;
const dropdowns = document.querySelectorAll('.has-dropdown');

function closeAllDropdowns() {
  dropdowns.forEach(d => d.classList.remove('open'));
}

dropdowns.forEach(item => {
  const toggle = item.querySelector('.dropdown-toggle');
  toggle.addEventListener('click', (e) => {
    // Only intercept as an accordion on mobile; let it navigate on desktop
    if (window.innerWidth <= MOBILE_BREAKPOINT) {
      e.preventDefault();
      const isOpen = item.classList.contains('open');
      closeAllDropdowns();
      if (!isOpen) item.classList.add('open');
    }
  });
});

// Reset accordion state when resizing back to desktop
window.addEventListener('resize', () => {
  if (window.innerWidth > MOBILE_BREAKPOINT) {
    closeAllDropdowns();
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }
});

// CLOSE MENU ON LINK CLICK (only real navigation links, not accordion toggles)
navLinks.querySelectorAll('a:not(.dropdown-toggle)').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    closeAllDropdowns();
  });
});

// CONTACT FORM SUBMIT (PLACEHOLDER)
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Message Sent ✓';
    btn.style.background = '#22c55e';
    setTimeout(() => {
      btn.textContent = 'Send Message →';
      btn.style.background = '';
      form.reset();
    }, 3000);
  });
}

/* =================================================================
   PREMIUM EXPERIENCE LAYER
   Shared across homepage + inner pages.
   - Homepage uses explicit .reveal / .magnetic / [data-count] markup.
   - Inner pages get the same treatment auto-applied here.
   ================================================================= */
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isHome = !!document.querySelector('.x-hero');

  /* ---- Auto-parse a metric string into count data ("₹14.2L" -> prefix ₹, 14.2, L) ---- */
  function initAutoCounter(el) {
    if (el.hasAttribute('data-count')) return;
    const m = el.textContent.trim().match(/^(\D*?)(\d+(?:\.\d+)?)(.*)$/);
    if (!m) return;
    const numStr = m[2];
    const dot = numStr.indexOf('.');
    el.dataset.prefix = m[1];
    el.dataset.count = numStr;
    el.dataset.suffix = m[3];
    el.dataset.decimals = dot >= 0 ? String(numStr.length - dot - 1) : '0';
    el.textContent = m[1] + '0' + m[3];
  }

  /* ---- Inner-page auto-enhancement ---- */
  if (!isHome) {
    const revealSel = [
      '.page-hero-inner > *',
      '.product-hero .hero-left > *',
      '.product-hero .hero-right',
      '.section-title', '.section-intro',
      '.service-card', '.problem-card', '.pillar', '.outcome-tile',
      '.feature-group-head', '.solution-bullets', '.solution-split .hero-right',
      '.price-card', '.quote-banner', '.trust-row', '.compare-table',
      '.outcomes-cta', '.about-stats', '.why-card', '.feature-tag'
    ].join(',');
    document.querySelectorAll(revealSel).forEach(el => el.classList.add('reveal'));
    document.querySelectorAll('.outcome-metric').forEach(initAutoCounter);
  }

  /* ---- Make all primary CTAs magnetic ---- */
  document.querySelectorAll('.btn-primary, .btn-dark').forEach(b => b.classList.add('magnetic'));

  /* ---- Scroll reveal (.reveal -> .in) ---- */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if (reduceMotion) {
      revealEls.forEach(el => el.classList.add('in'));
    } else {
      const revObs = new IntersectionObserver((entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            const delay = Math.min(i * 60, 240);
            setTimeout(() => e.target.classList.add('in'), delay);
            revObs.unobserve(e.target);
          }
        });
      }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
      revealEls.forEach(el => revObs.observe(el));
    }
  }

  /* ---- Animated counters ([data-count]) ---- */
  const fmt = (val, decimals) =>
    decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString('en-IN');

  function runCounter(el) {
    const target = parseFloat(el.dataset.count) || 0;
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = prefix + fmt(target, decimals) + suffix; return; }
    const dur = 1400;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + fmt(target * eased, decimals) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + fmt(target, decimals) + suffix;
    }
    requestAnimationFrame(tick);
  }

  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const cObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { runCounter(e.target); cObs.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(el => cObs.observe(el));
  }

  /* ---- Services sticky storyline (homepage) ---- */
  const svcItems = Array.from(document.querySelectorAll('.x-svc-item'));
  const stage = document.querySelector('.x-svc-stage');
  if (svcItems.length && stage) {
    const idxEl = stage.querySelector('[data-index]');
    const icoEl = stage.querySelector('[data-icon]');
    const nameEl = stage.querySelector('[data-name]');
    const progEl = stage.querySelector('[data-progress]');
    const curEl = stage.querySelector('[data-current]');
    const total = svcItems.length;

    function activate(i) {
      svcItems.forEach((it, n) => it.classList.toggle('is-active', n === i));
      const item = svcItems[i];
      const no = String(i + 1).padStart(2, '0');
      if (idxEl) idxEl.textContent = no;
      if (icoEl) icoEl.textContent = item.dataset.icon || '';
      if (nameEl) nameEl.innerHTML = item.dataset.name || '';
      if (progEl) progEl.style.width = ((i + 1) / total * 100) + '%';
      if (curEl) curEl.textContent = no;
    }

    const svcObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) activate(svcItems.indexOf(e.target));
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    svcItems.forEach(it => svcObs.observe(it));
  }

  /* ---- Process timeline progressive fill (homepage) ---- */
  const timeline = document.querySelector('.x-timeline');
  const fill = document.querySelector('[data-fill]');
  if (timeline && fill && !reduceMotion) {
    let ticking = false;
    function updateFill() {
      const rect = timeline.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height;
      const progressed = Math.min(Math.max(vh * 0.55 - rect.top, 0), total);
      fill.style.height = (total ? (progressed / total) * 100 : 0) + '%';
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(updateFill); ticking = true; }
    }, { passive: true });
    updateFill();
  } else if (fill) {
    fill.style.height = '100%';
  }

  if (reduceMotion) return;

  /* ---- Hero card tilt + orb parallax (homepage) ---- */
  const hero = document.querySelector('.x-hero');
  const tilt = document.querySelector('.x-tilt');
  const orbs = document.querySelectorAll('.x-hero .x-orb');
  if (hero && (tilt || orbs.length)) {
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      if (tilt) tilt.style.transform = `perspective(900px) rotateY(${px * 6}deg) rotateX(${-py * 6}deg)`;
      orbs.forEach((orb, i) => {
        const depth = (i + 1) * 14;
        orb.style.transform = `translate(${px * depth}px, ${py * depth}px)`;
      });
    });
    hero.addEventListener('mouseleave', () => {
      if (tilt) tilt.style.transform = '';
      orbs.forEach(orb => { orb.style.transform = ''; });
    });
  }
})();

/* =================================================================
   HERO VIDEO LIGHTBOX
   Injects the YouTube iframe only on click (fast initial load),
   and removes it on close to stop playback.
   ================================================================= */
(function () {
  const modal = document.getElementById('videoModal');
  const frame = document.getElementById('videoFrame');
  const triggers = document.querySelectorAll('[data-video]');
  if (!modal || !frame || !triggers.length) return;

  let lastFocused = null;

  function open(id) {
    lastFocused = document.activeElement;
    frame.innerHTML =
      '<iframe src="https://www.youtube-nocookie.com/embed/' + id +
      '?autoplay=1&rel=0&modestbranding=1&playsinline=1" title="Yuvaan Technologies video" ' +
      'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ' +
      'referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const closeBtn = modal.querySelector('.x-modal-close');
    if (closeBtn) closeBtn.focus();
  }

  function close() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => { frame.innerHTML = ''; }, 300);
    if (lastFocused) lastFocused.focus();
  }

  triggers.forEach(t => t.addEventListener('click', () => open(t.dataset.video)));
  modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', close));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) close();
  });
})();

/* =================================================================
   CONTACT MODAL + SMOOTH SCROLL
   ================================================================= */
(function () {
  const modal = document.getElementById('contactModal');
  const triggers = document.querySelectorAll('[data-open-contact]');

  if (modal && triggers.length) {
    let lastFocused = null;
    function open() {
      lastFocused = document.activeElement;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      const first = modal.querySelector('input, textarea, button');
      if (first) setTimeout(() => first.focus(), 200);
    }
    function close() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocused) lastFocused.focus();
    }
    triggers.forEach(t => t.addEventListener('click', (e) => { e.preventDefault(); open(); }));
    modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', close));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) close();
    });
  }

  /* Smooth scroll for in-page anchors marked [data-scroll] */
  document.querySelectorAll('[data-scroll]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id && id.startsWith('#')) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          const top = target.getBoundingClientRect().top + window.pageYOffset - 80;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    });
  });
})();

/* =================================================================
   SCROLL PROGRESS BAR (global, performance-friendly)
   ================================================================= */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const bar = document.createElement('div');
  bar.className = 'yt-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  let ticking = false;
  function update() {
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - doc.clientHeight;
    const pct = scrollable > 0 ? (doc.scrollTop / scrollable) * 100 : 0;
    bar.style.width = pct + '%';
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
})();

/* =================================================================
   CREATIVE CUSTOM CURSOR
   - Dot tracks the pointer in real time
   - Ring trails with eased lerp
   - Morphs on interactive elements with a contextual label
   - Skipped for touch devices and reduced-motion
   ================================================================= */
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (reduceMotion || !fineHover) return;

  const dot = document.createElement('div');
  const ring = document.createElement('div');
  const label = document.createElement('span');
  dot.className = 'yt-cursor-dot';
  ring.className = 'yt-cursor-ring';
  label.className = 'yt-cursor-label';
  ring.appendChild(label);
  document.body.append(dot, ring);
  document.documentElement.classList.add('has-yt-cursor');

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;
  let hidden = true;

  function setLabel(text) {
    if (text) { label.textContent = text; ring.classList.add('has-label'); }
    else { ring.classList.remove('has-label'); label.textContent = ''; }
  }

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    if (hidden) {
      hidden = false;
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    }
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    hidden = true;
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });

  document.addEventListener('mousedown', () => ring.classList.add('is-down'));
  document.addEventListener('mouseup',   () => ring.classList.remove('is-down'));

  function tick() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    dot.style.transform  = `translate3d(${mx}px, ${my}px, 0)`;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  /* ---- Contextual morph + label ---- */
  const linkSel = 'a, button, [role="button"], [data-open-contact], [data-scroll], ' +
                  '.x-card, .x-prod, .pm-case, .pm-result, .pm-what-card, .x-step, ' +
                  '.x-why2-card, .x-proj, label, .hamburger';
  const videoSel = '[data-video], .x-video';
  const inputSel = 'input, textarea, select, [contenteditable="true"]';
  const callSel  = '[href^="tel:"]';

  document.addEventListener('mouseover', (e) => {
    const t = e.target.closest(linkSel + ',' + videoSel + ',' + inputSel);
    if (!t) { ring.classList.remove('is-hover'); setLabel(''); return; }
    ring.classList.add('is-hover');

    if (t.matches(videoSel) || t.closest(videoSel)) { setLabel('Watch'); return; }
    if (t.matches(callSel)  || t.closest(callSel))  { setLabel('Call');  return; }
    if (t.matches(inputSel)) { ring.classList.add('is-text'); setLabel(''); return; }
    if (t.matches('a[href^="http"], a[target="_blank"]')) { setLabel('Visit'); return; }
    if (t.matches('.x-card, .x-prod, .pm-case, .x-proj, .x-step, .x-why2-card, .pm-result, .pm-what-card')) {
      setLabel('Explore'); return;
    }
    if (t.matches('[data-open-contact]')) { setLabel('Connect'); return; }
    setLabel('');
  });

  document.addEventListener('mouseout', (e) => {
    if (!e.relatedTarget || !e.relatedTarget.closest(linkSel + ',' + videoSel + ',' + inputSel)) {
      ring.classList.remove('is-hover', 'is-text');
      setLabel('');
    }
  });
})();

/* =================================================================
   HEADER CALL + WHATSAPP BUTTONS
   Inject into the existing nav (before Contact) on every page —
   uses the original WhatsApp green so it reads as the real product icon.
   ================================================================= */
(function () {
  const list = document.getElementById('navLinks');
  if (!list || list.querySelector('.nav-cta-group')) return;

  const contactItem = list.querySelector('.btn-nav')?.closest('li');

  const li = document.createElement('li');
  li.className = 'nav-cta-group';
  li.innerHTML = '' +
    '<a class="nav-cta nav-call" href="tel:+918080404314" aria-label="Call 8080404314">' +
      '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">' +
        '<path fill="currentColor" d="M19.95 15.46l-3.04-.35a1.5 1.5 0 0 0-1.32.45l-2.2 2.2a14.07 14.07 0 0 1-6.16-6.16l2.21-2.21a1.5 1.5 0 0 0 .44-1.32L9.54 5a1.5 1.5 0 0 0-1.5-1.32H5a1.5 1.5 0 0 0-1.5 1.58 16.5 16.5 0 0 0 15.42 15.42 1.5 1.5 0 0 0 1.58-1.5v-3.04a1.5 1.5 0 0 0-1.32-1.5z"/>' +
      '</svg>' +
      '<span>Call</span>' +
    '</a>' +
    '<a class="nav-cta nav-wa" href="https://api.whatsapp.com/send/?phone=918080404314" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">' +
      '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">' +
        '<path fill="currentColor" d="M12.04 2A9.97 9.97 0 0 0 2 11.95c0 1.76.46 3.48 1.34 5L2 22l5.21-1.31a10 10 0 0 0 4.83 1.24h.01A9.96 9.96 0 0 0 22 11.95 9.93 9.93 0 0 0 19.07 4.9 9.95 9.95 0 0 0 12.04 2zm0 18.18a8.27 8.27 0 0 1-4.2-1.15l-.3-.18-3.1.79.83-3.02-.2-.31a8.23 8.23 0 1 1 6.97 3.87zm4.74-6.18c-.26-.13-1.53-.75-1.77-.83-.24-.09-.4-.13-.58.13-.18.26-.66.83-.81 1-.15.17-.3.19-.55.06a6.7 6.7 0 0 1-1.97-1.22 7.43 7.43 0 0 1-1.37-1.7c-.14-.25-.02-.39.12-.52.12-.12.26-.31.39-.46.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.47-.06-.13-.58-1.4-.79-1.91-.2-.5-.41-.43-.58-.43h-.5c-.17 0-.45.06-.69.32-.24.26-.91.89-.91 2.17 0 1.28.93 2.52 1.06 2.69.13.18 1.83 2.8 4.43 3.93.62.27 1.1.43 1.48.55.62.2 1.18.17 1.62.1.5-.07 1.53-.62 1.75-1.22.22-.6.22-1.11.15-1.22-.07-.11-.24-.18-.5-.31z"/>' +
      '</svg>' +
      '<span>WhatsApp</span>' +
    '</a>';

  if (contactItem) list.insertBefore(li, contactItem);
  else list.appendChild(li);
})();
