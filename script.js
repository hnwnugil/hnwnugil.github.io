(function () {
  var root = document.documentElement;
  var get = function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } };
  var set = function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} };

  /* phosphor + CRT knobs */
  var phBtns = document.querySelectorAll('[data-ph]');
  function setPh(p) {
    if (p === 'green') root.removeAttribute('data-phosphor'); else root.setAttribute('data-phosphor', p);
    phBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.ph === p)); });
    set('nugil-ph', p);
  }
  phBtns.forEach(function (b) { b.addEventListener('click', function () { setPh(b.dataset.ph); }); });
  var savedPh = get('nugil-ph'); if (savedPh === 'amber' || savedPh === 'white') setPh(savedPh);

  var crt = document.getElementById('crt-toggle');
  function setCrt(on) { root.classList.toggle('crt-off', !on); crt.setAttribute('aria-pressed', String(on)); set('nugil-crt', on ? '1' : '0'); }
  crt.addEventListener('click', function () { setCrt(root.classList.contains('crt-off')); });
  if (get('nugil-crt') === '0') setCrt(false);

  /* copy buttons */
  document.querySelectorAll('.copy').forEach(function (btn) {
    var el = document.getElementById(btn.dataset.target);
    var msg = btn.parentNode.querySelector('.msg');
    btn.addEventListener('click', function () {
      var select = function () {
        var r = document.createRange(); r.selectNodeContents(el);
        var s = getSelection(); s.removeAllRanges(); s.addRange(r);
        msg.textContent = 'SELECTED. PRESS CTRL+C';
      };
      try {
        navigator.clipboard.writeText(el.textContent.trim()).then(function () {
          msg.textContent = 'COPIED OK';
          setTimeout(function () { msg.textContent = ''; }, 1600);
        }, select);
      } catch (e) { select(); }
    });
  });

  /* game NFO popup */
  var NFO = {
    uphill: { file: 'UPHILL_DELIVERY.NFO', title: 'UPHILL DELIVERY', meta: 'genre: platformer',
      desc: 'Wobble. Struggle. Deliver.',
      role: '[ fill in your role ]', url: 'https://nephren8.itch.io/uphill-delivery' },
    onpoint: { file: 'ON_POINT.NFO', title: 'ON POINT', meta: 'Garena Game Jam 2026 · simulation · Windows · prototype',
      desc: 'A simulation about aiming with extreme precision. Silly premise, serious controls.',
      role: 'Programmer.', url: 'https://nugil.itch.io/on-point' },
    djamoe: { file: 'DJAMOE.NFO', title: "D'JAMOE", meta: 'Windows',
      desc: 'Take orders and make herbal drinks (jamu) for the village.',
      role: '[ fill in your role ]', url: 'https://aremeich.itch.io/djamoe' },
    whac: { file: 'WHAC_ALIEN.NFO', title: 'WHAC (A)LIEN', meta: 'GameJam Internal GT Season 13 · arcade · Windows · prototype',
      desc: 'A casual arcade game: whack the bombs with an inverted mouse and avoid the aliens, all in under a minute. Every hit adds a second, every miss costs two, and it gets harder the longer you last.',
      role: 'Game programmer, in a team of two programmers and two artists.', url: 'https://nugil.itch.io/whac-alien' },
    /* ===== NEW GAME POPUP: fill this in ===== */
    newgame: { file: 'NEW_GAME.NFO', title: '', meta: '',
      desc: '',
      role: '', url: 'https://nugil.itch.io/' }
  };
  var overlay = document.getElementById('launch');
  var no = document.getElementById('launch-no');
  var img = document.getElementById('nfo-img');
  var go = document.getElementById('nfo-go');
  var steps = overlay.querySelectorAll('[data-step]');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var timers = [], opener = null;

  function open(card) {
    var d = NFO[card.dataset.id]; if (!d) return;
    opener = card;
    overlay.querySelectorAll('[data-f]').forEach(function (n) { n.textContent = n.dataset.f === 'nfo' ? d.file : d[n.dataset.f]; });
    document.getElementById('nfo-file').textContent = d.file;
    var src = card.querySelector('img');
    img.parentNode.style.display = src ? '' : 'none';
    if (src) { img.src = src.src; img.alt = src.alt; }
    go.href = d.url;
    overlay.hidden = false;
    go.focus();
    timers.forEach(clearTimeout); timers = [];
    if (reduce) { steps.forEach(function (s) { s.classList.remove('pending'); }); return; }
    steps.forEach(function (s) { s.classList.add('pending'); });
    steps.forEach(function (s, i) {
      timers.push(setTimeout(function () { s.classList.remove('pending'); }, 160 + i * 120));
    });
  }
  function close() {
    timers.forEach(clearTimeout); timers = [];
    overlay.hidden = true;
    if (opener) opener.focus();
  }
  document.querySelectorAll('.game').forEach(function (card) {
    card.addEventListener('click', function () { open(card); });
  });
  no.addEventListener('click', close);
  go.addEventListener('click', function () { setTimeout(close, 50); });
  overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
  /* boot sequence */
  (function () {
    var el = document.getElementById('bootseq');
    if (!el) return;
    if (reduce) { el.remove(); return; }

    var out = document.getElementById('bootlines');
    var ph = root.getAttribute('data-phosphor');
    var tube = ph === 'amber' ? 'P3 AMBER' : ph === 'white' ? 'P4 WHITE' : 'P1 GREEN';
    var n = document.querySelectorAll('.game').length;
    var bt = [], ended = false;
    var at = function (ms, fn) { bt.push(setTimeout(fn, ms)); };
    var add = function (html) { var d = document.createElement('div'); d.innerHTML = html; out.appendChild(d); return d; };

    function finish() {
      if (ended) return; ended = true;
      bt.forEach(clearTimeout);
      document.removeEventListener('keydown', skipKey, true);
      el.classList.add('done');
      setTimeout(function () { el.remove(); }, 400);
    }
    function skipKey(e) { if (e.key === 'Tab') return; finish(); }
    el.addEventListener('click', finish);
    document.addEventListener('keydown', skipKey, true);

    var t = 750;
    at(t, function () { add('<span class="big">NUGIL-220 ROM BIOS v2.6</span>   (C) 2026 PENS GAMETECH'); add('&nbsp;'); });
    t += 250;
    at(t, function () {
      var line = add('MEMORY TEST ........ <b>0K</b>'), k = 0;
      var b = line.querySelector('b');
      (function tick() {
        k = Math.min(640, k + 32);
        b.textContent = k + 'K' + (k === 640 ? ' OK' : '');
        if (k < 640) at(28, tick);
      })();
    });
    t += 750;
    at(t, function () { add('DETECTING CRT ...... <b>' + tube + ' OK</b>'); });
    t += 260;
    at(t, function () { add('KEYBOARD ........... <b>OK</b>'); });
    t += 260;
    at(t, function () { add('MOUNT /dev/itch .... <b>' + n + ' TITLES OK</b>'); add('&nbsp;'); });
    t += 320;
    at(t, function () {
      var line = add('LOADING PORTFOLIO.SYS <b>[..........]</b>'), k = 0;
      var b = line.querySelector('b');
      (function tick() {
        k++;
        b.textContent = '[' + '#'.repeat(k) + '.'.repeat(10 - k) + '] ' + (k * 10) + '%';
        if (k < 10) at(70, tick);
      })();
    });
    t += 900;
    at(t, function () { add('&nbsp;'); add('<span class="big">BOOT OK. WELCOME, VISITOR.</span>'); });
    t += 650;
    at(t, finish);
  })();

  document.addEventListener('keydown', function (e) {
    if (overlay.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'Tab') { e.preventDefault(); (document.activeElement === go ? no : go).focus(); }
  });
})();
