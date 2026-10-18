/* Configuración de tu proyecto de Firebase.
   La sacas de la consola de Firebase: Configuración del proyecto → General → Tus apps → App web → "Configuración".
   Estos datos no son secretos (van en todas las webs con Firebase); lo que protege tus datos son las
   reglas de firestore.rules y el inicio de sesión.
   Si apiKey pone PEGA_AQUI, las páginas guardan solo en el navegador. */
window.FIREBASE_CONFIG={
  apiKey:"AIzaSyCjWFTDm5kysb7TfqwckMcOU1ZJEXQXMFM",
  authDomain:"contabilidad-llanas.firebaseapp.com",
  projectId:"contabilidad-llanas",
  storageBucket:"contabilidad-llanas.firebasestorage.app",
  messagingSenderId:"560123601204",
  appId:"1:560123601204:web:1a11b3844b4ff067e10561"
};
// Fotos de facturas: con false se guardan dentro de la base de datos (plan gratis).
// Pon true solo si activas Firebase Storage (plan Blaze) y pegas storage.rules.
window.FIREBASE_FOTOS=false;
// Leer facturas con IA (Gemini mediante Firebase AI Logic). En España exige el plan Blaze:
// activa «Firebase AI Logic» en la consola y pon true.
window.FIREBASE_IA=false;
window.FIREBASE_IA_MODELO='gemini-3.8-flash';
