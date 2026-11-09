(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;

  /* Título letra a letra */
  document.querySelectorAll('.split .line').forEach((line, li) => {
    let n = 0;
    const wrap = (node) => {
      [...node.childNodes].forEach((ch) => {
        if (ch.nodeType === 3) {
          const frag = document.createDocumentFragment();
          [...ch.textContent].forEach((c) => {
            const s = document.createElement('span');
            s.className = 'ch'; s.textContent = c === ' ' ? ' ' : c;
            s.style.transitionDelay = `${li * 120 + n++ * 35}ms`;
            s.setAttribute('aria-hidden', 'true');
            frag.appendChild(s);
          });
          ch.replaceWith(frag);
        } else wrap(ch);
      });
    };
    wrap(line);
  });
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('loaded')));

  /* Barra de progresso + arco girando com o scroll */
  const bar = document.getElementById('progress');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* Paralaxe da foto do estúdio */
  const band = document.querySelector('.band'); const bandImg = document.querySelector('.band-media img');
  if (band && !reduce) addEventListener('scroll', () => { const r = band.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return; bandImg.style.setProperty('--py', `${(r.top / innerHeight) * -90 - 40}px`); }, { passive: true });

  /* Botões magnéticos */
  if (fine && !reduce) document.querySelectorAll('.magnetic').forEach((el) => {
    el.style.transition += ', transform .35s cubic-bezier(.23,1,.32,1)';
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * .25, y = (e.clientY - r.top - r.height / 2) * .35;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });

  /* Mapa da dor */
  const areas = {
    pescoco: ['assets/fisioterapeuta.webp', 'Fisioterapeuta da Raiz sorrindo de braços cruzados', 'Pescoço', 'Tensão cervical e dor de cabeça tensional. Ergonomia do home office, terapia manual e fortalecimento de flexores profundos.', '6–8', 'Postura & respiração'],
    ombro: ['assets/reabilitacao-halter-1200.webp', 'Paciente fortalecendo o ombro com halter, acompanhada pelo fisioterapeuta', 'Ombro', 'Tendinopatias e impacto. Avaliamos a escápula antes do ombro e progredimos carga com elásticos, halteres e chair.', '10–14', 'Escápula & manguito'],
    lombar: ['assets/pilates-instrutor.webp', 'Fisioterapeuta corrigindo a postura de alunas no reformer', 'Lombar', 'A queixa número um do estúdio. Começamos com teste de mobilidade e controle motor do core, liberação miofascial e, a partir da 3ª sessão, pilates terapêutico no reformer.', '10–12', 'Core & quadril'],
    joelho: ['assets/terapia-joelho.webp', 'Terapia manual no joelho', 'Joelho', 'Condromalácia, LCA e dor do corredor. Análise de agachamento e corrida em vídeo, força de quadril e retorno gradual ao impacto.', '12–16', 'Quadril & quadríceps'],
    tornozelo: ['assets/corrida.webp', 'Corredor em pista de atletismo', 'Tornozelo', 'Entorses de repetição e fascite. Propriocepção, mobilidade de tálus e treino de equilíbrio em superfícies instáveis.', '8–10', 'Equilíbrio & pé']
  };
  const card = document.getElementById('areaCard');
  document.querySelectorAll('.spot').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('.spot').forEach(s => s.classList.toggle('is-on', s === b));
    const [src, alt, t, p, s, f] = areas[b.dataset.area];
    const im = document.getElementById('areaImg'); im.src = src; im.alt = alt;
    document.getElementById('areaTitle').textContent = t;
    document.getElementById('areaText').textContent = p;
    document.getElementById('areaSess').textContent = s;
    document.getElementById('areaFoco').textContent = f;
    card.classList.remove('swap'); void card.offsetWidth; card.classList.add('swap');
  }));

  /* Linhas de serviço com forma que segue o cursor */
  const rows = document.getElementById('rows');
  const blob = document.getElementById('blob');
  const sec = rows.parentElement;
  let tx = 0, ty = 0, cx = 0, cy = 0, raf;
  const loop = () => { cx += (tx - cx) * .18; cy += (ty - cy) * .18; blob.style.left = cx + 'px'; blob.style.top = cy + 'px'; raf = requestAnimationFrame(loop); };
  if (fine) {
    rows.addEventListener('pointerenter', () => { blob.classList.add('on'); if (!raf) loop(); });
    rows.addEventListener('pointerleave', () => { blob.classList.remove('on'); cancelAnimationFrame(raf); raf = null; });
    rows.addEventListener('pointermove', (e) => {
      const r = sec.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top;
      if (!cx) { cx = tx; cy = ty; }
      const li = e.target.closest('li'); if (li) { blob.style.backgroundColor = li.dataset.c; const bi = document.getElementById('blobImg'); if (bi.getAttribute('src') !== li.dataset.img) bi.src = li.dataset.img; }
    });
  }

  /* Cartões do método: leve parallax da foto no hover */
  if (fine && !reduce) document.querySelectorAll('.card').forEach((c) => {
    const img = c.querySelector('.card-bg img');
    c.addEventListener('pointermove', (e) => { const r = c.getBoundingClientRect(); img.style.transform = `scale(1.08) translate(${((e.clientX - r.left) / r.width - .5) * -10}px, ${((e.clientY - r.top) / r.height - .5) * -10}px)`; });
    c.addEventListener('pointerleave', () => { img.style.transform = ''; });
  });

  /* Abas de planos */
  const prices = { 1: [260, 235, 215], 2: [390, 350, 320], 3: [490, 445, 410] };
  const tabs = [...document.querySelectorAll('.tabs [role=tab]')];
  const ind = document.querySelector('.tab-ind');
  const moveInd = (t) => { ind.style.width = t.offsetWidth + 'px'; ind.style.transform = `translateX(${t.offsetLeft}px)`; };
  tabs.forEach((t) => t.addEventListener('click', () => {
    tabs.forEach(x => x.setAttribute('aria-selected', x === t));
    moveInd(t);
    document.querySelectorAll('[data-p]').forEach((s, i) => {
      s.textContent = prices[t.dataset.f][i];
      s.classList.remove('tick'); void s.offsetWidth; s.classList.add('tick');
    });
  }));
  const sel = () => moveInd(tabs.find(t => t.getAttribute('aria-selected') === 'true'));
  addEventListener('resize', sel); document.fonts ? document.fonts.ready.then(sel) : sel(); sel();

  /* Formulário: apenas demonstração local */
  const form = document.getElementById('form'), msg = document.getElementById('msg');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.nome.value.trim() || !form.tel.value.trim()) { msg.textContent = 'Preencha nome e WhatsApp.'; return; }
    msg.textContent = `Valeu, ${form.nome.value.trim().split(' ')[0]}! Site demonstrativo: nenhum dado foi enviado.`;
    form.reset();
  });
})();

/* TRANSIÇÕES v2 · Raiz Fisioterapia · tudo cresce a partir da base
   Entradas de textos, imagens e cartões + traço de passagem entre seções, com assinatura própria do nicho.
   Só roda com JS e sem prefers-reduced-motion; o conteúdo nunca fica escondido sem JS. */
(() => {
  const C = {"step": 0.09, "settle": 2.6, "textClip": true, "divider": "<svg viewBox=\"0 0 1200 28\"><path class=\"ln\" pathLength=\"1\" style=\"--ld:0.00s\" d=\"M0 6 H1200\"/><path class=\"ln\" pathLength=\"1\" style=\"--ld:0.70s\" d=\"M190 6 q16 7 22 20\"/><path class=\"ln\" pathLength=\"1\" style=\"--ld:0.85s\" d=\"M430 6 q-12 9 -6 20\"/><path class=\"ln\" pathLength=\"1\" style=\"--ld:1.00s\" d=\"M700 6 q14 6 18 18\"/><path class=\"ln\" pathLength=\"1\" style=\"--ld:1.15s\" d=\"M960 6 q-16 8 -20 18\"/></svg>", "words": false, wordDelay: (i) => i * .08, cardDelay: (n) => Math.min(n, 6) * .1};
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const html = document.documentElement;
  html.classList.add('fx');
  const mob = matchMedia('(max-width: 760px)').matches;
  const SKIP = '.hero, body > header, nav, footer, .nav, .wa, .whats, .wpp, [class*="whatsapp"], canvas, video, iframe, [data-nofx], [class*="marquee"], [class*="ticker"], [aria-hidden="true"]' + (C.skip ? ', ' + C.skip : '');
  const pinned = el => { for (let p = el; p && p !== document.body; p = p.parentElement) { const s = getComputedStyle(p).position; if (s === 'sticky' || s === 'fixed') return true; } return false; };
  const F0 = new Map();
  if (C.imgFilter) document.querySelectorAll('section img').forEach(i => F0.set(i, getComputedStyle(i).filter));
  const sections = [...document.querySelectorAll('section')].filter(s => !s.parentElement.closest('section') && !s.matches(SKIP) && !s.closest(SKIP));

  // o sistema antigo de revelação (fade genérico) sai de cena fora da hero
  sections.forEach(s => s.querySelectorAll('.rv, .reveal').forEach(el => { el.classList.remove('rv', 'reveal'); el.style.transitionDelay = ''; }));
  sections.forEach(s => s.classList.remove('rv', 'reveal'));

  const items = []; // {el, kind}
  const taken = new Set();
  const isTaken = el => { for (const t of taken) if (t !== el && t.contains(el)) return true; return false; };

  sections.forEach(sec => {
    // 1. cartões: grupos de 3+ irmãos parecidos com imagem ou título
    const groups = [];
    sec.querySelectorAll('*').forEach(p => {
      const ch = [...p.children].filter(c => !['SCRIPT', 'TEMPLATE', 'BR'].includes(c.tagName));
      if (ch.length < 3 || p.closest(SKIP)) return;
      const sig = c => c.tagName + '.' + (c.classList[0] || '');
      const cnt = {}; ch.forEach(c => cnt[sig(c)] = (cnt[sig(c)] || 0) + 1);
      const best = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0];
      if (best[1] < 3 || best[1] < ch.length * .7) return;
      const cards = ch.filter(c => sig(c) === best[0]);
      if (!cards.every(c => c.querySelector('img, h3, h4, strong, summary, dt') && c.getBoundingClientRect().height > 50)) return;
      if (cards.some(c => pinned(c))) return;
      if (groups.some(g => g.some(c => c.contains(p)))) return;
      groups.push(cards);
    });
    groups.forEach(g => g.forEach((c, i) => { if (!isTaken(c)) { c.classList.add('fx-c'); c.style.setProperty('--n', i); taken.add(c); items.push({ el: c, kind: 'c', i }); } }));

    // 2. imagens soltas (fora de cartões, fundos fixos e áreas presas)
    sec.querySelectorAll('img').forEach(img => {
      if (img.closest(SKIP) || isTaken(img) || pinned(img)) return;
      let w = img.parentElement; if (w.tagName === 'PICTURE') w = w.parentElement;
      const ws = getComputedStyle(img);
      if (ws.position === 'absolute' && w === sec) return;
      const r = w.getBoundingClientRect(), rs = sec.getBoundingClientRect();
      if (r.width * r.height > rs.width * rs.height * .85) return; // foto de fundo da seção
      let target = w;
      if (w === sec || w.querySelector('h1, h2, h3, p, a, button') ) target = img;
      if (isTaken(target) || taken.has(target)) return;
      target.classList.add('fx-i'); if (target === img) target.classList.add('fx-self');
      if (getComputedStyle(target).clipPath !== 'none') target.classList.add('fx-noclip');
      taken.add(target); items.push({ el: target, kind: 'i' });
    });

    // 3. textos: títulos, parágrafos, listas de dados, botões e formulários, em cascata
    sec.querySelectorAll('h2, h3, h4, p, li, blockquote, dl, form, ' + (C.extraText || '.eyebrow') + ', a[class*="btn"], a[class*="cta"], button[class*="btn"]').forEach(el => {
      if (el.closest(SKIP) || isTaken(el) || taken.has(el) || pinned(el)) return;
      if (el.closest('form') && el.tagName !== 'FORM') return;
      if (!el.textContent.trim() && el.tagName !== 'FORM') return;
      if (el.tagName === 'H2' && C.words) splitWords(el);
      else el.classList.add('fx-t');
      taken.add(el); items.push({ el, kind: el.classList.contains('fx-ws') ? 'w' : 't' });
    });
  });

  function splitWords(h) {
    h.classList.add('fx-ws');
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const parts = n.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach(t => { if (!t) return; if (/^\s+$/.test(t)) frag.append(t); else { const s = document.createElement('span'); s.className = 'fx-w'; s.textContent = t; frag.append(s); } });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !/^(BR|SVG|IMG)$/i.test(n.tagName)) {
          const cs = getComputedStyle(n);
          if (cs.backgroundClip === 'text' || cs.webkitBackgroundClip === 'text' || cs.display === 'block') { n.classList.add('fx-w'); return; }
          walk(n);
        }
      });
    };
    walk(h);
    [...h.querySelectorAll('.fx-w')].forEach((w, i, all) => w.style.setProperty('--wd', C.wordDelay(i, all.length) + 's'));
  }

  // filtro de cor de cada foto preservado: a entrada soma o efeito ao filtro original
  if (C.imgFilter) document.querySelectorAll('.fx-i img, img.fx-i, .fx-c img').forEach(img => {
    const f = F0.get(img); img.style.setProperty('--f0', (f && f !== 'none' ? f + ' ' : '') + C.imgFilter);
  });

  // 4. traço de passagem entre seções
  let nDiv = 0;
  sections.forEach((sec, k) => {
    if (nDiv >= (C.maxDiv || 7) || k === 0 && C.skipFirstDiv) return;
    if (sec.matches(C.noDiv || '.fixo, .window, .janela, .sky')) return;
    if (!sec.querySelector('h2')) return;
    if (getComputedStyle(sec).position === 'static') sec.style.position = 'relative';
    const box = document.createElement('div');
    box.className = 'fx-div'; box.setAttribute('aria-hidden', 'true');
    box.innerHTML = C.divider;
    sec.prepend(box); nDiv++;
    items.push({ el: box, kind: 'd' });
  });

  // entrada: os elementos que chegam juntos entram em cascata, na ordem do texto
  const step = C.step * (mob ? .7 : 1);
  const show = (el, d) => {
    el.style.transitionDelay = d + 's';
    el.style.setProperty('--dl', d + 's');
    el.classList.add('fx-on');
    setTimeout(() => { el.classList.add('fx-done'); el.style.transitionDelay = ''; }, (d + C.settle) * 1000);
  };
  // elementos recortados (clip-path) são observados pelo pai, porque o recorte zera a área visível
  const proxyOf = el => ((el.classList.contains('fx-i') && !el.classList.contains('fx-noclip')) || (C.textClip && el.classList.contains('fx-t'))) ? el.parentElement : el;
  const watch = new Map();
  items.forEach(({ el }) => { const p = proxyOf(el); if (!watch.has(p)) watch.set(p, []); watch.get(p).push(el); });
  const io = new IntersectionObserver(es => {
    const ins = es.filter(e => e.isIntersecting).flatMap(e => { io.unobserve(e.target); return watch.get(e.target) || []; })
      .sort((a, b) => a.compareDocumentPosition(b) & 2 ? 1 : -1);
    ins.forEach((el, i) => {
      const n = el.classList.contains('fx-c') ? C.cardDelay(+el.style.getPropertyValue('--n') || 0) : Math.min(i, 7) * step;
      show(el, n);
    });
  }, { threshold: .14, rootMargin: '0px 0px -7% 0px' });
  watch.forEach((_, p) => io.observe(p));
  // quem chega por âncora já encontra o que ficou acima pronto
  requestAnimationFrame(() => watch.forEach((els, p) => { if (p.getBoundingClientRect().bottom < 0) { io.unobserve(p); els.forEach(el => show(el, 0)); } }));
})();
