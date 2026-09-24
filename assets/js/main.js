/* BARAX — sitio v4 */
(function () {
  'use strict';

  var EN_PAGE = document.documentElement.lang === 'en';
  function t(es, en) { return EN_PAGE ? en : es; }
  document.querySelectorAll('.lang a').forEach(function (a) {
    a.addEventListener('click', function () { try { localStorage.setItem('barax-lang', a.getAttribute('hreflang')); } catch (e) {} });
  });

  /* ── Navegación ── */
  var nav = document.getElementById('nav');
  var burger = document.getElementById('burger');
  var links = document.getElementById('navLinks');
  function onScroll() { nav.classList.toggle('is-solid', window.scrollY > 40 || links.classList.contains('is-open')); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  function closeMenu() { links.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); onScroll(); }
  burger.addEventListener('click', function () {
    var open = links.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
    onScroll();
  });
  links.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* ── Videos del hero (rotación con etiquetas de dominio) ── */
  var videos = [].slice.call(document.querySelectorAll('.hero-video'));
  var doms = [].slice.call(document.querySelectorAll('.hero-domains .dom'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var saveData = navigator.connection && navigator.connection.saveData;
  function load(v) { if (!v.src && v.dataset.src) { v.src = v.dataset.src; } }
  function play(v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  if (videos.length && !reduce && !saveData) {
    var i = 0;
    load(videos[0]); play(videos[0]);
    load(videos[1]);
    var timer = setInterval(function () {
      var prev = videos[i];
      i = (i + 1) % videos.length;
      var next = videos[i];
      load(next);
      try { next.currentTime = 0; } catch (e) {}
      play(next);
      next.classList.add('is-active');
      doms.forEach(function (d, k) { d.classList.toggle('is-active', k === i); });
      setTimeout(function () { prev.classList.remove('is-active'); prev.pause(); }, 1200);
      load(videos[(i + 1) % videos.length]);
    }, 7000);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) videos.forEach(function (v) { v.pause(); });
      else play(videos[i]);
    });
  }

  /* ── Aparición al hacer scroll ── */
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.sec-head, .level, .cap, .env, .steps li, .form, .proof-item').forEach(function (el) {
      el.classList.add('reveal'); io.observe(el);
    });
  }

  /* ── Copiar correo ── */
  var copyBtn = document.getElementById('copyMail');
  if (copyBtn) copyBtn.addEventListener('click', function () {
    var label = copyBtn.textContent;
    var done = function () { copyBtn.textContent = t('Copiado', 'Copied'); setTimeout(function () { copyBtn.textContent = label; }, 1800); };
    if (navigator.clipboard) navigator.clipboard.writeText('contacto@baraxdefense.com').then(done, function () {});
  });

  /* ── Formulario: Web3Forms si hay clave; si no, correo prellenado ── */
  var form = document.getElementById('contactForm');
  var status = document.getElementById('formStatus');
  function say(msg, ok) { if (!status) return; status.textContent = msg; status.className = 'form-status full ' + (ok ? 'is-ok' : 'is-err'); }
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    form.querySelectorAll('[required]').forEach(function (f) {
      var bad = !f.value.trim() || (f.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value));
      f.setAttribute('aria-invalid', String(bad)); if (bad) ok = false;
    });
    if (!ok) { form.querySelector('[aria-invalid="true"]').focus(); return; }
    var d = new FormData(form);
    if (d.get('botcheck')) return;
    var subject = 'Solicitud web — ' + d.get('need') + ' — ' + d.get('org');
    var body = 'Nombre y cargo: ' + d.get('name') + '\nEntidad: ' + d.get('org') + '\nCorreo: ' + d.get('email') + '\nNecesidad: ' + d.get('need') + '\nIdioma: ' + (EN_PAGE ? 'EN' : 'ES') + '\n\n' + d.get('msg');
    var key = form.dataset.w3fKey;
    var mailto = 'mailto:contacto@baraxdefense.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    if (!key) { window.location.href = mailto; return; }
    var btn = form.querySelector('button[type=submit]'); var label = btn.textContent;
    btn.disabled = true; btn.textContent = t('Enviando…', 'Sending…');
    fetch('https://api.web3forms.com/submit', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ access_key: key, subject: subject, from_name: 'Sitio web BARAX', replyto: d.get('email'), message: body })
    }).then(function (r) { return r.json(); }).then(function (res) {
      if (res.success) { form.reset(); say(t('Gracias. Recibimos su solicitud y le responderemos en un día hábil.', 'Thank you. We received your request and will reply within one business day.'), true); }
      else throw new Error(res.message);
    }).catch(function () {
      say(t('No pudimos enviar el formulario. Escríbanos a contacto@baraxdefense.com.', 'We could not send the form. Please write to contacto@baraxdefense.com.'), false);
    }).then(function () { btn.disabled = false; btn.textContent = label; });
  });
})();
