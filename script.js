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
