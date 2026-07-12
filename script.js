/* ==========================================================================
   SIMFUSION — interactions
   ========================================================================== */
(function () {
  'use strict';

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Nav + progress ---------- */
  var nav = document.getElementById('nav');
  var progress = document.getElementById('scrollProgress');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function onScroll() {
    var sc = window.scrollY || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle('scrolled', sc > 40);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (sc / h) * 100 : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Stagger capability + portfolio cards ---------- */
  document.querySelectorAll('.cap-grid .cap-card').forEach(function (c, i) {
    c.style.transitionDelay = (i % 3) * 0.08 + 's';
  });
  document.querySelectorAll('.port-grid .port-card').forEach(function (c, i) {
    c.style.transitionDelay = i * 0.1 + 's';
  });

  /* ---------- Work filters ---------- */
  var filterBar = document.getElementById('workFilters');
  var portGrid = document.getElementById('portGrid');
  if (filterBar && portGrid) {
    var cards = [].slice.call(portGrid.querySelectorAll('.port-card'));
    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter');
      if (!btn) return;
      filterBar.querySelectorAll('.filter').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var f = btn.getAttribute('data-filter');
      cards.forEach(function (c) {
        var show = f === 'all' || c.getAttribute('data-cat') === f;
        c.classList.toggle('is-hidden', !show);
      });
      // retrigger pop-in animation
      portGrid.classList.remove('filtering');
      void portGrid.offsetWidth;
      portGrid.classList.add('filtering');
    });
  }

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
      if (p < 1) requestAnimationFrame(step); else el.textContent = to.toString();
    }
    requestAnimationFrame(step);
  }

  /* ---------- Contact form (demo) ---------- */
  var form = document.getElementById('contactForm');
  var note = document.getElementById('formNote');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        note.textContent = '⚠ Please enter a valid name and email.';
        note.style.color = '#ff8a8a';
        return;
      }
      note.style.color = '';
      note.textContent = '✓ Thanks ' + name + ' — we\'ll be in touch shortly.';
      form.reset();
    });
  }

  /* ---------- Hero node network canvas (greenish) ---------- */
  var canvas = document.getElementById('heroCanvas');
  if (canvas && !reduce) {
    var ctx = canvas.getContext('2d');
    var w, h, dpr, nodes = [], mouse = { x: -999, y: -999 };
    var COUNT = 64, LINK = 130;
    var COLORS = ['47,227,176', '34,211,238', '139,92,246']; // green, cyan, purple

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
          vx: (Math.random() - 0.5) * 0.32, vy: (Math.random() - 0.5) * 0.32,
          r: Math.random() * 1.5 + 0.6,
          c: COLORS[i % COLORS.length]
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
        if (dmx * dmx + dmy * dmy < 17000) { a.x += dmx * 0.006; a.y += dmy * 0.006; }
        for (var j = i + 1; j < nodes.length; j++) {
          var b = nodes[j], dx = a.x - b.x, dy = a.y - b.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK) {
            ctx.strokeStyle = 'rgba(' + a.c + ',' + (0.11 * (1 - dist / LINK)) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        ctx.fillStyle = 'rgba(' + a.c + ',0.65)';
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
