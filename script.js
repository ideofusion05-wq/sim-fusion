/* ==========================================================================
   SimFusion — interactions
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- Year ---------- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Nav scroll state + progress bar ---------- */
  var nav = document.getElementById('nav');
  var progress = document.getElementById('scrollProgress');
  var heroBg = document.getElementById('heroBg');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function onScroll() {
    var sc = window.scrollY || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle('scrolled', sc > 40);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (sc / h) * 100 : 0) + '%';
    }
    if (heroBg && !reduce && sc < window.innerHeight) {
      heroBg.style.transform = 'translate3d(0,' + (sc * 0.35) + 'px,0) scale(1.08)';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Stagger service cards ---------- */
  document.querySelectorAll('.service-grid .service-card').forEach(function (c, i) {
    c.style.transitionDelay = (i % 3) * 0.08 + 's';
  });

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
      toggle.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.classList.remove('open');
      });
    });
  }

  /* ---------- Scroll reveal + counters ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        if (e.target.classList.contains('count')) runCount(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('.reveal, .count').forEach(function (el) { io.observe(el); });

  function runCount(el) {
    var to = parseFloat(el.getAttribute('data-to')) || 0;
    var dur = 1400, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * eased).toString();
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = to.toString();
    }
    requestAnimationFrame(step);
  }

  /* ---------- Contact form (demo, no backend) ---------- */
  var form = document.getElementById('contactForm');
  var note = document.getElementById('formNote');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        note.textContent = '⚠ Please enter a valid name and email.';
        note.style.color = '#ff7a7a';
        return;
      }
      note.style.color = '';
      note.textContent = '✓ Thanks ' + name + ' — we\'ll be in touch shortly.';
      form.reset();
    });
  }

  /* ---------- Hero particle / node canvas ---------- */
  var canvas = document.getElementById('heroCanvas');
  if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var ctx = canvas.getContext('2d');
    var w, h, dpr, nodes = [], mouse = { x: -999, y: -999 };
    var COUNT = 66, LINK = 132, ACCENT = '233,233,76';

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function init() {
      nodes = [];
      var n = Math.round(COUNT * Math.min(1, w / 1200));
      for (var i = 0; i < n; i++) {
        nodes.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.6 + 0.6
        });
      }
    }
    function tick() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < nodes.length; i++) {
        var a = nodes[i];
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > w) a.vx *= -1;
        if (a.y < 0 || a.y > h) a.vy *= -1;

        var dmx = a.x - mouse.x, dmy = a.y - mouse.y;
        if (dmx * dmx + dmy * dmy < 18000) { a.x += dmx * 0.006; a.y += dmy * 0.006; }

        for (var j = i + 1; j < nodes.length; j++) {
          var b = nodes[j], dx = a.x - b.x, dy = a.y - b.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK) {
            ctx.strokeStyle = 'rgba(' + ACCENT + ',' + (0.12 * (1 - dist / LINK)) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        ctx.fillStyle = 'rgba(' + ACCENT + ',0.6)';
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
      }
      requestAnimationFrame(tick);
    }
    window.addEventListener('resize', function () { resize(); init(); });
    canvas.addEventListener('mousemove', function (e) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top;
    });
    canvas.addEventListener('mouseleave', function () { mouse.x = mouse.y = -999; });
    resize(); init(); tick();
  }
})();
