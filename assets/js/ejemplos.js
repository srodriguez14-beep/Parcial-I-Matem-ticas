/**
 * ejemplos.js
 * Genera ejemplos resueltos paso a paso para los métodos numéricos.
 * Los valores se CALCULAN con matematicas.js, así que la tabla y el resultado siempre son correctos.
 *
 * Uso: Ejemplos.numerico('contenedor', { titulo, expr, fTex, a, b, n, metodo, aTex, bTex, exactoTex })
 *   metodo: 'izquierda' | 'derecha' | 'medio' | 'trapecio' | 'simpson'  (o un arreglo de ellos)
 */
const Ejemplos = (function () {
  const NOM = {
    izquierda: ['Suma izquierda', 'L'], derecha: ['Suma derecha', 'R'], medio: ['Regla del punto medio', 'M'],
    trapecio: ['Regla del trapecio', 'T'], simpson: ['Regla de Simpson', 'S']
  };
  const v = (x, d = 5) => Gfx.num(x, d);              // número -> texto LaTeX
  const D = (s) => '$$' + s + '$$';                    // fórmula en bloque
  const I = (s) => '$' + s + '$';                      // fórmula en línea
  const suma = (arr) => (arr.length ? arr.map((y) => v(y)).join(' + ') : '0');

  /** Construye una tarjeta de ejemplo para un método concreto. */
  function tarjeta(cont, c, metodo) {
    const f = Mat.parsear(c.expr).f;
    const { a, b, n } = c;
    const dx = (b - a) / n, x = Mat.nodos(a, b, n), [nom, L] = NOM[metodo];
    const aT = c.aTex ?? v(a), bT = c.bTex ?? v(b);
    const nodo = metodo === 'medio' ? '\\bar{x}_i' : 'x_i';

    // Qué puntos se evalúan según el método
    let pts, idx;
    if (metodo === 'medio') { pts = Mat.medios(a, b, n); idx = pts.map((_, i) => i + 1); }
    else if (metodo === 'izquierda') { pts = x.slice(0, n); idx = pts.map((_, i) => i); }
    else if (metodo === 'derecha') { pts = x.slice(1); idx = pts.map((_, i) => i + 1); }
    else { pts = x; idx = x.map((_, i) => i); }
    const ys = pts.map(f);

    // Resultado y sustitución numérica en la fórmula
    let res, formula, sust;
    if (metodo === 'trapecio') {
      res = Mat.trapecio(f, a, b, n);
      formula = `T_{${n}}=\\frac{\\Delta x}{2}\\left[f(x_0)+2\\sum_{i=1}^{${n}-1}f(x_i)+f(x_{${n}})\\right]`;
      sust = `=\\frac{${v(dx)}}{2}\\left[${v(ys[0])} + 2(${suma(ys.slice(1, -1))}) + ${v(ys[n])}\\right]=${v(res)}`;
    } else if (metodo === 'simpson') {
      res = Mat.simpson(f, a, b, n);
      const imp = ys.filter((_, i) => i % 2 === 1), par = ys.filter((_, i) => i > 0 && i < n && i % 2 === 0);
      formula = `S_{${n}}=\\frac{\\Delta x}{3}\\left[f(x_0)+4\\sum_{i\\ \\text{impar}}f(x_i)+2\\sum_{i\\ \\text{par}}f(x_i)+f(x_{${n}})\\right]`;
      sust = `=\\frac{${v(dx)}}{3}\\left[${v(ys[0])} + 4(${suma(imp)})${par.length ? ` + 2(${suma(par)})` : ''} + ${v(ys[n])}\\right]=${v(res)}`;
    } else {
      res = Mat.riemann(f, a, b, n, metodo);
      formula = `${L}_{${n}}=\\Delta x\\sum f(${nodo})`;
      sust = `=${v(dx)}\\,(${suma(ys)})=${v(res)}`;
    }

    const ex = Mat.exacta(f, a, b), err = Math.abs(ex - res) < 1e-10 ? 0 : Math.abs(ex - res), rel = ex === 0 ? null : (err / Math.abs(ex)) * 100;
    const exTxt = c.exactoTex ? `${c.exactoTex}\\approx ${v(ex)}` : v(ex);
    const filas = idx.map((i, k) => `<tr><td>${i}</td><td>${v(pts[k], 4)}</td><td>${v(ys[k], 5)}</td></tr>`).join('');

    const d = document.createElement('div');
    d.className = 'caja ejemplo';
    d.innerHTML = `
      <h3>${c.titulo ? c.titulo + ' · ' : ''}${nom}</h3>
      <p>Aproximar ${I(`\\displaystyle\\int_{${aT}}^{${bT}} ${c.fTex}\\,dx`)} con ${I(`${L}_{${n}}`)}.</p>
      <p><b>Paso 1.</b> Ancho de cada subintervalo:</p>
      ${D(`\\Delta x=\\frac{b-a}{n}=\\frac{${bT}-${aT}}{${n}}=${v(dx)}`)}
      <p><b>Paso 2.</b> Puntos ${I(nodo + (metodo === 'medio' ? '=\\frac{x_{i-1}+x_i}{2}' : '=a+i\\,\\Delta x'))} y valores de la función:</p>
      <div class="tabla-scroll"><table>
        <tr><th>${I('i')}</th><th>${I(nodo)}</th><th>${I(`f(${nodo})`)}</th></tr>${filas}</table></div>
      <p><b>Paso 3.</b> Aplicar la fórmula:</p>
      ${D(formula)}${D(sust)}
      <p><b>Paso 4.</b> Comparar con el valor exacto ${I(`I=${exTxt}`)}:</p>
      ${D(`E_{abs}=|I-${L}_{${n}}|=${v(err, 6)}\\qquad E_{rel}=${rel === null ? '\\text{—}' : v(rel, 4) + '\\%'}`)}`;
    cont.appendChild(d);
    Gfx.texEn(d);
  }

  function numerico(idCont, cfg) {
    const cont = document.getElementById(idCont);
    [].concat(cfg.metodo).forEach((m) => tarjeta(cont, cfg, m));
  }

  return { numerico };
})();
