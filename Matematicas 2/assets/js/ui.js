/**
 * ui.js
 * Interfaz compartida por TODAS las páginas:
 *  - Cabecera (marca, buscador, tema claro/oscuro, menú de módulos)
 *  - Buscador de los 14 módulos (sin tildes, por palabras, con teclado)
 *  - Navegación Anterior / Siguiente
 *  - Progreso de módulos visitados (localStorage)
 *
 * Cada página solo necesita: <body data-base="../../" data-modulo="3"> y
 * <div id="app-header"></div>. Requiere modulos-data.js cargado antes.
 */
(function () {
  const base = document.body.dataset.base || '';
  const actual = parseInt(document.body.dataset.modulo || '0', 10);
  const KEY_TEMA = 'ci-tema';
  const KEY_VISTOS = 'ci-vistos';

  /* ---------- Utilidades ---------- */
  /** Quita tildes y pasa a minúsculas: "Trigonométricas" -> "trigonometricas". */
  const normalizar = (s) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  const leerVistos = () => {
    try { return JSON.parse(localStorage.getItem(KEY_VISTOS)) || []; } catch { return []; }
  };

  /* ---------- Tema claro / oscuro ---------- */
  function aplicarTema(t) {
    document.documentElement.dataset.tema = t;
    try { localStorage.setItem(KEY_TEMA, t); } catch {}
  }
  function temaInicial() {
    let t = null;
    try { t = localStorage.getItem(KEY_TEMA); } catch {}
    return t || 'oscuro';
  }

  /* ---------- Cabecera ---------- */
  function construirCabecera() {
    const cont = document.getElementById('app-header');
    if (!cont) return;
    const vistos = leerVistos().length;
    const items = MODULOS.map((m) => {
      const cls = [m.n === actual ? 'activo' : '', estaDisponible(m) ? '' : 'pronto'].join(' ');
      return `<li><a class="${cls}" href="${rutaModulo(m, base)}"><b>${m.n}</b>${m.titulo}</a></li>`;
    }).join('');

    cont.innerHTML = `
      <header class="topbar">
        <a class="marca" href="${base}index.html" aria-label="Ir al inicio">
          <span class="marca-signo">∫</span><span class="marca-texto">Cálculo Integral</span>
        </a>
        <div class="buscador" role="search">
          <input id="buscador" type="search" autocomplete="off" placeholder="Buscar módulo…  ( / )"
                 aria-label="Buscar módulo" aria-controls="resultados" aria-expanded="false">
          <ul id="resultados" role="listbox" hidden></ul>
        </div>
        <button id="btn-tema" class="btn-icono" aria-label="Cambiar entre modo claro y oscuro">◐</button>
        <button id="btn-menu" class="btn-icono btn-menu" aria-label="Abrir menú de módulos"
                aria-expanded="false" aria-controls="menu-modulos">☰<span>Módulos</span></button>
      </header>
      <nav id="menu-modulos" class="menu-modulos" aria-label="Módulos del curso" hidden>
        <ul>${items}</ul>
      </nav>
      <div class="progreso" title="Módulos visitados"><i style="width:${(vistos / MODULOS.length) * 100}%"></i></div>`;

    document.getElementById('btn-tema').addEventListener('click', () =>
      aplicarTema(document.documentElement.dataset.tema === 'claro' ? 'oscuro' : 'claro'));

    const btn = document.getElementById('btn-menu');
    const menu = document.getElementById('menu-modulos');
    btn.addEventListener('click', () => {
      const abrir = menu.hidden;
      menu.hidden = !abrir;
      btn.setAttribute('aria-expanded', String(abrir));
    });
  }

  /* ---------- Buscador ---------- */
  /** Devuelve los módulos que contienen TODAS las palabras buscadas. */
  function buscarModulos(consulta) {
    const palabras = normalizar(consulta).split(/\s+/).filter(Boolean);
    if (!palabras.length) return [];
    return MODULOS
      .map((m) => {
        const titulo = normalizar(m.titulo);
        const pajar = `${titulo} ${normalizar(m.tags)} modulo ${m.n} fase ${m.fase} ${normalizar(m.desc)}`;
        if (!palabras.every((p) => pajar.includes(p))) return null;
        // Más puntos si coincide en el título o es el número exacto
        let puntos = palabras.reduce((a, p) => a + (titulo.includes(p) ? 2 : 1), 0);
        if (palabras.length === 1 && palabras[0] === String(m.n)) puntos += 5;
        return { m, puntos };
      })
      .filter(Boolean)
      .sort((a, b) => b.puntos - a.puntos || a.m.n - b.m.n)
      .map((r) => r.m);
  }

  function iniciarBuscador() {
    const input = document.getElementById('buscador');
    const lista = document.getElementById('resultados');
    if (!input) return;
    let sel = -1;

    const cerrar = () => { lista.hidden = true; input.setAttribute('aria-expanded', 'false'); sel = -1; };
    const marcar = () => {
      [...lista.children].forEach((li, i) => li.setAttribute('aria-selected', String(i === sel)));
    };
    const pintar = () => {
      const res = buscarModulos(input.value);
      if (!input.value.trim()) return cerrar();
      lista.innerHTML = res.length
        ? res.map((m) => `<li role="option" aria-selected="false">
            <a href="${rutaModulo(m, base)}"><b>${m.n}</b><span>${m.titulo}</span>
            <small>${estaDisponible(m) ? 'Disponible' : 'Fase ' + m.fase}</small></a></li>`).join('')
        : '<li class="vacio">Sin resultados. Prueba con "simpson", "trapecio" o "partes".</li>';
      lista.hidden = false;
      input.setAttribute('aria-expanded', 'true');
      sel = -1;
    };

    input.addEventListener('input', pintar);
    input.addEventListener('focus', pintar);
    input.addEventListener('keydown', (e) => {
      const n = lista.querySelectorAll('a').length;
      if (e.key === 'ArrowDown' && n) { e.preventDefault(); sel = (sel + 1) % n; marcar(); }
      else if (e.key === 'ArrowUp' && n) { e.preventDefault(); sel = (sel - 1 + n) % n; marcar(); }
      else if (e.key === 'Enter') {
        const a = lista.querySelectorAll('a')[Math.max(sel, 0)];
        if (a) location.href = a.href;
      } else if (e.key === 'Escape') { cerrar(); input.blur(); }
    });
    document.addEventListener('click', (e) => { if (!e.target.closest('.buscador')) cerrar(); });
    // Atajo "/" para enfocar el buscador desde cualquier parte
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
        e.preventDefault(); input.focus();
      }
    });
  }

  /* ---------- Navegación Anterior / Siguiente ---------- */
  function construirNavModulos() {
    const cont = document.getElementById('nav-modulos');
    if (!cont || !actual) return;
    const ant = MODULOS.find((m) => m.n === actual - 1);
    const sig = MODULOS.find((m) => m.n === actual + 1);
    cont.className = 'nav-modulos';
    cont.innerHTML = `
      ${ant ? `<a class="btn" href="${rutaModulo(ant, base)}">← ${ant.titulo}</a>` : '<span></span>'}
      <a class="btn btn-fantasma" href="${base}index.html">Inicio</a>
      ${sig ? `<a class="btn" href="${rutaModulo(sig, base)}">${sig.titulo} →</a>` : '<span></span>'}`;
  }

  /* ---------- Progreso ---------- */
  function registrarVisita() {
    if (!actual || !estaDisponible(MODULOS[actual - 1])) return;
    const v = new Set(leerVistos());
    v.add(actual);
    try { localStorage.setItem(KEY_VISTOS, JSON.stringify([...v])); } catch {}
  }

  /* ---------- Pestañas (Teoría | Visualizador | Ejemplos | Práctica) ---------- */
  function iniciarPestanas() {
    document.querySelectorAll('[role="tablist"]').forEach((lista) => {
      const tabs = [...lista.querySelectorAll('[role="tab"]')];
      const activar = (tab) => {
        tabs.forEach((t) => {
          const on = t === tab;
          t.setAttribute('aria-selected', String(on));
          t.tabIndex = on ? 0 : -1;
          document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
        });
        // Plotly necesita recalcular el tamaño cuando su pestaña se hace visible
        window.dispatchEvent(new Event('resize'));
      };
      tabs.forEach((t, i) => {
        t.addEventListener('click', () => activar(t));
        t.addEventListener('keydown', (e) => {
          const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
          if (d) { const s = tabs[(i + d + tabs.length) % tabs.length]; s.focus(); activar(s); }
        });
      });
    });
  }

  /* ---------- Aparición suave al hacer scroll (elementos con .aparece) ---------- */
  function iniciarApariciones() {
    const els = document.querySelectorAll('.aparece');
    if (!('IntersectionObserver' in window)) return els.forEach((e) => e.classList.add('visible'));
    const obs = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    }), { threshold: 0.1 });
    els.forEach((e) => obs.observe(e));
  }

  /* ---------- Inicio ---------- */
  aplicarTema(temaInicial());
  document.addEventListener('DOMContentLoaded', () => {
    construirCabecera();
    iniciarBuscador();
    construirNavModulos();
    iniciarPestanas();
    registrarVisita();
    iniciarApariciones();
  });

  // API pública mínima, por si otros scripts la necesitan
  window.CI = { buscarModulos, normalizar };
})();
