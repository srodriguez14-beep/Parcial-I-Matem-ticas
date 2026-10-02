/**
 * visualizador.js
 * Componente reutilizable para los métodos numéricos (módulos 1 a 4).
 *
 * Uso:
 *   new Visualizador({ contenedor: 'viz', metodo: 'simpson',
 *                      inicial: { expr: 'x^2', a: 0, b: 2, n: 4 },
 *                      alActualizar: (estado) => { ... } });
 * metodo: 'riemann' | 'trapecio' | 'medio' | 'simpson'
 * Requiere: matematicas.js (Mat) y graficos.js (Gfx).
 */

/** Colores por tipo de suma de Riemann: [línea, relleno]. */
const COL_RIEMANN = {
  izquierda: ['#e10600', 'rgba(225,6,0,.25)'],
  derecha:   ['#ff9f1c', 'rgba(255,159,28,.25)'],
  medio:     ['#8ecae6', 'rgba(142,202,230,.25)']
};
const NOMBRE_TIPO = { izquierda: 'Izquierda', derecha: 'Derecha', medio: 'Punto medio' };
const LETRA_TIPO = { izquierda: 'L', derecha: 'R', medio: 'M' };

class Visualizador {
  constructor(cfg) {
    this.cfg = cfg;
    this.id = cfg.contenedor;
    this.raiz = document.getElementById(cfg.contenedor);
    this.construir();
    this.eventos();
    this.dibujar();
    // Si el usuario cambia de tema, se vuelve a pintar con los colores nuevos
    document.addEventListener('tema-cambiado', () => this.dibujar());
  }

  q(sufijo) { return document.getElementById(`${this.id}-${sufijo}`); }

  /** Evalúa "pi/2", "e", "3" … para los campos a y b. */
  valor(txt) {
    try { return Number(math.evaluate(String(txt).replace(/π/g, 'pi').replace(',', '.'))); }
    catch { return NaN; }
  }

  /* ---------- Interfaz ---------- */
  construir() {
    const { metodo, inicial: i } = this.cfg, id = this.id;
    const ops = Visualizador.EJEMPLOS.map((e, k) => `<option value="${k}">${e.txt}</option>`).join('');
    const tipo = metodo === 'riemann'
      ? `<div class="campo"><label for="${id}-tipo">Tipo de suma</label>
           <select id="${id}-tipo">
             <option value="izquierda">Izquierda</option><option value="derecha">Derecha</option>
             <option value="medio">Punto medio</option><option value="todas">Las tres a la vez</option>
           </select></div>` : '';
    this.raiz.innerHTML = `
      <div class="controles ancho">
        <div class="campo"><label for="${id}-f">f(x) =</label>
          <input id="${id}-f" type="text" value="${i.expr}" spellcheck="false" autocapitalize="off" autocomplete="off"></div>
        <div class="campo"><label for="${id}-a">a</label>
          <input id="${id}-a" type="text" inputmode="decimal" value="${i.a}"></div>
        <div class="campo"><label for="${id}-b">b</label>
          <input id="${id}-b" type="text" inputmode="decimal" value="${i.b}"></div>
        <div class="campo"><label for="${id}-n">Subintervalos n = <b id="${id}-nv">${i.n}</b></label>
          <input id="${id}-n" type="range" min="1" max="100" step="1" value="${i.n}"></div>
      </div>
      <div class="controles">
        <div class="campo"><label for="${id}-ej">Ejemplos de funciones</label>
          <select id="${id}-ej"><option value="">Elegir un ejemplo…</option>${ops}</select></div>
        ${tipo}
        <div class="campo"><label>&nbsp;</label><button type="button" class="btn" id="${id}-go">Graficar</button></div>
      </div>
      <div class="mensaje-error" id="${id}-err" role="alert" hidden></div>
      <div class="caja"><div id="${id}-graf" class="grafica" role="img" aria-label="Gráfica de f(x) con la aproximación"></div></div>
      <div class="resultados" id="${id}-res" aria-live="polite"></div>
      ${metodo === 'riemann' ? `<h3>Convergencia: aproximación vs n</h3>
        <div class="caja"><div id="${id}-conv" class="grafica" role="img" aria-label="Aproximación en función de n"></div></div>` : ''}`;
  }

  eventos() {
    const redibujar = () => this.dibujar();
    this.q('go').addEventListener('click', redibujar);
    this.q('n').addEventListener('input', redibujar);              // tiempo real
    ['f', 'a', 'b'].forEach((s) => this.q(s).addEventListener('change', redibujar));
    this.q('f').addEventListener('keydown', (e) => { if (e.key === 'Enter') redibujar(); });
    if (this.q('tipo')) this.q('tipo').addEventListener('change', redibujar);
    this.q('ej').addEventListener('change', (e) => {
      const ej = Visualizador.EJEMPLOS[e.target.value];
      if (!ej) return;
      this.q('f').value = ej.expr; this.q('a').value = ej.a; this.q('b').value = ej.b;
      this.dibujar();
    });
  }

  error(msg) { const e = this.q('err'); e.textContent = '⚠ ' + msg; e.hidden = false; }

  /* ---------- Cálculo y dibujo ---------- */
  dibujar() {
    const m = this.cfg.metodo;
    const expr = this.q('f').value;
    const a = this.valor(this.q('a').value), b = this.valor(this.q('b').value);
    const n = parseInt(this.q('n').value, 10);
    this.q('nv').textContent = n;

    const { f, error } = Mat.parsear(expr);
    const msg = error || Mat.validar(a, b, n, m === 'simpson');
    if (msg) return this.error(msg);
    if (!Mat.funcionValida(f, a, b)) {
      return this.error('La función no está definida en todo [a, b] (por ejemplo 1/x en x = 0 o ln(x) con x ≤ 0). Cambia el intervalo.');
    }
    this.q('err').hidden = true;

    // Qué aproximaciones calcular
    let tipos = [];
    if (m === 'riemann') {
      const t = this.q('tipo').value;
      tipos = t === 'todas' ? ['izquierda', 'derecha', 'medio'] : [t];
    }
    const aprox = [];
    if (m === 'riemann') tipos.forEach((t) => aprox.push({ tex: `${LETRA_TIPO[t]}_{${n}}`, val: Mat.riemann(f, a, b, n, t) }));
    if (m === 'medio') aprox.push({ tex: `M_{${n}}`, val: Mat.puntoMedio(f, a, b, n) });
    if (m === 'trapecio') aprox.push({ tex: `T_{${n}}`, val: Mat.trapecio(f, a, b, n) });
    if (m === 'simpson') aprox.push({ tex: `S_{${n}}`, val: Mat.simpson(f, a, b, n) });

    // Trazas de la gráfica
    const trazas = [Gfx.trazaCurva(f, a, b)];
    if (m === 'riemann') {
      tipos.forEach((t) => trazas.push(this.rectangulos(f, a, b, n, t, tipos.length > 1)));
    } else if (m === 'medio') {
      trazas.push(this.rectangulos(f, a, b, n, 'medio', false));
      const xm = Mat.medios(a, b, n);
      trazas.push({ x: xm, y: xm.map(f), mode: 'markers', name: 'x̄ᵢ',
        marker: { color: Gfx.colores().acento, size: 8, symbol: 'diamond' } });
    } else if (m === 'trapecio') trazas.push(this.trapecios(f, a, b, n));
    else trazas.push(this.parabolas(f, a, b, n));
    Gfx.dibujar(`${this.id}-graf`, trazas);

    // Panel de resultados
    const exacto = Mat.exacta(f, a, b);
    this.resultados(aprox, exacto);
    if (m === 'riemann') this.convergencia(f, a, b, n, exacto, tipos);
    if (this.cfg.alActualizar) this.cfg.alActualizar({ f, a, b, n, expr, exacto });
  }

  /** Rectángulos de Riemann; si `multi`, usa un color distinto por tipo. */
  rectangulos(f, a, b, n, tipo, multi) {
    const x = Mat.nodos(a, b, n), X = [], Y = [];
    for (let i = 0; i < n; i++) {
      const xe = tipo === 'izquierda' ? x[i] : tipo === 'derecha' ? x[i + 1] : (x[i] + x[i + 1]) / 2;
      const h = f(xe);
      X.push(x[i], x[i], x[i + 1], x[i + 1], x[i], null);
      Y.push(0, h, h, 0, 0, null);
    }
    const t = Gfx.trazaRelleno(X, Y, multi ? NOMBRE_TIPO[tipo] : 'Rectángulos', true);
    if (multi) { t.fillcolor = COL_RIEMANN[tipo][1]; t.line = { color: COL_RIEMANN[tipo][0], width: 1.5 }; }
    return t;
  }

  trapecios(f, a, b, n) {
    const x = Mat.nodos(a, b, n), X = [], Y = [];
    for (let i = 0; i < n; i++) {
      X.push(x[i], x[i], x[i + 1], x[i + 1], x[i], null);
      Y.push(0, f(x[i]), f(x[i + 1]), 0, 0, null);
    }
    return Gfx.trazaRelleno(X, Y, 'Trapecios', true);
  }

  /** Parábola de Lagrange que pasa por (x0,y0), (x1,y1), (x2,y2) en cada par de subintervalos. */
  parabolas(f, a, b, n) {
    const x = Mat.nodos(a, b, n), X = [], Y = [];
    for (let i = 0; i + 2 <= n; i += 2) {
      const [x0, x1, x2] = [x[i], x[i + 1], x[i + 2]], [y0, y1, y2] = [f(x0), f(x1), f(x2)];
      const P = (t) => y0 * (t - x1) * (t - x2) / ((x0 - x1) * (x0 - x2))
                     + y1 * (t - x0) * (t - x2) / ((x1 - x0) * (x1 - x2))
                     + y2 * (t - x0) * (t - x1) / ((x2 - x0) * (x2 - x1));
      X.push(x0); Y.push(0);
      for (let k = 0; k <= 24; k++) { const t = x0 + ((x2 - x0) * k) / 24; X.push(t); Y.push(P(t)); }
      X.push(x2, x0, null); Y.push(0, 0, null);
    }
    return Gfx.trazaRelleno(X, Y, 'Parábolas', true);
  }

  /** Tarjetas: valor aproximado, exacto, error absoluto y relativo (KaTeX). */
  resultados(aprox, exacto) {
    const cont = this.q('res');
    cont.innerHTML = '';
    const dato = (etq, latex) => {
      const d = document.createElement('div'); d.className = 'dato';
      d.innerHTML = `<small>${etq}</small><span></span>`;
      Gfx.tex(d.querySelector('span'), latex);
      cont.appendChild(d);
    };
    dato('Valor exacto (numérico)', `I = ${Gfx.num(exacto)}`);
    aprox.forEach((p) => {
      const e = Mat.errores(p.val, exacto);
      dato('Valor aproximado', `${p.tex} = ${Gfx.num(p.val)}`);
      dato('Error absoluto', `E_{abs} = ${Gfx.num(e.abs)}`);
      dato('Error relativo', e.rel === null ? 'E_{rel}=\\text{—}' : `E_{rel} = ${Gfx.num(e.rel * 100, 4)}\\%`);
    });
  }

  /** Gráfica secundaria: aproximación vs n (n = 1…60) que converge al valor exacto. */
  convergencia(f, a, b, n, exacto, tipos) {
    const c = Gfx.colores(), ks = Array.from({ length: 60 }, (_, i) => i + 1);
    const tr = tipos.map((t) => ({
      x: ks, y: ks.map((j) => Mat.riemann(f, a, b, j, t)), mode: 'lines+markers', name: NOMBRE_TIPO[t],
      marker: { size: 4 }, line: { width: 2, color: tipos.length > 1 ? COL_RIEMANN[t][0] : c.curva }
    }));
    tr.push({ x: [1, 60], y: [exacto, exacto], mode: 'lines', name: 'Valor exacto', line: { color: c.rojo, dash: 'dash', width: 2 } });
    tr.push({ x: [n], y: [Mat.riemann(f, a, b, n, tipos[0])], mode: 'markers', name: `n = ${n}`,
      marker: { size: 12, color: c.rojo, symbol: 'diamond' } });
    Gfx.dibujar(`${this.id}-conv`, tr, {
      xaxis: { title: 'n', gridcolor: c.rejilla }, yaxis: { title: 'Aproximación', gridcolor: c.rejilla } });
  }
}

/** Funciones de ejemplo del menú desplegable (a y b admiten "pi", "e"…). */
Visualizador.EJEMPLOS = [
  { txt: 'x² en [0, 2]',          expr: 'x^2',        a: '0', b: '2' },
  { txt: '1/x en [1, 3]',         expr: '1/x',        a: '1', b: '3' },
  { txt: 'eˣ en [0, 1]',          expr: 'e^x',        a: '0', b: '1' },
  { txt: 'sen(x) en [0, π]',      expr: 'sin(x)',     a: '0', b: 'pi' },
  { txt: 'cos(x) en [0, π/2]',    expr: 'cos(x)',     a: '0', b: 'pi/2' },
  { txt: '√x en [0, 4]',          expr: 'sqrt(x)',    a: '0', b: '4' },
  { txt: 'ln(x) en [1, e]',       expr: 'ln(x)',      a: '1', b: 'e' },
  { txt: 'x³ − 2x en [−1, 2]',    expr: 'x^3-2*x',    a: '-1', b: '2' }
];

/**
 * Comparador final (módulo 4): error de Riemann (izq.), Trapecio, Punto medio y Simpson
 * para la misma función y el mismo n. Dibuja una tabla y un gráfico de barras (escala log).
 */
function comparar(est, idTabla, idGrafica) {
  const { f, a, b, n, exacto } = est;
  const filas = [
    ['Riemann (izquierda)', Mat.riemann(f, a, b, n, 'izquierda')],
    ['Trapecio', Mat.trapecio(f, a, b, n)],
    ['Punto medio', Mat.puntoMedio(f, a, b, n)],
    ['Simpson', Mat.simpson(f, a, b, n)]
  ].map(([nombre, val]) => ({ nombre, val, ...Mat.errores(val, exacto) }));

  const mejor = Math.min(...filas.map((r) => r.abs));
  document.getElementById(idTabla).innerHTML = `
    <p>Para esta función con <b>n = ${n}</b>, el valor exacto es ${Gfx.num(exacto)}.</p>
    <div class="tabla-scroll"><table>
      <tr><th>Método</th><th>Aproximación</th><th>Error absoluto</th><th>Error relativo</th></tr>
      ${filas.map((r) => `<tr${r.abs === mejor ? ' style="font-weight:800;color:var(--rojo-vivo)"' : ''}>
        <td>${r.nombre}</td><td>${Gfx.num(r.val)}</td><td>${r.abs.toExponential(3)}</td>
        <td>${r.rel === null ? '—' : (r.rel * 100).toExponential(3) + ' %'}</td></tr>`).join('')}
    </table></div><p><small>En rojo: el método más preciso para este caso.</small></p>`;

  const c = Gfx.colores();
  Gfx.dibujar(idGrafica, [{
    type: 'bar', x: filas.map((r) => r.nombre), y: filas.map((r) => Math.max(r.abs, 1e-16)),
    marker: { color: filas.map((r) => (r.abs === mejor ? c.rojo : '#6b4a4a')) }, name: 'Error absoluto', showlegend: false
  }], { yaxis: { type: 'log', title: 'Error absoluto (escala log)', gridcolor: c.rejilla } });
}
