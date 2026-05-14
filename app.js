// ======================================
// ELEMENTOS HTML
// ======================================

const btnStart =
  document.getElementById("btnStart");

const estado =
  document.getElementById("estado");

const textoVoz =
  document.getElementById("textoVoz");

const modoSelector =
  document.getElementById("modoSelector");

const historial =
  document.getElementById("historial");

// ======================================
// DETECTAR MOVIL
// ======================================

const esMovil =

  /Android|iPhone|iPad|iPod/i.test(
    navigator.userAgent
  );

// ======================================
// MODO ACTUAL
// ======================================

let modoActual = "casa";

// ======================================
// CONTROL INTELIGENTE
// ======================================

let deteccionesConsecutivas = 1;

let ultimoTipoDetectado = "";

let ultimoHistorial = "";

let ultimoEstado = "";

// ======================================
// CAMBIAR MODOS
// ======================================

modoSelector.addEventListener("change", () => {

  modoActual = modoSelector.value;

  actualizarEstado(
    `⚙️ Modo: ${modoActual.toUpperCase()}`
  );
});

// ======================================
// NOTIFICACIONES
// ======================================

if ("Notification" in window) {

  Notification.requestPermission();
}

function enviarNotificacion(texto) {

  if (

    "Notification" in window &&

    Notification.permission === "granted"

  ) {

    new Notification(
      "Sound in See",
      {
        body: texto
      }
    );
  }
}

// ======================================
// VIBRACION
// ======================================

function vibracionEmergencia() {

  if (navigator.vibrate) {

    navigator.vibrate([
      1000,
      300,
      1000
    ]);
  }
}

// ======================================
// CAMBIAR INTERFAZ
// ======================================

function cambiarModoVisual(tipo) {

  document.body.className = "";

  if (tipo === "voz") {

    document.body.classList.add("voz");
  }

  else if (tipo === "animal") {

    document.body.classList.add("animal");
  }

  else if (tipo === "alerta") {

    document.body.classList.add("alerta");
  }

  else {

    document.body.classList.add("normal");
  }
}

// ======================================
// HISTORIAL
// ======================================

function agregarHistorial(texto) {

  if (

    texto === ultimoHistorial ||

    !historial

  ) {

    return;
  }

  ultimoHistorial = texto;

  const hora =
    new Date().toLocaleTimeString();

  historial.innerHTML += `

    <div class="historial-item">

      [${hora}] ${texto}

    </div>

  `;

  historial.scrollTop =
    historial.scrollHeight;
}

// ======================================
// ESTADO
// ======================================

function actualizarEstado(texto) {

  if (texto !== ultimoEstado) {

    estado.innerHTML = texto;

    ultimoEstado = texto;
  }
}

// ======================================
// DETECCION CASA
// ======================================

function detectarCasa(
  promedio,
  frecuenciasHumanas
) {

  if (promedio > 85) {

    cambiarModoVisual("alerta");

    actualizarEstado(
      "🚨 Posible alarma / Bebé llorando"
    );

    agregarHistorial(
      "🚨 Emergencia en casa"
    );

    vibracionEmergencia();

    enviarNotificacion(
      "🚨 Emergencia detectada"
    );

    return "alerta";
  }

  else if (

    promedio > 40 &&

    frecuenciasHumanas > 15

  ) {

    cambiarModoVisual("voz");

    actualizarEstado(
      "🗣️ Voz cercana detectada"
    );

    agregarHistorial(
      "🗣️ Voz detectada"
    );

    return "voz";
  }

  else {

    cambiarModoVisual("normal");

    actualizarEstado(
      "🏠 Escuchando entorno"
    );

    return "normal";
  }
}

// ======================================
// MICROFONO
// ======================================

async function iniciarMicrofono() {

  try {

    const stream =
      await navigator.mediaDevices.getUserMedia({

        audio: {

          echoCancellation: true,

          noiseSuppression: true,

          autoGainControl: true
        }
      });

    const audioContext =

      new (

        window.AudioContext ||

        window.webkitAudioContext

      )();

    await audioContext.resume();

    const source =
      audioContext.createMediaStreamSource(stream);

    const analyser =
      audioContext.createAnalyser();

    source.connect(analyser);

    analyser.fftSize = 512;

    const dataArray =
      new Uint8Array(
        analyser.frequencyBinCount
      );

    function analizarAudio() {

      analyser.getByteFrequencyData(dataArray);

      let promedio =
        dataArray.reduce(
          (a, b) => a + b
        ) / dataArray.length;

      let tipoDetectado = "normal";

      let frecuenciasHumanas = 0;

      for (let i = 20; i < 80; i++) {

        if (dataArray[i] > 50) {

          frecuenciasHumanas++;
        }
      }

      let frecuenciasAgudas = 0;

      for (let i = 120; i < 220; i++) {

        if (dataArray[i] > 40) {

          frecuenciasAgudas++;
        }
      }

      // ===============================
      // CASA
      // ===============================

      if (modoActual === "casa") {

        tipoDetectado =
          detectarCasa(
            promedio,
            frecuenciasHumanas
          );
      }

      // ===============================
      // CALLE
      // ===============================

      else if (modoActual === "calle") {

        if (promedio > 85) {

          tipoDetectado = "alerta";

          cambiarModoVisual("alerta");

          actualizarEstado(
            "🚗🚨 Claxon o sirena detectada"
          );

          agregarHistorial(
            "🚗🚨 Sirena o claxon"
          );

          vibracionEmergencia();
        }

        else if (

          promedio > 45 &&

          frecuenciasAgudas > 20 &&

          frecuenciasHumanas < 10

        ) {

          tipoDetectado = "animal";

          cambiarModoVisual("animal");

          actualizarEstado(
            "🐾 Posible animal detectado"
          );

          agregarHistorial(
            "🐾 Animal detectado"
          );
        }

        else {

          cambiarModoVisual("normal");

          actualizarEstado(
            "🚶 Escuchando calle"
          );
        }
      }

      // ===============================
      // ESCUELA
      // ===============================

      else if (modoActual === "escuela") {

        if (

          promedio > 35 &&

          frecuenciasHumanas > 10

        ) {

          tipoDetectado = "voz";

          cambiarModoVisual("voz");

          actualizarEstado(
            "🏫 Conversación detectada"
          );
        }

        else if (promedio > 90) {

          tipoDetectado = "alerta";

          cambiarModoVisual("alerta");

          actualizarEstado(
            "🚨 Alarma escolar detectada"
          );

          agregarHistorial(
            "🏫🚨 Alarma escolar"
          );

          vibracionEmergencia();
        }

        else {

          cambiarModoVisual("normal");

          actualizarEstado(
            "🏫 Escuchando aula"
          );
        }
      }

      // ===============================
      // NOCHE
      // ===============================

      else if (modoActual === "noche") {

        if (promedio > 70) {

          tipoDetectado = "alerta";

          cambiarModoVisual("alerta");

          actualizarEstado(
            "🌙🚨 Sonido sospechoso"
          );

          agregarHistorial(
            "🌙🚨 Sonido sospechoso"
          );

          vibracionEmergencia();
        }

        else {

          cambiarModoVisual("normal");

          actualizarEstado(
            "🌙 Ambiente tranquilo"
          );
        }
      }

      // ===============================
      // CONFIRMACION
      // ===============================

      if (

        tipoDetectado ===
        ultimoTipoDetectado

      ) {

        deteccionesConsecutivas++;
      }

      else {

        deteccionesConsecutivas = 1;
      }

      ultimoTipoDetectado =
        tipoDetectado;

      requestAnimationFrame(
        analizarAudio
      );
    }

    analizarAudio();
  }

  catch(error) {

    console.log(error);

    alert(
      "🚫 No se pudo acceder al micrófono"
    );
  }
}

// ======================================
// VOZ A TEXTO
// ======================================

const SpeechRecognition =

  window.SpeechRecognition ||

  window.webkitSpeechRecognition;

let recognition = null;

let escuchando = false;

let ultimoTextoDetectado = "";

let reiniciando = false;

// Compatibilidad

if (SpeechRecognition) {

  recognition =
    new SpeechRecognition();

  recognition.lang = navigator.language || "es-MX";

  recognition.maxAlternatives = 1;

  recognition.continuous =
    !esMovil;

  recognition.interimResults =
    !esMovil;
}

else {

  textoVoz.innerHTML =
    "❌ Tu navegador no soporta voz";
}

// ======================================
// RESULTADOS
// ======================================

if (recognition) {

  recognition.onresult = (event) => {

    let textoFinal = "";

    for (

      let i = event.resultIndex;

      i < event.results.length;

      i++

    ) {

      textoFinal +=
        event.results[i][0]
        .transcript + " ";
    }

    textoFinal =
      textoFinal.trim();

    if (!textoFinal) {

      return;
    }

    // Evitar repetidos

    if (
      textoFinal ===
      ultimoTextoDetectado
    ) {

      return;
    }

    ultimoTextoDetectado =
      textoFinal;

    // Mostrar texto detectado
    textoVoz.innerHTML =
      `✏️ ${textoFinal}`;

    // Cambiar interfaz
    cambiarModoVisual("voz");

    // SOLO registrar detección de voz
    agregarHistorial(
      "🗣️ Voz detectada"
    );

    console.log(
      "🎤 Texto:",
      textoFinal
    );
  };

  // ======================================
  // FINALIZA
  // ======================================

  recognition.onend = () => {

    console.log(
      "🎤 Reconocimiento finalizado"
    );

    if (

      escuchando &&

      !reiniciando

    ) {

      reiniciando = true;

      setTimeout(() => {

        try {

          recognition.start();
        }

        catch(error) {

          console.log(error);
        }

        reiniciando = false;

      }, esMovil ? 1500 : 500);
    }
  };

  // ======================================
  // ERRORES
  // ======================================

  recognition.onerror = (event) => {

    console.log(
      "🚨 Error voz:",
      event.error
    );

    if (
      event.error === "not-allowed"
    ) {

      alert(
        "🚫 Permiso de micrófono denegado"
      );
    }

    if (
      event.error === "audio-capture"
    ) {

      alert(
        "🎤 No se detectó micrófono"
      );
    }
  };
}

// ======================================
// INICIAR VOZ
// ======================================

function iniciarReconocimientoVoz() {

  if (!recognition) {

    return;
  }

  escuchando = true;

  console.log(
    "🎤 Reconocimiento iniciado"
  );

  try {

    recognition.start();
  }

  catch(error) {

    console.log(error);
  }
}

// ======================================
// BOTON INICIAR
// ======================================

btnStart.addEventListener(

  "click",

  async () => {

    estado.innerHTML =
      "🎤 Solicitando permisos...";

    btnStart.style.display =
      "none";

    actualizarEstado(
      "🎧 Sistema iniciado"
    );

    await iniciarMicrofono();

    iniciarReconocimientoVoz();
  }
);

// ======================================
// SERVICE WORKER
// ======================================

if ("serviceWorker" in navigator) {

  navigator.serviceWorker
    .register("sw.js")

    .then(() => {

      console.log(
        "Service Worker activo"
      );
    })

    .catch((error) => {

      console.log(
        "Error Service Worker:",
        error
      );
    });
}
