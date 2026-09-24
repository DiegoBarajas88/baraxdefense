/* BARAX — sitio v4 */
(function () {
  'use strict';

  /* ── Idioma (ES por defecto; EN por diccionario) ── */
  var EN = {
    'skip': 'Skip to content',
    'nav.solutions': 'Solutions', 'nav.environments': 'Environments', 'nav.method': 'How we work', 'nav.company': 'Company', 'nav.cta': 'Request a quote',
    'hero.eyebrow': 'Supplier to the Colombian Armed Forces and Police',
    'hero.title': 'From supply to <em>integrated</em> defense systems',
    'hero.sub': 'We equip, connect and integrate capabilities across sea, land, air and cyberspace, with world-class technology partners.',
    'hero.cta1': 'Request a quote', 'hero.cta2': 'See solutions',
    'dom.sea': 'Maritime', 'dom.land': 'Land', 'dom.urban': 'Urban',
    'proof.1': 'Operating since', 'proof.2': 'Forces and institutions served', 'proof.3': 'Registered · public procurement via SECOP II', 'proof.4': 'Sea · Land · Air · Cyber',
    'clients.label': 'We have served', 'clients.1': 'Colombian Navy', 'clients.2': 'Colombian Army', 'clients.3': 'Colombian Aerospace Force', 'clients.4': 'Anti-Narcotics Police',
    'sol.eyebrow': 'Solutions', 'sol.title': 'Three levels, <em>one relationship</em>',
    'sol.lead': 'We start with what your unit needs today and scale up to full integration, with a single accountable partner.',
    'lv1.name': 'Supply', 'lv1.hint': 'Equipment and spare parts', 'lv2.name': 'Capabilities', 'lv2.hint': 'Technology with partners', 'lv3.name': 'Integration', 'lv3.hint': 'One command picture',
    'lv1.title': 'Mission-ready equipment and spare parts',
    'lv1.text': 'We source, verify and deliver what your unit needs, within contract deadlines.',
    'lv1.c1': 'Naval spare parts', 'lv1.c2': 'Damage control and firefighting', 'lv1.c3': 'Tactical gear', 'lv1.c4': 'Night vision', 'lv1.c5': 'Tactical vehicles', 'lv1.c6': 'Aviation components',
    'lv2.title': 'Technology from leading manufacturers, configured for your mission',
    'lv2.text': 'We select, configure and commission systems from our international technology partners.',
    'cap1.t': 'Surveillance and reconnaissance', 'cap1.d': 'Radar, thermal and long-range cameras to see first.',
    'cap2.t': 'Tactical communications', 'cap2.d': 'Encrypted radio, satellite and resilient field networks.',
    'cap3.t': 'Electronic warfare and cyber defense', 'cap3.d': 'Spectrum management and protection of critical networks.', 'cap3.n': 'Authorized entities only',
    'cap4.t': 'Unmanned and counter-drone', 'cap4.d': 'Patrol drones, autonomous vessels and defense against hostile drones.',
    'lv3.title': 'Everything connected in one command picture',
    'lv3.text': 'We connect sensors, communications and platforms from different manufacturers into one C4ISR system (command, control, communications, computers, intelligence, surveillance and reconnaissance).',
    'stack.3': 'C4ISR integration', 'stack.2': 'Sensors · Communications · Platforms', 'stack.1': 'Equipment and spare parts',
    'env.eyebrow': 'Environments', 'env.title': 'Wherever you need to <em>see, connect and protect</em>',
    'env1.t': 'Maritime and riverine', 'env1.d': 'Maritime domain awareness, coastal patrol and support for units afloat.',
    'env2.t': 'Land and borders', 'env2.d': 'Persistent sensors, tactical mobility and perimeter surveillance.',
    'env3.t': 'Air', 'env3.d': 'Aerial reconnaissance and airspace protection against drones.',
    'env4.t': 'Public safety and major events', 'env4.d': 'Crowd monitoring, critical infrastructure protection and inter-agency coordination.',
    'met.eyebrow': 'How we work', 'met.title': 'Four steps, <em>one accountable partner</em>',
    'st1.t': 'Assessment', 'st1.d': 'We understand the operational need and the tender.',
    'st2.t': 'Configuration', 'st2.d': 'We choose the manufacturer and fit it to the real environment.',
    'st3.t': 'Delivery', 'st3.d': 'We meet schedule, guarantees and formal acceptance.',
    'st4.t': 'Support', 'st4.d': 'Training, spare parts and backing across the life cycle.',
    'co.eyebrow': 'Company', 'co.title': 'A Colombian company <em>serving defense</em>',
    'co.p1': 'BARAX Defense & Technology is the brand of Inversiones Barajas & Asociados S.A.S., a defense-sector supplier since 2018.',
    'co.p2': 'We are not a catalog: every contract is treated as a delivery commitment, from bid to close-out.',
    'co.l1': 'Legal name', 'co.l3': 'Headquarters', 'co.l4': 'Registry', 'co.l4v': 'RUP — Bogotá Chamber of Commerce', 'co.l5': 'Public procurement',
    'ct.eyebrow': 'Contact', 'ct.title': 'Tell us what <em>your unit needs</em>',
    'ct.lead': 'We reply within one business day with a proposal or the technical questions we need answered.',
    'ct.mail': 'Email', 'ct.copy': 'Copy',
    'f.name': 'Name and position', 'f.org': 'Organization', 'f.email': 'Email', 'f.need': 'Type of need',
    'f.o1': 'Equipment or spare parts supply', 'f.o2': 'Technology capabilities', 'f.o3': 'Systems integration', 'f.o4': 'Ongoing procurement process', 'f.o5': 'Partnership or brand representation',
    'f.msg': 'Message', 'f.send': 'Send request',
    'f.note': 'Submitting opens your email client with the request ready. Your data is used only to reply to you.'
  };
  var ES = {};
  var textNodes = document.querySelectorAll('[data-i18n]');
  var htmlNodes = document.querySelectorAll('[data-i18n-html]');
  textNodes.forEach(function (el) { ES[el.dataset.i18n] = el.textContent; });
  htmlNodes.forEach(function (el) { ES[el.dataset.i18nHtml] = el.innerHTML; });

  function setLang(lang) {
    var dict = lang === 'en' ? EN : ES;
    textNodes.forEach(function (el) { var v = dict[el.dataset.i18n]; if (v) el.textContent = v; });
    htmlNodes.forEach(function (el) { var v = dict[el.dataset.i18nHtml]; if (v) el.innerHTML = v; });
    document.documentElement.lang = lang;
    document.querySelectorAll('.lang button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === lang)); });
    try { localStorage.setItem('barax-lang', lang); } catch (e) {}
  }
  var saved = null;
  try { saved = localStorage.getItem('barax-lang'); } catch (e) {}
  var initial = saved || ((navigator.language || 'es').toLowerCase().indexOf('es') === 0 ? 'es' : 'en');
  if (initial === 'en') setLang('en');
  document.querySelectorAll('.lang button').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.dataset.lang); });
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
    document.querySelectorAll('.sec-head, .level, .cap, .env, .steps li, .legal-card, .form, .proof-item').forEach(function (el) {
      el.classList.add('reveal'); io.observe(el);
    });
  }

  /* ── Copiar correo ── */
  var copyBtn = document.getElementById('copyMail');
  if (copyBtn) copyBtn.addEventListener('click', function () {
    var label = copyBtn.textContent;
    var done = function () { copyBtn.textContent = document.documentElement.lang === 'en' ? 'Copied' : 'Copiado'; setTimeout(function () { copyBtn.textContent = label; }, 1800); };
    if (navigator.clipboard) navigator.clipboard.writeText('contacto@baraxdefense.com').then(done, function () {});
  });

  /* ── Formulario → correo prellenado ── */
  var form = document.getElementById('contactForm');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    form.querySelectorAll('[required]').forEach(function (f) {
      var bad = !f.value.trim() || (f.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value));
      f.setAttribute('aria-invalid', String(bad)); if (bad) ok = false;
    });
    if (!ok) { form.querySelector('[aria-invalid="true"]').focus(); return; }
    var d = new FormData(form);
    var subject = 'Solicitud web — ' + d.get('need') + ' — ' + d.get('org');
    var body = 'Nombre y cargo: ' + d.get('name') + '\nEntidad: ' + d.get('org') + '\nCorreo: ' + d.get('email') + '\nNecesidad: ' + d.get('need') + '\n\n' + d.get('msg');
    window.location.href = 'mailto:contacto@baraxdefense.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });
})();
