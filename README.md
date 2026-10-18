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

## Datos compartidos entre dispositivos (Firebase)

Sin configurar, cada página guarda solo en el navegador del dispositivo. Para que el móvil y el ordenador vean lo mismo:

1. **Crea la app web.** En la [consola de Firebase](https://console.firebase.google.com/) abre tu proyecto. Ve a ⚙️ **Configuración del proyecto** → **General** → **Tus apps** → icono `</>` (Web) y regístrala. Copia los valores de `firebaseConfig` en `firebase-config.js`.
2. **Activa el inicio de sesión.** Ve a **Authentication** → **Método de acceso** → **Correo electrónico/contraseña** → Habilitar. En la pestaña **Usuarios** → *Agregar usuario*, crea una cuenta para cada persona que vaya a usar las páginas. En **Configuración** → *Acciones del usuario*, desmarca **Habilitar creación (registro)** para que nadie más pueda crearse una cuenta.
3. **Crea la base de datos.** Ve a **Firestore Database** → *Crear base de datos* (ubicación `eur3` o `europe-southwest1`, modo producción).
4. **Pon las reglas.** En **Firestore** → **Reglas**, pega el contenido de `firestore.rules` con vuestros correos en la lista, y publica.

**Fotos de facturas:** con el plan gratis se guardan reducidas dentro de Firestore (`negocio/contabilidad/fotos`), sin configurar nada más. Si algún día preferís Firebase Storage (plan Blaze): en **Storage** → *Comenzar*, crea el almacén y pega `storage.rules` en la pestaña **Reglas**. Después pon `window.FIREBASE_FOTOS=true` en `firebase-config.js`. Para que funcione «Descargar carpeta (ZIP)», el almacén necesita permitir descargas desde la web (CORS). Desde Cloud Shell:
`echo '[{"origin":["https://tomasllanas-source.github.io"],"method":["GET"],"maxAgeSeconds":3600}]' > cors.json && gcloud storage buckets update gs://contabilidad-llanas.firebasestorage.app --cors-file=cors.json`

Cada página guarda sus datos aparte en Firestore (`negocio/contabilidad`, `negocio/calculadora` y `negocio/inventario`). Las páginas funcionan sin cobertura: los cambios se suben solos al volver la conexión.

## Importante: dónde se guardan los datos

- Sin Firebase configurado, los apuntes se guardan **solo en el navegador de cada dispositivo** (localStorage). No se comparten entre el móvil y el ordenador, y se pierden si borras los datos del navegador. Con Firebase se guardan en tu proyecto, pero lo apuntado antes solo en el navegador no se sube solo.
- Descarga el CSV de cada periodo con regularidad como copia de seguridad.
- Haz copias con las descargas: CSV en la contabilidad y en la calculadora.
- Solo funcionan dentro de Claude (los artefactos originales): la lectura automática de facturas con IA (pestaña «Factura» de la calculadora y relleno automático de gastos en la contabilidad).
