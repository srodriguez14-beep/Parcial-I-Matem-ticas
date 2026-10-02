# Cálculo Integral · Plataforma interactiva

Plataforma web educativa para el curso de **Cálculo Integral** de Tecnología en Desarrollo de Software
(Universidad Tecnológica de Pereira). Proyecto semestral en 3 fases; esta es la **Fase 1**.

## Vista previa

Agrega capturas en `docs/` (por ejemplo `docs/inicio.png`) y enlázalas aquí:
`![Inicio](docs/inicio.png)`

## Qué incluye (Fase 1)

- 14 módulos con navegación, buscador (tecla `/`), modo claro/oscuro y barra de progreso.
- Módulos **1 a 6** completos: Riemann, Trapecio, Punto medio, Simpson (con comparador de errores), Integral definida/área, Integración directa.
- Módulos **7 a 14**: páginas «Próximamente» (Fase 2: 7–10, Fase 3: 11–14).

## Arquitectura

```
index.html                     Inicio (hero, fases, cuadrícula de módulos)
assets/css/styles.css          Estilos y temas (rojo/negro, claro/oscuro)
assets/js/
  modulos-data.js              Lista única de los 14 módulos (índice, navegación y buscador)
  ui.js                        Cabecera, buscador, menú, pestañas, navegación, progreso
  matematicas.js               Parser de funciones (math.js) y métodos numéricos
  graficos.js                  Ayudas de KaTeX y Plotly
  visualizador.js              Componente Visualizador + comparador de errores
  ejemplos.js                  Ejemplos resueltos paso a paso (calculados, no escritos a mano)
modulos/01-riemann … 06-integracion-directa   Módulos completos (index.html; 05 y 06 con su .js)
modulos/07-sustitucion … 14-partes            Placeholders
```

## Tecnologías

HTML5, CSS3 y JavaScript puro (sin frameworks ni compilación) · [KaTeX](https://katex.org) ·
[Plotly.js](https://plotly.com/javascript/) · [math.js](https://mathjs.org) (todo por CDN).

## Ejecutar localmente

1. Descarga o clona el repositorio.
2. Abre `index.html` en el navegador (necesitas internet para cargar las librerías por CDN).
3. Opcional, con servidor local: `python3 -m http.server 8000` y entra a `http://localhost:8000`.

## Desplegar en GitHub Pages

1. Crea un repositorio en GitHub y sube el contenido de esta carpeta (con `index.html` en la raíz).
2. En el repositorio: **Settings → Pages**.
3. En *Build and deployment*, elige **Deploy from a branch**, rama `main` y carpeta `/ (root)`. Guarda.
4. Espera 1–2 minutos: la página quedará en `https://TU-USUARIO.github.io/NOMBRE-REPO/`.

Todas las rutas son relativas, por lo que funciona dentro de la subcarpeta del repositorio.

## Cómo agregar o completar un módulo

1. Edita su entrada en `assets/js/modulos-data.js` (cambia `fase: 1` para marcarlo «Disponible»).
2. Copia la carpeta de un módulo existente (por ejemplo `modulos/02-trapecio/`) como plantilla.
3. Cambia el título, el número en `<body data-modulo="N">`, la teoría y los ejemplos.
4. Para un método numérico basta con `new Visualizador({ contenedor: 'viz', metodo: '...', inicial: {...} })`
   y `Ejemplos.numerico('ejemplos', {...})`.
5. Para visualizadores nuevos usa `Mat` (cálculo), `Gfx` (KaTeX/Plotly) y emite/escucha el evento `tema-cambiado`.

## Hoja de ruta

| Fase | Módulos | Estado |
|------|---------|--------|
| 1 | 1–6: métodos numéricos, integral definida, integración directa | Disponible |
| 2 | 7–10: sustitución, exponenciales, logarítmicas, trigonométricas | Próximamente |
| 3 | 11–14: trig. inversas, hiperbólicas inversas, trinomio, partes | Próximamente |

## Uso de IA

Este software se desarrolló con asistencia de inteligencia artificial (Claude, de Anthropic) para generar
y revisar código, estructura y contenido. Los resultados numéricos de los ejemplos se verificaron contra
los valores exactos; el contenido debe ser revisado por el docente antes de su uso en clase.
