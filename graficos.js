/**
 * graficos.js
 * Helpers de KaTeX (fórmulas) y Plotly (gráficas) compartidos por todos los módulos.
 * Objeto global `Gfx`. Requiere KaTeX y Plotly cargados antes.
 */
const Gfx = (function () {
  /* ---------- KaTeX ---------- */
  /** Renderiza una expresión LaTeX dentro de un elemento (id o nodo). */
  function tex(destino, latex, display = false) {
    const el = typeof destino === 'string' ? document.getElementById(destino) : destino;
    if (!el) return;
    try { katex.render(latex, el, { displayMode: display, throwOnError: false }); }
    catch { el.textContent = latex; }
  }

  /** Renderiza todas las fórmulas $...$ y $$...$$ dentro de un contenedor (para teoría y ejemplos). */
  function texEn(contenedor = document.body) {
    if (typeof renderMathInElement !== 'function') return;
    renderMathInElement(contenedor, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false }
      ],
      throwOnError: false
    });
  }

  /** Formatea un número para mostrarlo en LaTeX (6 decimales por defecto). */
  function num(v, dec = 6) {
    if (v === null || !Number.isFinite(v)) return '\\text{—}';
    const abs = Math.abs(v);
    if (abs !== 0 && (abs < 1e-5 || abs >= 1e7)) {
      const [m, e] = v.toExponential(3).split('e');
      return `${m}\\times 10^{${parseInt(e, 10)}}`;
    }
    return String(Number(v.toFixed(dec)));
  }

  /* ---------- Plotly ---------- */
  /** Colores de la gráfica según el tema activo. */
  function colores() {
    const claro = document.documentElement.dataset.tema === 'claro';
    return {
      texto: claro ? '#1a1a1a' : '#f2f2f2',
      rejilla: claro ? '#e6dcdc' : '#2a2424',
      curva: claro ? '#111111' : '#ffffff',
      rojo: '#e10600',
      rojoRelleno: 'rgba(225,6,0,0.28)',
      acento: claro ? '#8a0000' : '#ff6b5e'
    };
  }

  /** Diseño base adaptable a móvil: sin márgenes grandes y con el tema actual. */
  function layout(extra = {}) {
    const c = colores();
    return Object.assign({
      autosize: true,
      margin: { l: 44, r: 14, t: 28, b: 40 },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: c.texto, family: 'Source Sans 3, system-ui, sans-serif' },
      xaxis: { gridcolor: c.rejilla, zerolinecolor: c.texto, zerolinewidth: 1 },
      yaxis: { gridcolor: c.rejilla, zerolinecolor: c.texto, zerolinewidth: 1 },
      legend: { orientation: 'h', y: -0.2 },
      showlegend: true
    }, extra);
  }

  /** Dibuja o actualiza una gráfica; siempre responsive. */
  function dibujar(id, trazas, extraLayout = {}) {
    return Plotly.react(id, trazas, layout(extraLayout), { responsive: true, displaylogo: false, modeBarButtonsToRemove: ['lasso2d', 'select2d'] });
  }

  /** Traza de la curva f(x) en [a,b] (con un margen visual opcional). */
  function trazaCurva(f, a, b, nombre = 'f(x)', margen = 0.1) {
    const c = colores(), m = (b - a) * margen, N = 400;
    const xs = Array.from({ length: N + 1 }, (_, i) => a - m + ((b - a + 2 * m) * i) / N);
    const ys = xs.map((x) => { const y = f(x); return Number.isFinite(y) && Math.abs(y) < 1e6 ? y : null; });
    return { x: xs, y: ys, mode: 'lines', name: nombre, line: { color: c.curva, width: 3 }, connectgaps: false };
  }

  /** Traza de un polígono relleno (rectángulo, trapecio, parábola...). */
  function trazaRelleno(xs, ys, nombre, mostrarLeyenda = false) {
    const c = colores();
    return { x: xs, y: ys, mode: 'lines', fill: 'toself', fillcolor: c.rojoRelleno,
      line: { color: c.rojo, width: 1.5 }, name: nombre, showlegend: mostrarLeyenda, hoverinfo: 'skip' };
  }

  // Renderiza con KaTeX todas las fórmulas $...$ y $$...$$ de la página (teoría y ejemplos estáticos)
  document.addEventListener('DOMContentLoaded', () => texEn(document.body));

  // Re-dibuja las gráficas cuando el usuario cambia el tema
  document.addEventListener('click', (e) => {
    if (e.target.closest('#btn-tema')) setTimeout(() => document.dispatchEvent(new Event('tema-cambiado')), 0);
  });

  return { tex, texEn, num, colores, layout, dibujar, trazaCurva, trazaRelleno };
})();
