console.log(tf);
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
// MODO ACTUAL
// ======================================

let modoActual = "casa";

// ======================================
// CONTROL INTELIGENTE
// ======================================

let deteccionesConsecutivas = 1;

let ultimoTipoDetectado = "";

let ultimoEvento = 0;

let ultimoHistorial = "";

let ultimoEstado = "";


// ======================================
// CAMBIAR MODOS
// ======================================

modoSelector.addEventListener("change", () => {

  modoActual = modoSelector.value;

  actualizarEstado( `
    ⚙️ Modo:
    ${modoActual.toUpperCase()}
  `);
});

// ======================================
// NOTIFICACIONES
// ======================================

Notification.requestPermission();

function enviarNotificacion(texto) {

  if (Notification.permission === "granted") {

    new Notification(
      "Sound Chameleon AI",
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
      1000, 
      300
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
// HISTORIAL INTELIGENTE
// ======================================

function agregarHistorial(texto) {

  // Evitar repetidos
  if (texto === ultimoHistorial) {

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

  // Auto scroll abajo
  historial.scrollTop =
    historial.scrollHeight;
}
function actualizarEstado(texto) {

  if (texto !== ultimoEstado) {

    estado.innerHTML = texto;

    ultimoEstado = texto;
  }
}

// ======================================
// MICROFONO
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

async function iniciarMicrofono() {

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

// Reanudar audio en celulares
await audioContext.resume();


  const source =
    audioContext.createMediaStreamSource(stream);

  const analyser =
    audioContext.createAnalyser();

  source.connect(analyser);

  analyser.fftSize = 512;

  const dataArray =
    new Uint8Array(analyser.frequencyBinCount);

  // ====================================
  // ANALIZAR AUDIO
  // ====================================

  function analizarAudio() {

    analyser.getByteFrequencyData(dataArray);

    // ==================================
    // VOLUMEN GENERAL
    // ==================================

    let promedio =
      dataArray.reduce((a, b) => a + b) /
      dataArray.length;
    
    let tipoDetectado = "normal";

    // ==================================
    // FRECUENCIAS HUMANAS
    // ==================================

    let frecuenciasHumanas = 0;

    for (let i = 20; i < 80; i++) {

      if (dataArray[i] > 50) {

        frecuenciasHumanas++;
      }
    }

    // ==================================
    // FRECUENCIAS AGUDAS (ANIMALES)
    // ==================================

    let frecuenciasAgudas = 0;

    for (let i = 120; i < 220; i++) {

      if (dataArray[i] > 40) {

       frecuenciasAgudas++;
      }
    }

    // ==================================
    // MODO CASA
    // ==================================

    if (modoActual === "casa") {

  tipoDetectado = detectarCasa(
    promedio,
    frecuenciasHumanas
  );
}

    // ==================================
    // MODO CALLE
    // ==================================

    else if (modoActual === "calle") {

      if (promedio > 85) {

        tipoDetectado = "alerta";

        cambiarModoVisual("alerta");

        actualizarEstado(
          "🚗🚨 Claxon o sirena detectada");

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
        "🐾 Posible animal detectado");

        agregarHistorial(
        "🐾 Animal detectado"
        );
      }
      else {

        tipoDetectado = "normal";

        cambiarModoVisual("normal");

        actualizarEstado(
          "🚶 Escuchando calle");
      }
    }

    // ==================================
    // MODO ESCUELA
    // ==================================

    else if (modoActual === "escuela") {

      if (
        promedio > 35 &&
        frecuenciasHumanas > 10
      ) {

        tipoDetectado = "voz";

        cambiarModoVisual("voz");

        actualizarEstado(
          "🏫 Conversación detectada");
      }

      else if (promedio > 90) {

        tipoDetectado = "alerta";

        cambiarModoVisual("alerta");

        actualizarEstado(
          "🚨 Alarma escolar detectada");

          agregarHistorial(
          "🏫🚨 Alarma escolar"
          );

        vibracionEmergencia();
      }

      else {

        tipoDetectado = "normal";

        cambiarModoVisual("normal");

        actualizarEstado(
          "🏫 Escuchando aula");
      }
    }

    // ==================================
    // MODO NOCHE
    // ==================================

    else if (modoActual === "noche") {

      if (promedio > 70) {
        
        tipoDetectado = "alerta";

        cambiarModoVisual("alerta");

        actualizarEstado(
          "🌙🚨 Sonido sospechoso");

          agregarHistorial(
          "🌙🚨 Sonido sospechoso"
          );

        vibracionEmergencia();
      }

      else {

        tipoDetectado = "normal";

        cambiarModoVisual("normal");

        actualizarEstado(
          "🌙 Ambiente tranquilo");
      }
    }

// ==================================
// CONFIRMACIÓN MÚLTIPLE
// ==================================

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

// Solo confirmar tras 3 detecciones
if (deteccionesConsecutivas >= 3) {

  console.log("Detección confirmada");

}
requestAnimationFrame(analizarAudio);
  }

  analizarAudio();
}

// ======================================
// VOZ A TEXTO

// COMPATIBILIDAD VOZ
// ======================================

const SpeechRecognition =

  window.SpeechRecognition ||

  window.webkitSpeechRecognition;

if (!SpeechRecognition) {

  alert(
    "Tu navegador no soporta reconocimiento de voz 😭"
  );
}

const recognition =
  new SpeechRecognition();

recognition.lang = "es-ES";

recognition.continuous = true;

recognition.interimResults = true;

recognition.maxAlternatives = 3;

let escuchando = false;

// ======================================
// RESULTADOS VOZ
// ======================================

recognition.onresult = (event) => {
  console.log(
  "🎤 Detectó voz",
  event
  );

  let textoFinal = "";

  for (

    let i = event.resultIndex;

    i < event.results.length;

    i++

  ) {

    textoFinal +=
      event.results[i][0].transcript + " ";
  }

  textoVoz.innerHTML =
    `✏️ ${textoFinal}`;

    alert(textoFinal);

  cambiarModoVisual("voz");
};

// ======================================
// REINICIO AUTOMÁTICO
// ======================================

recognition.onend = () => {

  if (escuchando) {

    setTimeout(() => {

      try {

        recognition.start();

      }

      catch(error) {

        console.log(error);
      }

    }, 500);
  }
};

// ======================================
// SI HAY ERROR
// ======================================

recognition.onerror = (event) => {

  alert(
  "Error reconocimiento: " +
  event.error
);

  console.log(
    "Error:",
    event.error
  );

  if (escuchando) {

    recognition.stop();

    setTimeout(() => {

      recognition.start();

    }, 1000);
  }
};

// ======================================
// INICIAR RECONOCIMIENTO
// ======================================

function iniciarReconocimientoVoz() {

  escuchando = true;

  console.log(
    "🎤 Reconocimiento iniciado"
  );

  recognition.start();
}

// ======================================
// BOTON INICIAR
// ======================================

btnStart.addEventListener(

  "click",

  async () => {
    
    estado.innerHTML =
  "🎤 Solicitando permisos...";   

    btnStart.style.display = "none";

    actualizarEstado(
      "🎧 Sistema iniciado");

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
