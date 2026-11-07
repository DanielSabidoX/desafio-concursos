/* ============================================================================
   MASTER — firebase-config.js
   ----------------------------------------------------------------------------
   CONFIGURAÇÃO OPCIONAL DO MODO ONLINE.

   O jogo funciona 100% sem Firebase (modo "Partida local"). O Firebase só é
   usado pelas "Salas online", que gravam na coleção "master_rooms" — separada
   da coleção usada pelo jogo Detetive, então os dois jogos não se misturam.

   COMO CONFIGURAR:
   1. Crie um projeto gratuito em https://console.firebase.google.com
   2. Ative o "Firestore Database" (modo de produção).
   3. Em "Configurações do projeto" > "Geral" > "Seus apps", crie um app Web.
   4. Cole as credenciais no objeto firebaseConfig abaixo.
   5. Libere a coleção "master_rooms" nas regras do Firestore (veja README.md).

   Se o Firebase não estiver disponível (sem internet, scripts bloqueados ou
   credenciais inválidas), o jogo continua abrindo e o modo local funciona.
   ========================================================================== */

(function () {
  'use strict';

  // Credenciais padrão (mesmo projeto usado pelo Detetive). Troque se quiser
  // um projeto separado só para o Master.
  const firebaseConfig = {
    apiKey: "AIzaSyBtVLcNpJZx8dlaDQEWjwziZNONYHzR9MU",
    authDomain: "desafio-concursos.firebaseapp.com",
    projectId: "desafio-concursos",
    storageBucket: "desafio-concursos.firebasestorage.app",
    messagingSenderId: "432040645758",
    appId: "1:432040645758:web:d73d3372d262f723c6b42f"
  };

  window.masterFirebaseConfig = firebaseConfig;
  window.masterDb = null;
  window.masterOnline = false;

  if (typeof firebase === 'undefined' || !firebase.initializeApp || !firebase.firestore) {
    console.warn('[master] Firebase não carregou. O modo online ficará indisponível; o modo local funciona normalmente.');
    return;
  }

  try {
    var app;
    try {
      // Reaproveita o app já inicializado (se houver) para não duplicar.
      app = firebase.app();
    } catch (e) {
      app = firebase.initializeApp(firebaseConfig);
    }

    window.masterDb = app.firestore();
    window.masterOnline = true;

    // Cache offline (opcional). Se o navegador não permitir, ignora.
    try {
      window.masterDb.enablePersistence({ synchronizeTabs: true }).catch(function () {});
    } catch (e) { /* ignorado */ }

    console.info('[master] Firebase conectado — salas online disponíveis.');
  } catch (e) {
    window.masterDb = null;
    window.masterOnline = false;
    console.warn('[master] Não foi possível iniciar o Firebase:', e && e.message ? e.message : e);
  }
})();
