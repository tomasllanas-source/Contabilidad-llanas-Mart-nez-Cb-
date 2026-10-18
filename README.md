# Carnicería · Contabilidad, Calculadora PVP e Inventario

Tres páginas web enlazadas entre sí (menú arriba de cada una):

- `index.html` · **Contabilidad**: caja diaria, gastos, banco, gastos personales, IVA trimestral y CSV para la gestoría.
- `calculadora.html` · **Calculadora PVP**: precio de venta de lo comprado y lo elaborado, lista de ingredientes, CSV y lista de precios para imprimir.
- `inventario.html` · **Inventario**: reponer, pedidos a proveedores, encargos de clientes, tareas y hoja de reposición en PDF.

## Publicarla con GitHub Pages

1. En GitHub, abre el repositorio → **Settings** → **Pages**.
2. En **Source** elige *Deploy from a branch*, la rama (por ejemplo `main`) y la carpeta `/ (root)`. Guarda.
3. Al cabo de un minuto la página estará en `https://<usuario>.github.io/<repositorio>/`.

También sirve cualquier hosting estático (Netlify, Vercel, tu propio servidor): basta con subir los tres archivos `.html` a la misma carpeta.

## Importante: dónde se guardan los datos

- En la web, los apuntes se guardan **solo en el navegador de cada dispositivo** (localStorage). No se comparten entre el móvil y el ordenador, y se pierden si borras los datos del navegador.
- Descarga el CSV de cada periodo con regularidad como copia de seguridad.
- Haz copias con las descargas: CSV en la contabilidad y en la calculadora.
- Solo funcionan dentro de Claude (los artefactos originales): la sincronización entre dispositivos, el archivo de fotos de facturas y la lectura automática de facturas (pestaña «Factura» de la calculadora y fotos de gastos en la contabilidad).
