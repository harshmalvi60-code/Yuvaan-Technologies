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

// SCROLL REVEAL (lightweight)
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.service-card, .product-card, .why-card, .case-card, .proc-step, .testimonial-card, .feature-tag, .about-left').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

/* =================================================================
   HOMEPAGE REDESIGN — premium interactions
   (guarded; no-ops on pages without these elements)
   ================================================================= */
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  /* ---- Services sticky storyline ---- */
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

  /* ---- Process timeline progressive fill ---- */
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

  /* ---- Magnetic buttons ---- */
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const mx = e.clientX - r.left - r.width / 2;
      const my = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${mx * 0.18}px, ${my * 0.28}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });

  /* ---- Hero card tilt + orb parallax ---- */
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
