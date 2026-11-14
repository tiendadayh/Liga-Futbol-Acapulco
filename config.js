/* =====================================================================
   CONFIGURACIÓN DE LA LIGA  (único archivo que se edita por cliente)
   Cambia aquí el nombre y los datos; las 3 páginas (index, admin y
   arbitro) lo leen. El nombre también se puede cambiar desde el panel
   admin (Configuración) y ese cambio manda sobre este valor.
   ===================================================================== */
window.LIGA_CONFIG = {
  nombre: 'Liga de Futbol Acapulco',

  // Contacto y datos legales (aviso de privacidad / pie de página)
  whatsapp: '744 241 1773',
  ciudad: 'Acapulco de Juárez, Guerrero',
  correo: '',
  domicilio: '',

  // Firebase: cada liga debe usar SU PROPIO proyecto de Firebase.
  firebase: {
    apiKey: "AIzaSyDG07c_D4qtCJXap9J1ppU8xLk3IdWYOXo",
    authDomain: "liga-premier-acapulco.firebaseapp.com",
    databaseURL: "https://liga-premier-acapulco-default-rtdb.firebaseio.com",
    projectId: "liga-premier-acapulco",
    storageBucket: "liga-premier-acapulco.firebasestorage.app",
    messagingSenderId: "426642299369",
    appId: "1:426642299369:web:b3486f21982fd5f3515378",
    measurementId: "G-4NB813C868"
  }
};
