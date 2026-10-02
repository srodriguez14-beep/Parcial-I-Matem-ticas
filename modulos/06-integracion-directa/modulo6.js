/**
 * modulo6.js — Integración directa.
 * Muestra f(x) y su antiderivada F(x)+C (C ajustable) y anima la
 * "verificación por derivación": en cada punto, la pendiente de F coincide con f(x).
 */
(function () {
  // Pares f(x) / F(x) del taller (sintaxis math.js; "log" es el logaritmo natural)
  const PRESETS = [
    { txt: '∫ x² dx',                       f: 'x^2',                    F: 'x^3/3',                           fT: 'x^2',                              FT: '\\frac{x^3}{3}',                               r: [-3, 3] },
    { txt: '∫ (3/x² − 9/√x) dx',            f: '3/x^2-9/sqrt(x)',        F: '-3/x-18*sqrt(x)',                 fT: '\\frac{3}{x^2}-\\frac{9}{\\sqrt{x}}', FT: '-\\frac{3}{x}-18\\sqrt{x}',                  r: [0.3, 4] },
    { txt: '∫ (x − 1)(x + 1) dx',           f: '(x-1)*(x+1)',            F: 'x^3/3-x',                         fT: '(x-1)(x+1)',                       FT: '\\frac{x^3}{3}-x',                             r: [-3, 3] },
    { txt: '∫ (x + 4√x − 4/x) dx',          f: 'x+4*sqrt(x)-4/x',        F: 'x^2/2+8/3*x^(3/2)-4*log(x)',      fT: 'x+4\\sqrt{x}-\\frac{4}{x}',        FT: '\\frac{x^2}{2}+\\frac{8}{3}x^{3/2}-4\\ln|x|',  r: [0.3, 4] },
    { txt: '∫ (x − 1 − 1/x) dx',            f: 'x-1-1/x',                F: 'x^2/2-x-log(x)',                  fT: 'x-1-\\frac{1}{x}',                 FT: '\\frac{x^2}{2}-x-\\ln|x|',                     r: [0.3, 4] }
  ];

  const raiz = document.getElementById('viz6');
  const q = (s) => document.getElementById('v6-' + s);
  raiz.innerHTML = `
    <div class="controles">
      <div class="campo"><label for="v6-p">Integral</label>
        <select id="v6-p">${PRESETS.map((p, i) => `<option value="${i}">${p.txt}</option>`).join('')}</select></div>
      <div class="campo"><label for="v6-c">Constante C = <b id="v6-cv">0</b></label>
        <input id="v6-c" type="range" min="-5" max="5" step="0.1" value="0"></div>
      <div class="campo"><label>&nbsp;</label><button type="button" class="btn" id="v6-ver">Verificar por derivación</button></div>
    </div>
    <div class="caja formula" id="v6-formula"></div>
    <div class="caja"><div id="v6-graf" class="grafica" role="img" aria-label="Gráfica de f(x) y de su antiderivada F(x)"></div></div>
    <div class="caja" id="v6-verif" aria-live="polite"><p>Pulsa «Verificar por derivación» para ver cómo la pendiente de F(x) coincide con f(x) punto por punto.</p></div>`;

  let animacion = null, tangente = null;
  const cur = () => PRESETS[q('p').value];

  /** Dibuja f, F+C y (opcional) la recta tangente a F en x0. */
  function dibujar(x0) {
    const p = cur(), C = parseFloat(q('c').value), c = Gfx.colores();
    q('cv').textContent = C;
    const f = Mat.parsear(p.f).f, F0 = Mat.parsear(p.F).f, F = (x) => F0(x) + C;
    Gfx.tex('v6-formula',
      `\\int ${p.fT}\\,dx = ${p.FT} + C \\qquad\\text{y}\\qquad \\frac{d}{dx}\\left[F(x)+C\\right]=f(x)`, true);
    const [lo, hi] = p.r, N = 300;
    const xs = Array.from({ length: N + 1 }, (_, i) => lo + ((hi - lo) * i) / N);
    const lim = (y) => (Number.isFinite(y) && Math.abs(y) < 60 ? y : null);   // recorta asíntotas
    const tr = [
      { x: xs, y: xs.map((x) => lim(f(x))), mode: 'lines', name: 'f(x)', line: { color: c.curva, width: 3 } },
      { x: xs, y: xs.map((x) => lim(F(x))), mode: 'lines', name: `F(x) + C   (C = ${C})`, line: { color: c.rojo, width: 3 } }
    ];
    if (x0 !== undefined) {
      const m = f(x0), y0 = F(x0), d = (hi - lo) * 0.12;
      tr.push({ x: [x0 - d, x0 + d], y: [y0 - m * d, y0 + m * d], mode: 'lines', name: 'Tangente a F (pendiente = f(x₀))', line: { color: '#ff9f1c', width: 3, dash: 'dot' } });
      tr.push({ x: [x0], y: [y0], mode: 'markers', showlegend: false, marker: { size: 11, color: '#ff9f1c' } });
    }
    Gfx.dibujar('v6-graf', tr, { yaxis: { range: [-12, 12], gridcolor: c.rejilla, zerolinecolor: c.texto } });
  }

  /** Anima x0 recorriendo el intervalo y compara F'(x0) (numérica) con f(x0). */
  function verificar() {
    clearInterval(animacion);
    const p = cur(), C = parseFloat(q('c').value);
    const f = Mat.parsear(p.f).f, F0 = Mat.parsear(p.F).f, F = (x) => F0(x) + C;
    const [lo, hi] = p.r, pasos = 40, h = 1e-5;
    let k = 0, peor = 0;
    animacion = setInterval(() => {
      const x0 = lo + ((hi - lo) * (k + 0.5)) / pasos;
      const dF = (F(x0 + h) - F(x0 - h)) / (2 * h), fx = f(x0);
      peor = Math.max(peor, Math.abs(dF - fx));
      dibujar(x0);
      Gfx.tex(q('verif'),
        `x_0=${Gfx.num(x0, 3)}\\quad F'(x_0)\\approx\\frac{F(x_0+h)-F(x_0-h)}{2h}=${Gfx.num(dF, 5)}\\quad f(x_0)=${Gfx.num(fx, 5)}\\ \\checkmark`, true);
      if (++k >= pasos) {
        clearInterval(animacion);
        Gfx.tex(q('verif'), `\\text{Verificado: }\\max|F'(x)-f(x)|\\approx ${Gfx.num(peor, 8)}\\;\\Rightarrow\\; F'(x)=f(x)\\ \\checkmark`, true);
        dibujar();
      }
    }, 90);
  }

  q('p').addEventListener('change', () => { clearInterval(animacion); dibujar(); });
  q('c').addEventListener('input', () => { clearInterval(animacion); dibujar(); });
  q('ver').addEventListener('click', verificar);
  document.addEventListener('tema-cambiado', () => dibujar());
  dibujar();
})();
