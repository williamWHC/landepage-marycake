/* =========================================================
   Mary Cakes Confeitaria — interações
   Vanilla JS, sem dependências.
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- ano do rodapé ---------- */
  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();

  /* ---------- status aberto / fechado ----------
     Horario da loja: terca a domingo, 11h30 as 19h30 (segunda fechado).
     Usa sempre o fuso de Sao Paulo — o visitante pode estar em outro lugar.  */
  var ABRE = 11 * 60 + 30;
  var FECHA = 19 * 60 + 30;
  var DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira',
              'quinta-feira', 'sexta-feira', 'sábado'];

  function agoraEmSP() {
    var partes = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo',
      weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
    }).formatToParts(new Date());

    var achar = function (tipo) {
      var p = partes.find(function (x) { return x.type === tipo; });
      return p ? p.value : '';
    };
    var semana = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    var hora = parseInt(achar('hour'), 10) % 24;
    return { dia: semana[achar('weekday')], minutos: hora * 60 + parseInt(achar('minute'), 10) };
  }

  function proximoDiaAberto(dia) {
    for (var i = 1; i <= 7; i++) {
      var d = (dia + i) % 7;
      if (d !== 1) return d;   /* 1 = segunda, unico dia fechado */
    }
    return 2;
  }

  function calcularStatus() {
    var t = agoraEmSP();
    var aberto = t.dia !== 1 && t.minutos >= ABRE && t.minutos < FECHA;

    if (aberto) {
      var faltam = FECHA - t.minutos;
      if (faltam <= 60) {
        return { estado: 'soon', texto: 'Fecha em ' + faltam + ' min · aberto até 19h30' };
      }
      return { estado: 'open', texto: 'Aberto agora · até 19h30' };
    }

    /* fechado: descobre quando abre de novo */
    if (t.dia !== 1 && t.minutos < ABRE) {
      return { estado: 'closed', texto: 'Fechado · abre hoje às 11h30' };
    }
    var proximo = proximoDiaAberto(t.dia);
    var quando = proximo === (t.dia + 1) % 7 ? 'amanhã' : DIAS[proximo];
    return { estado: 'closed', texto: 'Fechado · abre ' + quando + ' às 11h30' };
  }

  function pintarStatus() {
    var s = calcularStatus();
    document.querySelectorAll('[data-status]').forEach(function (el) {
      el.hidden = false;
      el.classList.remove('is-open', 'is-soon', 'is-closed');
      el.classList.add('is-' + s.estado);
      el.setAttribute('data-open', s.estado === 'closed' ? '0' : '1');
      var alvo = el.matches('[data-status-text]') ? el : el.querySelector('[data-status-text]');
      if (alvo) alvo.textContent = s.texto;
    });
  }

  try {
    pintarStatus();
    window.setInterval(pintarStatus, 60000);
  } catch (e) {
    /* sem Intl/timeZone o site segue com o horario fixo ja escrito no HTML */
  }

  /* ---------- header: sombra ao rolar ---------- */
  var header = document.getElementById('header');
  var toTop = document.getElementById('toTop');
  var waFloat = document.getElementById('waFloat');
  var maryLink = document.getElementById('waMascote');
  var mascote = maryLink && maryLink.querySelector('.wa-mascote');
  var onScroll = function () {
    var y = window.scrollY;
    header.classList.toggle('is-stuck', y > 8);
    if (toTop) {
      toTop.hidden = false;
      toTop.classList.toggle('is-on', y > window.innerHeight * 1.2);
    }
    /* a Mary entra depois do hero, para não disputar atenção com ele */
    if (maryLink) {
      var mostraMary = y > window.innerHeight * 0.55;
      if (mostraMary && mascote && mascote.loading === 'lazy') {
        /* fixed + opacity:0 deixa o lazy-load imprevisível: força o download
           no exato momento em que ela vai aparecer */
        mascote.loading = 'eager';
      }
      maryLink.classList.toggle('tem-mary', mostraMary);
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- menu mobile ---------- */
  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');

  function closeNav() {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
  }

  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });

  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) closeNav();
  });

  document.addEventListener('click', function (e) {
    if (nav.classList.contains('is-open') &&
        !nav.contains(e.target) && !toggle.contains(e.target)) closeNav();
  });

  /* ---------- link ativo conforme a seção visível ---------- */
  var navLinks = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- reveal on scroll ---------- */
  var revealables = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealables.forEach(function (el) { revealer.observe(el); });
  }

  /* ---------- slideshow do hero ----------
     Cada moldura tem seu proprio intervalo para as trocas nao ficarem sincronizadas.
     Pausa quando a aba esta oculta e fica estatico com movimento reduzido.         */
  var shows = Array.prototype.slice.call(document.querySelectorAll('[data-slideshow]'))
    .map(function (box) {
      var frames = Array.prototype.slice.call(box.querySelectorAll('img'));
      return { frames: frames, index: 0, every: parseInt(box.dataset.interval, 10) || 4500 };
    })
    .filter(function (s) { return s.frames.length > 1; });

  /* declarados aqui fora para o lightbox poder congelar as trocas */
  var startShows = function () {};
  var stopShows = function () {};

  if (!reduceMotion && shows.length) {
    var timers = [];

    var advance = function (show) {
      show.frames[show.index].classList.remove('is-on');
      show.index = (show.index + 1) % show.frames.length;
      show.frames[show.index].classList.add('is-on');
    };

    stopShows = function () {
      timers.forEach(window.clearInterval);
      timers = [];
    };

    startShows = function () {
      stopShows();
      shows.forEach(function (show) {
        timers.push(window.setInterval(function () { advance(show); }, show.every));
      });
    };

    startShows();
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopShows(); else startShows();
    });
  }

  /* ---------- carrossel da vitrine ---------- */
  var track = document.getElementById('carousel');
  if (track) {
    var carPrev = document.getElementById('carPrev');
    var carNext = document.getElementById('carNext');

    var step = function () {
      var slide = track.querySelector('.slide');
      if (!slide) return track.clientWidth * 0.8;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      /* avanca de duas em duas quando cabe mais de uma na tela */
      var perView = Math.max(1, Math.floor(track.clientWidth / (slide.offsetWidth + gap)));
      return (slide.offsetWidth + gap) * Math.max(1, perView - 1);
    };

    var syncCarBtns = function () {
      var max = track.scrollWidth - track.clientWidth - 2;
      carPrev.disabled = track.scrollLeft <= 2;
      carNext.disabled = track.scrollLeft >= max;
    };

    carPrev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: reduceMotion ? 'auto' : 'smooth' }); });
    carNext.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: reduceMotion ? 'auto' : 'smooth' }); });
    track.addEventListener('scroll', syncCarBtns, { passive: true });
    window.addEventListener('resize', syncCarBtns);
    syncCarBtns();
  }

  /* ---------- filtros da galeria ---------- */
  var filters = Array.prototype.slice.call(document.querySelectorAll('.filter'));
  var shots = Array.prototype.slice.call(document.querySelectorAll('.shot'));

  /* a galeria abre com 12 fotos por filtro e cresce no "ver mais" */
  var PAGINA = 12;
  var moreBtn = document.getElementById('galleryMore');
  var moreCount = document.getElementById('moreCount');
  var catAtual = 'todos';
  var visiveis = PAGINA;

  function daCategoria(cat) {
    return shots.filter(function (s) { return cat === 'todos' || s.dataset.cat === cat; });
  }

  function applyFilter(cat, limite, animar) {
    var lista = daCategoria(cat);
    shots.forEach(function (shot) {
      var pos = lista.indexOf(shot);
      var show = pos !== -1 && pos < limite;
      shot.classList.toggle('is-hidden', !show);
      shot.classList.remove('is-enter');
      if (show && animar && !reduceMotion) {
        void shot.offsetWidth;          /* reinicia a animação de entrada */
        shot.classList.add('is-enter');
      }
    });

    if (moreBtn) {
      var faltam = lista.length - limite;
      moreBtn.hidden = faltam <= 0;
      if (moreCount) moreCount.textContent = faltam > 0 ? '(+' + faltam + ')' : '';
    }
  }

  applyFilter(catAtual, visiveis, false);

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filters.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', String(active));
      });
      catAtual = btn.dataset.filter;
      visiveis = PAGINA;
      applyFilter(catAtual, visiveis, true);
    });
  });

  if (moreBtn) {
    moreBtn.addEventListener('click', function () {
      visiveis += PAGINA;
      applyFilter(catAtual, visiveis, true);
      if (moreBtn.hidden) {
        /* acabou a lista: devolve o foco para a galeria */
        var ultimo = shots.filter(function (s) { return !s.classList.contains('is-hidden'); }).pop();
        if (ultimo) ultimo.focus();
      }
    });
  }

  /* ---------- lightbox ---------- */
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbCaption = document.getElementById('lbCaption');
  var lbClose = document.getElementById('lbClose');
  var lbPrev = document.getElementById('lbPrev');
  var lbNext = document.getElementById('lbNext');
  var current = 0;
  var lastFocused = null;

  function visibleShots() {
    return shots.filter(function (s) { return !s.classList.contains('is-hidden'); });
  }

  var lbCounter = document.getElementById('lbCounter');
  var grupoAtual = [];

  /* Cada gatilho carrega data-full/data-caption direto, ou herda da foto
     visivel quando o gatilho e um slideshow (secao "Sobre").            */
  function dadosDe(el) {
    var img = el.querySelector('img.is-on') || el.querySelector('img');
    return {
      full: el.dataset.full || (img && img.dataset.full),
      caption: el.dataset.caption || (img && img.dataset.caption) || '',
      alt: img ? img.alt : ''
    };
  }

  function montaGrupo(el) {
    var nome = el.dataset.lightbox;
    if (nome === 'galeria') return visibleShots();
    var todos = Array.prototype.slice.call(
      document.querySelectorAll('[data-lightbox="' + nome + '"]'));
    return todos.filter(function (x) { return !x.classList.contains('is-hidden'); });
  }

  function render(index) {
    var list = grupoAtual;
    if (!list.length) return;
    current = (index + list.length) % list.length;
    var d = dadosDe(list[current]);
    lbImg.src = d.full;
    lbImg.alt = d.alt;
    lbCaption.textContent = d.caption;
    if (lbCounter) lbCounter.textContent = (current + 1) + ' / ' + list.length;
    var multiple = list.length > 1;
    lbPrev.hidden = !multiple;
    lbNext.hidden = !multiple;

    /* pre-carrega a proxima para a navegacao nao piscar */
    if (multiple) {
      var proxima = new Image();
      proxima.src = dadosDe(list[(current + 1) % list.length]).full;
    }
  }

  function openLb(gatilho) {
    grupoAtual = montaGrupo(gatilho);
    var i = grupoAtual.indexOf(gatilho);
    if (i === -1) { grupoAtual = [gatilho]; i = 0; }
    lastFocused = document.activeElement;
    stopShows();          /* congela as trocas: a foto nao pode mudar por baixo */
    lb.hidden = false;
    render(i);
    requestAnimationFrame(function () { lb.classList.add('is-open'); });
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLb() {
    lb.classList.remove('is-open');
    startShows();
    document.body.style.overflow = '';
    window.setTimeout(function () {
      lb.hidden = true;
      lbImg.src = '';
    }, reduceMotion ? 0 : 280);
    if (lastFocused) lastFocused.focus();
  }

  /* galeria, cards das especialidades, carrossel e secao "Sobre" */
  document.querySelectorAll('[data-lightbox]').forEach(function (gatilho) {
    gatilho.addEventListener('click', function () { openLb(gatilho); });
  });

  lbClose.addEventListener('click', closeLb);
  lbPrev.addEventListener('click', function () { render(current - 1); });
  lbNext.addEventListener('click', function () { render(current + 1); });

  lb.addEventListener('click', function (e) {
    if (e.target === lb) closeLb();
  });

  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') { closeLb(); return; }
    if (e.key === 'ArrowLeft') { render(current - 1); return; }
    if (e.key === 'ArrowRight') { render(current + 1); return; }
    if (e.key === 'Tab') {
      /* mantém o foco dentro do lightbox */
      var focusables = [lbClose, lbPrev, lbNext].filter(function (el) { return !el.hidden; });
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- swipe no lightbox (mobile) ---------- */
  var touchX = null;
  lb.addEventListener('touchstart', function (e) { touchX = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var delta = e.changedTouches[0].clientX - touchX;
    if (Math.abs(delta) > 50) render(delta > 0 ? current - 1 : current + 1);
    touchX = null;
  }, { passive: true });

  /* ---------- fade-in das fotos ----------
     O CSS so esconde as imagens quando <html> tem .js, entao se este
     bloco nao rodar as fotos continuam visiveis.                        */
  var fotos = document.querySelectorAll('.shot img, .slide img, .card-media img');
  fotos.forEach(function (img) {
    if (img.complete && img.naturalWidth > 0) {
      img.classList.add('is-loaded');
    } else {
      img.addEventListener('load', function () { img.classList.add('is-loaded'); });
      img.addEventListener('error', function () { img.classList.add('is-loaded'); });
    }
  });
  /* rede de seguranca: nada fica invisivel para sempre */
  window.addEventListener('load', function () {
    window.setTimeout(function () {
      fotos.forEach(function (img) { img.classList.add('is-loaded'); });
    }, 1200);
  });

  /* ---------- FAQ: só uma resposta aberta por vez ---------- */
  var faqItems = Array.prototype.slice.call(document.querySelectorAll('.faq-item'));
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      faqItems.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });
})();
