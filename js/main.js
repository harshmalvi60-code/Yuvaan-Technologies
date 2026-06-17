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

// MOTION PREFERENCE
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// SCROLL REVEAL — staggered, class-driven (styles live in CSS .reveal)
const revealSelector = [
  '.service-card', '.product-card', '.why-card', '.case-card', '.proc-step',
  '.testimonial-card', '.feature-tag', '.about-left', '.about-right',
  '.outcome-tile', '.price-card', '.pillar', '.problem-card',
  '.section-title', '.section-intro', '.solution-bullets li', '.compare-table'
].join(', ');

const revealEls = document.querySelectorAll(revealSelector);

if (prefersReduced) {
  revealEls.forEach(el => el.classList.add('reveal', 'is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  // Stagger siblings within the same parent for a smooth cascade
  const groupCounts = new Map();
  revealEls.forEach(el => {
    el.classList.add('reveal');
    const parent = el.parentElement;
    const idx = groupCounts.get(parent) || 0;
    el.style.transitionDelay = Math.min(idx * 70, 350) + 'ms';
    groupCounts.set(parent, idx + 1);
    revealObserver.observe(el);
  });
}

// COUNT-UP — animates numeric values into view (preserves prefixes/suffixes)
function animateCount(el) {
  const text = el.textContent.trim();
  const match = text.match(/-?\d+(\.\d+)?/);
  if (!match) return;
  const numStr = match[0];
  const end = parseFloat(numStr);
  const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0;
  const prefix = text.slice(0, match.index);
  const suffix = text.slice(match.index + numStr.length);
  const duration = 1400;
  const start = performance.now();

  function frame(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = prefix + (end * eased).toFixed(decimals) + suffix;
    if (p < 1) {
      requestAnimationFrame(frame);
    } else {
      el.textContent = prefix + numStr + suffix; // restore exact original
    }
  }
  requestAnimationFrame(frame);
}

const countEls = document.querySelectorAll('.stat-num, .cm-num, .dm-value, .df-num, .outcome-metric');
if (!prefersReduced && countEls.length) {
  const countObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  countEls.forEach(el => countObserver.observe(el));
}
