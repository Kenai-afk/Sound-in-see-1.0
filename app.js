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
// VARIABLES
// ======================================

let modoActual = "casa";
let ultimoHistorial = "";
let ultimoEstado = "";
let escuchando = false;
let recognition = null;
let bloqueandoHistorial = false;

// ======================================
// CAMBIO DE MODOS
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

if (
  "Notification" in window &&
  Notification.permission !== "granted"
) {

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
      500,
      200,
      500
    ]);
  }
}

// ======================================
// INTERFAZ
// ======================================

function cambiarModoVisual(tipo) {

  document.body.className = "";

  switch (tipo) {

    case "voz":

      document.body.classList.add("voz");

      break;

    case "animal":

      document.body.classList.add("animal");

      break;

    case "alerta":

      document.body.classList.add("alerta");

      break;

    default:

      document.body.classList.add("normal");
  }
}

// ======================================
// HISTORIAL
// ======================================

function agregarHistorial(texto) {

  if (
    !historial ||
    texto === ultimoHistorial ||
    bloqueandoHistorial
  ) {

    return;
  }

  bloqueandoHistorial = true;

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

  setTimeout(() => {

    bloqueandoHistorial = false;

  }, 2500);
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
      "🚨 Posible alarma o emergencia"
    );

    agregarHistorial(
      "🚨 Emergencia detectada"
    );

    vibracionEmergencia();

    enviarNotificacion(
      "🚨 Emergencia detectada"
    );

    return;
  }

  if (
    promedio > 35 &&
    frecuenciasHumanas > 10
  ) {

    cambiarModoVisual("voz");

    actualizarEstado(
      "🗣️ Voz detectada"
    );

    agregarHistorial(
      "🗣️ Voz detectada"
    );

    return;
  }

  cambiarModoVisual("normal");

  actualizarEstado(
    "🏠 Escuchando entorno"
  );
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

    const AudioContextClass =
      window.AudioContext ||
      window.webkitAudioContext;

    const audioContext =
      new AudioContextClass();

    if (audioContext.state === "suspended") {

      await audioContext.resume();
    }

    const source =
      audioContext.createMediaStreamSource(
        stream
      );

    const analyser =
      audioContext.createAnalyser();

    analyser.fftSize = 256;

    source.connect(analyser);

    const dataArray =
      new Uint8Array(
        analyser.frequencyBinCount
      );

    function analizarAudio() {

      analyser.getByteFrequencyData(
        dataArray
      );

      let promedio = 0;

      for (
        let i = 0;
        i < dataArray.length;
        i++
      ) {

        promedio += dataArray[i];
      }

      promedio =
        promedio / dataArray.length;

      let frecuenciasHumanas = 0;

      for (
        let i = 18;
        i < 85;
        i++
      ) {

        if (dataArray[i] > 40) {

          frecuenciasHumanas++;
        }
      }

      // ===============================
      // CASA
      // ===============================

      if (modoActual === "casa") {

        detectarCasa(
          promedio,
          frecuenciasHumanas
        );
      }

      // ===============================
      // CALLE
      // ===============================

      else if (modoActual === "calle") {

        if (promedio > 80) {

          cambiarModoVisual("alerta");

          actualizarEstado(
            "🚗🚨 Sirena o claxon"
          );

          agregarHistorial(
            "🚗🚨 Sirena detectada"
          );

          vibracionEmergencia();
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

          cambiarModoVisual("voz");

          actualizarEstado(
            "🏫 Conversación detectada"
          );

          agregarHistorial(
            "🏫 Conversación detectada"
          );
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

        if (promedio > 65) {

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

      requestAnimationFrame(
        analizarAudio
      );
    }

    analizarAudio();
  }

  catch (error) {

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

if (SpeechRecognition) {

  recognition =
    new SpeechRecognition();

  recognition.lang =
    navigator.language || "es-MX";

  recognition.maxAlternatives = 1;

  // ==================================
  // CONFIG PC
  // ==================================

  if (!esMovil) {

    recognition.continuous = true;

    recognition.interimResults = true;
  }

  // ==================================
  // CONFIG MOVIL
  // ==================================

  else {

    recognition.continuous = false;

    recognition.interimResults = false;
  }
}

else {

  textoVoz.innerHTML =
    "❌ Reconocimiento de voz no compatible";
}

// ======================================
// RESULTADOS VOZ
// ======================================

if (recognition) {

  recognition.onstart = () => {

    console.log(
      "🎤 Escuchando voz"
    );
  };

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

    textoVoz.innerHTML =
      `✏️ ${textoFinal}`;

    cambiarModoVisual("voz");

    console.log(
      "🎤 Texto:",
      textoFinal
    );
  };

  // ==================================
  // REINICIO AUTOMATICO
  // ==================================

  recognition.onend = () => {

    if (!escuchando) {

      return;
    }

    setTimeout(() => {

      try {

        recognition.start();
      }

      catch (error) {

        console.log(
          "Reinicio cancelado"
        );
      }

    }, esMovil ? 1800 : 250);
  };

  // ==================================
  // ERRORES
  // ==================================

  recognition.onerror = (event) => {

    console.log(
      "🚨 Error:",
      event.error
    );

    if (
      event.error === "no-speech" ||
      event.error === "aborted"
    ) {

      return;
    }

    if (
      event.error === "not-allowed"
    ) {

      alert(
        "🚫 Micrófono bloqueado"
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

  setTimeout(() => {

    try {

      recognition.start();
    }

    catch (error) {

      console.log(error);
    }

  }, esMovil ? 1200 : 100);
}

// ======================================
// BOTON INICIAR
// ======================================

btnStart.addEventListener(

  "click",

  async () => {

    btnStart.disabled = true;

    actualizarEstado(
      "🎤 Solicitando permisos..."
    );

    await iniciarMicrofono();

    iniciarReconocimientoVoz();

    actualizarEstado(
      "🎧 Sistema iniciado"
    );

    btnStart.style.display =
      "none";
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
        "✅ Service Worker activo"
      );
    })

    .catch((error) => {

      console.log(
        "❌ Error Service Worker:",
        error
      );
    });
}
