/**
 * modulo5.js — Integral definida y área bajo la curva / entre dos curvas.
 * Sombrea la región, permite ajustar a y b (sliders + campos numéricos),
 * muestra la integral en vivo y marca los puntos de intersección.
 */
(function () {
  const raiz = document.getElementById('viz5');
  const q = (s) => document.getElementById('v5-' + s);

  raiz.innerHTML = `
    <div class="controles">
      <div class="campo"><label for="v5-modo">Modo</label>
        <select id="v5-modo"><option value="bajo">Área bajo una curva</option><option value="entre">Área entre dos curvas</option></select></div>
      <div class="campo"><label for="v5-f">f(x) =</label><input id="v5-f" type="text" value="3*x^2-2*x+1" spellcheck="false"></div>
      <div class="campo" id="v5-gc" hidden><label for="v5-g">g(x) =</label><input id="v5-g" type="text" value="2*x" spellcheck="false"></div>
    </div>
    <div class="controles">
      <div class="campo"><label for="v5-a">Límite inferior a = <b id="v5-av">0</b></label>
        <input id="v5-a" type="range" min="-5" max="5" step="0.05" value="0"></div>
      <div class="campo"><label for="v5-b">Límite superior b = <b id="v5-bv">2</b></label>
        <input id="v5-b" type="range" min="-5" max="5" step="0.05" value="2"></div>
      <div class="campo"><label for="v5-an">a (número)</label><input id="v5-an" type="number" step="0.05" value="0"></div>
      <div class="campo"><label for="v5-bn">b (número)</label><input id="v5-bn" type="number" step="0.05" value="2"></div>
      <div class="campo" id="v5-ic" hidden><label>&nbsp;</label><button type="button" class="btn" id="v5-ints">Usar las intersecciones como a y b</button></div>
    </div>
    <div class="mensaje-error" id="v5-err" role="alert" hidden></div>
    <div class="caja"><div id="v5-graf" class="grafica" role="img" aria-label="Región sombreada bajo la curva"></div></div>
    <div class="resultados" id="v5-res" aria-live="polite"></div>`;

  /** Valor de ∫ g con Simpson (n par grande). */
  const simpson = (g, a, b, n = 2000) => Mat.simpson(g, a, b, n);

  /** Raíces de h en [lo, hi]: detecta cambios de signo y afina por bisección. */
  function raices(h, lo, hi) {
    const N = 2000, out = [];
    let x0 = lo, y0 = h(x0);
    for (let i = 1; i <= N; i++) {
      const x1 = lo + ((hi - lo) * i) / N, y1 = h(x1);
      if (Number.isFinite(y0) && Number.isFinite(y1) && y0 * y1 <= 0) {
        let l = x0, r = x1;
        for (let k = 0; k < 60; k++) { const m = (l + r) / 2; (h(l) * h(m) <= 0) ? (r = m) : (l = m); }
        const x = (l + r) / 2;
        if (!out.some((o) => Math.abs(o - x) < 1e-6)) out.push(x);
      }
      x0 = x1; y0 = y1;
    }
    return out;
  }

  function actualizar() {
    const entre = q('modo').value === 'entre';
    q('gc').hidden = !entre; q('ic').hidden = !entre;
    const a = parseFloat(q('a').value), b = parseFloat(q('b').value);
    q('av').textContent = a; q('bv').textContent = b;
    q('an').value = a; q('bn').value = b;

    const pf = Mat.parsear(q('f').value), pg = entre ? Mat.parsear(q('g').value) : { f: null, error: null };
    const msg = pf.error || pg.error || Mat.validar(a, b, 2, false);
    const err = q('err');
    if (msg) { err.textContent = '⚠ ' + msg; err.hidden = false; return; }
    const f = pf.f, g = pg.f;
    if (!Mat.funcionValida(f, a, b) || (entre && !Mat.funcionValida(g, a, b))) {
      err.textContent = '⚠ Alguna función no está definida en todo [a, b]. Cambia el intervalo.'; err.hidden = false; return;
    }
    err.hidden = true;

    const c = Gfx.colores(), N = 300;
    const xs = Array.from({ length: N + 1 }, (_, i) => a + ((b - a) * i) / N);
    const trazas = [];
    let h = f, raicesX = [];
    if (!entre) {
      trazas.push({ x: xs, y: xs.map(f), mode: 'lines', fill: 'tozeroy', fillcolor: c.rojoRelleno, line: { width: 0 }, name: 'Área', hoverinfo: 'skip' });
      trazas.push(Gfx.trazaCurva(f, a, b, 'f(x)', 0.25));
    } else {
      h = (x) => f(x) - g(x);
      trazas.push({ x: xs, y: xs.map(g), mode: 'lines', line: { width: 0 }, showlegend: false, hoverinfo: 'skip' });
      trazas.push({ x: xs, y: xs.map(f), mode: 'lines', fill: 'tonexty', fillcolor: c.rojoRelleno, line: { width: 0 }, name: 'Región', hoverinfo: 'skip' });
      trazas.push(Gfx.trazaCurva(f, a, b, 'f(x)', 0.25));
      const tg = Gfx.trazaCurva(g, a, b, 'g(x)', 0.25); tg.line = { color: c.rojo, width: 3 };
      trazas.push(tg);
      const m = (b - a) * 0.25 + 1;
      raicesX = raices(h, a - m, b + m);
      trazas.push({ x: raicesX, y: raicesX.map(f), mode: 'markers+text', name: 'Intersecciones',
        text: raicesX.map((r) => `x=${Number(r.toFixed(3))}`), textposition: 'top center',
        marker: { size: 11, color: c.rojo, line: { color: c.curva, width: 2 } } });
    }
    Gfx.dibujar('v5-graf', trazas);

    // Resultados
    const firmada = simpson(h, a, b), area = simpson((x) => Math.abs(h(x)), a, b, 4000);
    const cont = q('res'); cont.innerHTML = '';
    const dato = (etq, tex) => { const d = document.createElement('div'); d.className = 'dato';
      d.innerHTML = `<small>${etq}</small><span></span>`; Gfx.tex(d.querySelector('span'), tex); cont.appendChild(d); };
    const integrando = entre ? 'f(x)-g(x)' : 'f(x)';
    dato('Integral definida', `\\int_{${Gfx.num(a, 2)}}^{${Gfx.num(b, 2)}} ${integrando}\\,dx = ${Gfx.num(firmada)}`);
    dato('Área (valor absoluto)', `A=\\int_a^b |${integrando}|\\,dx = ${Gfx.num(area)}`);
    if (entre) dato('Intersecciones', raicesX.length ? `x \\approx ${raicesX.map((r) => Gfx.num(r, 4)).join(',\\ ')}` : '\\text{ninguna en la vista}');
  }

  /* Sincroniza sliders y campos numéricos */
  [['a', 'an'], ['b', 'bn']].forEach(([s, n]) => {
    q(s).addEventListener('input', actualizar);
    q(n).addEventListener('input', () => { if (q(n).value !== '') { q(s).value = q(n).value; actualizar(); } });
  });
  ['modo', 'f', 'g'].forEach((s) => q(s).addEventListener('change', actualizar));
  q('modo').addEventListener('change', () => {
    // Valores iniciales sugeridos al cambiar de modo
    if (q('modo').value === 'entre') { q('f').value = 'x^2'; q('g').value = '2*x'; }
    else { q('f').value = '3*x^2-2*x+1'; }
    actualizar();
  });
  q('ints').addEventListener('click', () => {
    const pf = Mat.parsear(q('f').value), pg = Mat.parsear(q('g').value);
    if (pf.error || pg.error) return;
    const r = raices((x) => pf.f(x) - pg.f(x), -5, 5);
    if (r.length < 2) { q('err').textContent = '⚠ No hay al menos dos intersecciones entre −5 y 5.'; q('err').hidden = false; return; }
    q('a').value = Number(r[0].toFixed(2)); q('b').value = Number(r[r.length - 1].toFixed(2));
    actualizar();
  });
  document.addEventListener('tema-cambiado', actualizar);
  actualizar();
})();
