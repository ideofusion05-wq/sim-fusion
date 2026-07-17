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

  /* ==========================================================================
     EMAIL DELIVERY
     Every enquiry and application goes to both inboxes below.

     A static page cannot send mail on its own. With FORM_ENDPOINT empty we open
     the visitor's mail app pre-addressed to both (mailto can't carry the resume
     file, so we ask them to attach it). Fill in FORM_ENDPOINT + FORM_ACCESS_KEY
     with a form service (e.g. Web3Forms) and the page posts directly instead —
     resume file included, no mail app needed.
     ========================================================================== */
  var RECIPIENTS = ['hr@sim-fusion.com', 'simfusion26@gmail.com'];
  var FORM_ENDPOINT = '';   // e.g. 'https://api.web3forms.com/submit'
  var FORM_ACCESS_KEY = ''; // access key from that service

  function isEmail(v) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v); }
  function useEndpoint() { return !!(FORM_ENDPOINT && FORM_ACCESS_KEY); }

  function openMail(subject, lines) {
    window.location.href = 'mailto:' + RECIPIENTS.join(',') +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(lines.join('\n'));
  }

  function postForm(fd, subject) {
    fd.append('access_key', FORM_ACCESS_KEY);
    fd.append('subject', subject);
    fd.append('to', RECIPIENTS.join(','));
    return fetch(FORM_ENDPOINT, { method: 'POST', body: fd })
      .then(function (r) { return r.json().catch(function () { return {}; }); });
  }

  /* ---------- Contact form ---------- */
  var form = document.getElementById('contactForm');
  var note = document.getElementById('formNote');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var name = form.elements['name'].value.trim();
      var email = form.elements['email'].value.trim();
      var project = form.elements['project'].value.trim();
      if (!name || !isEmail(email)) {
        note.className = 'form-note warn';
        note.textContent = '⚠ Please enter a valid name and email.';
        return;
      }
      var subject = 'New enquiry — ' + name;
      note.className = 'form-note';

      if (useEndpoint()) {
        note.textContent = 'Sending…';
        postForm(new FormData(form), subject).then(function (res) {
          if (res && res.success === false) {
            note.className = 'form-note warn';
            note.textContent = '⚠ Could not send — please email us directly.';
            return;
          }
          note.textContent = '✓ Thanks ' + name + ' — we\'ll be in touch shortly.';
          form.reset();
        }).catch(function () {
          note.className = 'form-note warn';
          note.textContent = '⚠ Could not send — please email us directly.';
        });
      } else {
        openMail(subject, [
          'Name: ' + name,
          'Email: ' + email,
          'What they want to simulate: ' + (project || '—'),
          '',
          'Sent from the SIMFUSION website.'
        ]);
        note.textContent = '✓ Opening your email app — press send to reach both our inboxes.';
      }
    });
  }

  /* ---------- Apply modal ---------- */
  var modal = document.getElementById('applyModal');
  if (modal) {
    var applyForm = document.getElementById('applyForm');
    var applyTitle = document.getElementById('applyTitle');
    var applyNote = document.getElementById('applyNote');
    var fileInput = document.getElementById('resumeInput');
    var fileText = document.getElementById('fileText');
    var fileField = modal.querySelector('.file-field');
    var FILE_PLACEHOLDER = 'Attach resume file — optional';
    var currentRole = '';
    var lastFocus = null;

    function resetFile() {
      fileText.textContent = FILE_PLACEHOLDER;
      fileField.classList.remove('has-file');
    }
    function openModal(role) {
      currentRole = role;
      applyTitle.textContent = role;
      applyNote.textContent = '';
      applyNote.className = 'modal-note';
      applyForm.reset();
      resetFile();
      modal.hidden = false;
      document.body.classList.add('modal-open');
      lastFocus = document.activeElement;
      setTimeout(function () { applyForm.elements['name'].focus(); }, 60);
    }
    function closeModal() {
      modal.hidden = true;
      document.body.classList.remove('modal-open');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    document.querySelectorAll('.job-apply').forEach(function (btn) {
      btn.addEventListener('click', function () {
        openModal(btn.getAttribute('data-role') || 'Open position');
      });
    });
    modal.addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-close')) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) closeModal();
    });
    fileInput.addEventListener('change', function () {
      var f = fileInput.files[0];
      if (f) { fileText.textContent = f.name; fileField.classList.add('has-file'); }
      else resetFile();
    });

    applyForm.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var name = applyForm.elements['name'].value.trim();
      var email = applyForm.elements['email'].value.trim();
      var msg = applyForm.elements['message'].value.trim();
      var link = applyForm.elements['link'].value.trim();
      var file = fileInput.files[0];
      if (!name || !isEmail(email)) {
        applyNote.className = 'modal-note warn';
        applyNote.textContent = '⚠ Please enter a valid name and email.';
        return;
      }
      var subject = 'Application — ' + currentRole;
      applyNote.className = 'modal-note';

      if (useEndpoint()) {
        applyNote.textContent = 'Sending…';
        var fd = new FormData(applyForm);
        fd.append('position', currentRole);
        postForm(fd, subject).then(function (res) {
          if (res && res.success === false) {
            applyNote.className = 'modal-note warn';
            applyNote.textContent = '⚠ Could not send — please email hr@sim-fusion.com directly.';
            return;
          }
          applyNote.textContent = '✓ Application sent — thanks ' + name + '!';
          setTimeout(closeModal, 1800);
        }).catch(function () {
          applyNote.className = 'modal-note warn';
          applyNote.textContent = '⚠ Could not send — please email hr@sim-fusion.com directly.';
        });
      } else {
        openMail(subject, [
          'Position: ' + currentRole,
          'Name: ' + name,
          'Email: ' + email,
          'What they want to simulate: ' + (msg || '—'),
          'Portfolio / resume link: ' + (link || '—'),
          '',
          file ? 'Resume file: "' + file.name + '" — please attach it before sending.'
               : 'Resume file: none attached.',
          '',
          'Sent from the SIMFUSION website.'
        ]);
        applyNote.textContent = file
          ? '✓ Opening your email app — attach "' + file.name + '" and press send.'
          : '✓ Opening your email app — press send.';
      }
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
