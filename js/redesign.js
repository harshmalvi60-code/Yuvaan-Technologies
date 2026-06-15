/* ==========================================================================
   YUVAAN TECHNOLOGIES — HOMEPAGE INTERACTIONS
   Premium micro-interactions layered on top of main.js (nav stays shared).
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------------------
     1. SCROLL PROGRESS BAR
     ---------------------------------------------------------------------- */
  var bar = document.getElementById('scrollProgress');
  function updateProgress() {
    if (!bar) return;
    var h = document.documentElement;
    var scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
    bar.style.width = (scrolled * 100) + '%';
  }

  /* ----------------------------------------------------------------------
     2. REVEAL ON SCROLL (+ stagger children)
     ---------------------------------------------------------------------- */
  var revealEls = document.querySelectorAll('[data-reveal], [data-stagger]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (el.hasAttribute('data-stagger')) {
          Array.prototype.forEach.call(el.children, function (child, i) {
            child.style.transitionDelay = (i * 90) + 'ms';
          });
        }
        el.classList.add('is-in');
        revealObs.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { revealObs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ----------------------------------------------------------------------
     3. HERO HEADLINE WORD REVEAL
     ---------------------------------------------------------------------- */
  var headline = document.querySelector('.hero-headline');
  if (headline) {
    if (reduceMotion) {
      headline.classList.add('is-in');
    } else {
      requestAnimationFrame(function () {
        var words = headline.querySelectorAll('.word');
        words.forEach(function (w, i) { w.style.transitionDelay = (180 + i * 90) + 'ms'; });
        headline.classList.add('is-in');
      });
    }
  }

  /* ----------------------------------------------------------------------
     4. MANIFESTO — WORD-BY-WORD COLOUR FILL
     ---------------------------------------------------------------------- */
  var manifesto = document.querySelector('[data-words]');
  if (manifesto) {
    // Wrap each word (preserving inline elements like .accent) in a span.
    var wrapWords = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (part.trim() === '') {
              frag.appendChild(document.createTextNode(part));
            } else {
              var s = document.createElement('span');
              s.className = 'word-r';
              s.textContent = part;
              frag.appendChild(s);
            }
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          child.classList.add('word-r');
        }
      });
    };
    wrapWords(manifesto);
    var mWords = manifesto.querySelectorAll('.word-r');
    mWords.forEach(function (w) { w.style.color = ''; });

    if (reduceMotion) {
      mWords.forEach(function (w) { if (!w.classList.contains('accent')) w.style.color = 'var(--dark)'; });
    } else {
      // initial dim state
      mWords.forEach(function (w) {
        if (!w.classList.contains('accent')) w.style.color = 'var(--border)';
        w.style.transition = 'color 0.4s var(--ease-out)';
      });
      var litTo = 0;
      var fillManifesto = function () {
        var rect = manifesto.getBoundingClientRect();
        var vh = window.innerHeight;
        // progress 0..1 as the block travels through the comfortable read zone
        var start = vh * 0.85, end = vh * 0.35;
        var p = (start - rect.top) / (start - end);
        p = Math.max(0, Math.min(1, p));
        var target = Math.round(p * mWords.length);
        if (target === litTo) return;
        for (var i = 0; i < mWords.length; i++) {
          if (mWords[i].classList.contains('accent')) continue;
          mWords[i].style.color = i < target ? 'var(--dark)' : 'var(--border)';
        }
        litTo = target;
      };
      window.addEventListener('scroll', fillManifesto, { passive: true });
      fillManifesto();
    }
  }

  /* ----------------------------------------------------------------------
     5. COUNT-UP NUMBERS
     ---------------------------------------------------------------------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var suffix = el.getAttribute('data-suffix') || '';
    if (isNaN(target)) return;
    if (reduceMotion) { el.textContent = target.toFixed(decimals) + suffix; return; }
    var dur = 1500, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animateCount(entry.target); countObs.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { countObs.observe(c); });
  } else {
    counters.forEach(animateCount);
  }

  /* ----------------------------------------------------------------------
     6. SERVICES — INTERACTIVE TABS
     ---------------------------------------------------------------------- */
  var svcItems = document.querySelectorAll('.svc-item');
  var svcPanels = document.querySelectorAll('.svc-panel');
  function activateSvc(idx) {
    svcItems.forEach(function (it) { it.classList.toggle('active', it.getAttribute('data-svc') === String(idx)); });
    svcPanels.forEach(function (p) { p.classList.toggle('active', p.getAttribute('data-panel') === String(idx)); });
  }
  svcItems.forEach(function (item) {
    var idx = item.getAttribute('data-svc');
    item.addEventListener('click', function () { activateSvc(idx); });
    item.addEventListener('mouseenter', function () {
      if (window.innerWidth > 900) activateSvc(idx);
    });
  });

  /* ----------------------------------------------------------------------
     7. PROCESS — JOURNEY PROGRESS LINE + NODE ACTIVATION
     ---------------------------------------------------------------------- */
  var journey = document.getElementById('journey');
  var journeyProgress = document.getElementById('journeyProgress');
  var journeySteps = document.querySelectorAll('.journey-step');
  function updateJourney() {
    if (!journey || !journeyProgress) return;
    var rect = journey.getBoundingClientRect();
    var vh = window.innerHeight;
    var total = rect.height;
    var p = (vh * 0.6 - rect.top) / total;
    p = Math.max(0, Math.min(1, p));
    journeyProgress.style.height = (p * 100) + '%';
    journeySteps.forEach(function (step) {
      var r = step.getBoundingClientRect();
      if (r.top < vh * 0.65) step.classList.add('is-in');
    });
  }

  /* ----------------------------------------------------------------------
     8. VOICE — TESTIMONIAL SWITCHER
     ---------------------------------------------------------------------- */
  var voicePeople = document.querySelectorAll('.voice-person');
  var voiceQuote = document.getElementById('voiceQuote');
  voicePeople.forEach(function (person) {
    person.addEventListener('click', function () {
      voicePeople.forEach(function (p) { p.classList.remove('active'); });
      person.classList.add('active');
      if (voiceQuote) {
        voiceQuote.style.opacity = '0';
        voiceQuote.style.transform = 'translateY(10px)';
        setTimeout(function () {
          voiceQuote.innerHTML = person.getAttribute('data-quote');
          voiceQuote.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
          voiceQuote.style.opacity = '1';
          voiceQuote.style.transform = 'none';
        }, 200);
      }
    });
  });

  /* ----------------------------------------------------------------------
     9. PARALLAX (hero layers)
     ---------------------------------------------------------------------- */
  var parallaxEls = document.querySelectorAll('[data-parallax]');
  function updateParallax() {
    if (reduceMotion) return;
    var y = window.scrollY;
    parallaxEls.forEach(function (el) {
      var speed = parseFloat(el.getAttribute('data-parallax')) || 0;
      el.style.transform = 'translateY(' + (y * speed / 100) + 'px)';
    });
  }

  /* ----------------------------------------------------------------------
     10. MAGNETIC BUTTONS + CUSTOM CURSOR
     ---------------------------------------------------------------------- */
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (finePointer && !reduceMotion) {
    // Magnetic
    document.querySelectorAll('.magnetic').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var mx = e.clientX - r.left - r.width / 2;
        var my = e.clientY - r.top - r.height / 2;
        btn.style.transform = 'translate(' + mx * 0.25 + 'px,' + my * 0.35 + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });

    // Cursor
    var dot = document.getElementById('cursorDot');
    var ring = document.getElementById('cursorRing');
    if (dot && ring) {
      var rx = 0, ry = 0, dx = 0, dy = 0;
      document.addEventListener('mousemove', function (e) {
        dx = e.clientX; dy = e.clientY;
        dot.style.transform = 'translate(' + dx + 'px,' + dy + 'px) translate(-50%,-50%)';
        document.body.classList.add('cursor-ready');
      });
      (function loop() {
        rx += (dx - rx) * 0.18; ry += (dy - ry) * 0.18;
        ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
        requestAnimationFrame(loop);
      })();
      document.querySelectorAll('a, button, [data-cursor]').forEach(function (el) {
        el.addEventListener('mouseenter', function () { ring.classList.add('is-hover'); });
        el.addEventListener('mouseleave', function () { ring.classList.remove('is-hover'); });
      });
    }
  }

  /* ----------------------------------------------------------------------
     RAF-throttled scroll loop
     ---------------------------------------------------------------------- */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      updateProgress();
      updateJourney();
      updateParallax();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();
})();
