/**
 * matematicas.js
 * Parser de funciones (math.js) y métodos numéricos de integración.
 * Todo vive en el objeto global `Mat`. Requiere math.js cargado antes.
 */
const Mat = (function () {
  /* ---------- Parser ---------- */
  /**
   * Convierte el texto del usuario en una función JS f(x).
   * Acepta: x^2, sin(x), 1/x, sqrt(x), e^x, ln(x), pi, 2x (multiplicación implícita).
   * @returns {{f: Function|null, error: string|null}}
   */
  function parsear(texto) {
    const txt = String(texto || '').trim().replace(/π/g, 'pi').replace(/,/g, '.');
    if (!txt) return { f: null, error: 'Escribe una función, por ejemplo: x^2' };
    try {
      const nodo = math.parse(txt);
      const codigo = nodo.compile();
      // ln(x) en math.js es log(x); lo definimos explícitamente
      const alcance = { ln: Math.log, x: 0 };
      const f = (x) => { alcance.x = x; const y = codigo.evaluate(alcance); return typeof y === 'number' ? y : NaN; };
      f(1); // prueba rápida: si hay símbolos desconocidos, lanza error aquí
      return { f, error: null };
    } catch (e) {
      return { f: null, error: 'No pude entender "' + texto + '". Revisa paréntesis y usa x como variable (ej: x^2, sin(x), 1/x).' };
    }
  }

  /* ---------- Particiones ---------- */
  const deltaX = (a, b, n) => (b - a) / n;
  /** Nodos x0..xn equiespaciados. */
  const nodos = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => a + (i * (b - a)) / n);
  /** Puntos medios x̄1..x̄n. */
  const medios = (a, b, n) => { const x = nodos(a, b, n); return x.slice(1).map((xi, i) => (x[i] + xi) / 2); };

  /* ---------- Métodos ---------- */
  /** Suma de Riemann. tipo: 'izquierda' | 'derecha' | 'medio'. */
  function riemann(f, a, b, n, tipo) {
    const dx = deltaX(a, b, n), x = nodos(a, b, n);
    let s = 0;
    for (let i = 0; i < n; i++) {
      const xe = tipo === 'izquierda' ? x[i] : tipo === 'derecha' ? x[i + 1] : (x[i] + x[i + 1]) / 2;
      s += f(xe);
    }
    return s * dx;
  }
  const puntoMedio = (f, a, b, n) => riemann(f, a, b, n, 'medio');

  function trapecio(f, a, b, n) {
    const dx = deltaX(a, b, n), x = nodos(a, b, n);
    let s = f(x[0]) + f(x[n]);
    for (let i = 1; i < n; i++) s += 2 * f(x[i]);
    return (dx / 2) * s;
  }

  /** Simpson 1/3. Lanza error si n no es par. */
  function simpson(f, a, b, n) {
    if (n % 2 !== 0) throw new Error('En la regla de Simpson n debe ser PAR.');
    const dx = deltaX(a, b, n), x = nodos(a, b, n);
    let s = f(x[0]) + f(x[n]);
    for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(x[i]);
    return (dx / 3) * s;
  }

  /** Valor "exacto" numérico: Simpson con muchos subintervalos (n par grande). */
  const exacta = (f, a, b) => simpson(f, a, b, 20000);

  /** Errores absoluto y relativo (relativo = null si el valor exacto es 0). */
  function errores(aprox, exacto) {
    let abs = Math.abs(exacto - aprox);
    if (abs < 1e-10) abs = 0; // ruido de redondeo del "exacto" numérico
    return { abs, rel: exacto === 0 ? null : abs / Math.abs(exacto) };
  }

  /** Valida a, b, n. Devuelve mensaje de error o null. */
  function validar(a, b, n, exigirPar) {
    if (![a, b].every(Number.isFinite)) return 'Los límites a y b deben ser números.';
    if (a >= b) return 'El límite inferior a debe ser menor que b.';
    if (!Number.isInteger(n) || n < 1) return 'n debe ser un entero positivo.';
    if (exigirPar && n % 2 !== 0) return 'Para Simpson, n debe ser par. Cambia n a ' + (n + 1) + ' o ' + (n - 1) + '.';
    return null;
  }

  /** Revisa que f sea finita en el intervalo (detecta 1/x en [-1,1], ln(x) con x<0...). */
  function funcionValida(f, a, b) {
    for (const x of nodos(a, b, 50)) if (!Number.isFinite(f(x))) return false;
    return true;
  }

  return { parsear, deltaX, nodos, medios, riemann, puntoMedio, trapecio, simpson, exacta, errores, validar, funcionValida };
})();
