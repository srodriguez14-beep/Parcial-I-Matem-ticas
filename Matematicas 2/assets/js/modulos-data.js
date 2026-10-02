/**
 * modulos-data.js
 * Fuente única de verdad de los 14 módulos del curso.
 * Para agregar o editar un módulo, solo se modifica este arreglo:
 * el índice, la navegación Anterior/Siguiente y el buscador se actualizan solos.
 */
const MODULOS = [
  { n: 1,  slug: '01-riemann',            titulo: 'Sumas de Riemann',               fase: 1, icono: '∑',  desc: 'Aproxima el área con rectángulos: izquierda, derecha y punto medio.', tags: 'riemann rectangulos suma izquierda derecha aproximacion area convergencia' },
  { n: 2,  slug: '02-trapecio',           titulo: 'Regla del Trapecio',             fase: 1, icono: '⏢',  desc: 'Aproxima el área con trapecios bajo la curva.', tags: 'trapecio trapecios regla aproximacion numerica' },
  { n: 3,  slug: '03-punto-medio',        titulo: 'Regla del Punto Medio',          fase: 1, icono: '◫',  desc: 'Rectángulos evaluados en el centro de cada subintervalo.', tags: 'punto medio rectangulos regla aproximacion' },
  { n: 4,  slug: '04-simpson',            titulo: 'Regla de Simpson',               fase: 1, icono: '⌒',  desc: 'Ajusta parábolas por tramos. Exige n par. Incluye comparador de errores.', tags: 'simpson parabolas n par error comparador' },
  { n: 5,  slug: '05-integral-definida',  titulo: 'Integral Definida y Área bajo la Curva', fase: 1, icono: '∫', desc: 'Teorema Fundamental del Cálculo, área bajo la curva y entre curvas.', tags: 'integral definida area bajo la curva entre curvas teorema fundamental' },
  { n: 6,  slug: '06-integracion-directa',titulo: 'Integración Directa',            fase: 1, icono: '𝑥ⁿ', desc: 'Potencias, linealidad y antiderivadas con constante C ajustable.', tags: 'integracion directa potencias antiderivada primitiva constante C linealidad' },
  { n: 7,  slug: '07-sustitucion',        titulo: 'Sustitución / Potencias',        fase: 2, icono: 'u',  desc: 'Cambio de variable para integrar potencias de funciones.', tags: 'sustitucion cambio de variable u potencias' },
  { n: 8,  slug: '08-exponenciales',      titulo: 'Exponenciales',                  fase: 2, icono: 'eˣ', desc: 'Integrales de funciones exponenciales.', tags: 'exponenciales exponencial e^x' },
  { n: 9,  slug: '09-logaritmicas',       titulo: 'Logarítmicas',                   fase: 2, icono: 'ln', desc: 'Integrales que producen logaritmos naturales.', tags: 'logaritmicas logaritmo ln' },
  { n: 10, slug: '10-trigonometricas',    titulo: 'Trigonométricas',                fase: 2, icono: 'sin', desc: 'Integrales de seno, coseno, tangente y compañía.', tags: 'trigonometricas seno coseno tangente sin cos tan' },
  { n: 11, slug: '11-trig-inversas',      titulo: 'Trigonométricas Inversas',       fase: 3, icono: 'arc', desc: 'Integrales que dan arcsen, arctan y similares.', tags: 'trigonometricas inversas arcsen arctan arcsin arcotangente' },
  { n: 12, slug: '12-hiperbolicas-inversas', titulo: 'Hiperbólicas Inversas',       fase: 3, icono: 'sh', desc: 'Integrales con senh, cosh y sus inversas.', tags: 'hiperbolicas inversas senh cosh sinh arcsinh' },
  { n: 13, slug: '13-trinomio',           titulo: 'Trinomio ax²+bx+c',              fase: 3, icono: 'ax²', desc: 'Completar cuadrados para integrar expresiones con trinomio.', tags: 'trinomio cuadratico completar cuadrados ax2+bx+c' },
  { n: 14, slug: '14-partes',             titulo: 'Integración por Partes',         fase: 3, icono: 'uv', desc: 'La fórmula ∫u dv = uv − ∫v du paso a paso.', tags: 'partes integracion por partes u dv' }
];

/** Un módulo está disponible si pertenece a la Fase 1. */
const estaDisponible = (m) => m.fase === 1;

/** Ruta relativa a un módulo; `base` es '' en la raíz y '../../' dentro de /modulos/xx/. */
const rutaModulo = (m, base = '') => `${base}modulos/${m.slug}/index.html`;
