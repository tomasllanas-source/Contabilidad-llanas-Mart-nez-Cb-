# Contabilidad · Carnicería

Página web de contabilidad (caja diaria, gastos, banco, gastos personales, IVA trimestral y descarga CSV para la gestoría). Es un único archivo: `index.html`.

## Publicarla con GitHub Pages

1. En GitHub, abre el repositorio → **Settings** → **Pages**.
2. En **Source** elige *Deploy from a branch*, la rama (por ejemplo `main`) y la carpeta `/ (root)`. Guarda.
3. Al cabo de un minuto la página estará en `https://<usuario>.github.io/<repositorio>/`.

También sirve cualquier hosting estático (Netlify, Vercel, tu propio servidor): basta con subir `index.html`.

## Importante: dónde se guardan los datos

- En la web, los apuntes se guardan **solo en el navegador de cada dispositivo** (localStorage). No se comparten entre el móvil y el ordenador, y se pierden si borras los datos del navegador.
- Descarga el CSV de cada periodo con regularidad como copia de seguridad.
- La sincronización entre dispositivos, el archivo de fotos de facturas y la lectura automática de facturas solo funcionan dentro de Claude (el artefacto original).
