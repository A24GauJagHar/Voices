import { ref } from 'vue';

export function useSpeechRecognition() {
  const isListening = ref(false);
  const transcript = ref('');
  const interimTranscript = ref(''); // Per veure el text mentre es parla
  const error = ref(null);
  
  // API del navegador (Chromium/Electron)
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!Recognition) {
    error.value = "API no suportada en aquest navegador/entorn.";
    return { isListening, transcript, interimTranscript, error, start: () => {}, stop: () => {} };
  }

  const recognition = new Recognition();
  recognition.lang = 'ca-ES'; 
  recognition.continuous = false; // S'atura després d'una frase
  recognition.interimResults = true; // IMPORTANT: Permet veure resultats parcials

  // --- Handlers d'Esdeveniments i Debug ---

  recognition.onstart = () => {
    isListening.value = true;
    error.value = null;
    interimTranscript.value = '';
    console.log("🎤 Micròfon obert. Comença a parlar...");
  };

  // Depuració de hardware
  recognition.onaudiostart = () => console.log("🔊 Àudio detectat (hardware actiu)");
  recognition.onsoundstart = () => console.log("🔔 So detectat (soroll ambient o veu)");
  
  recognition.onend = () => {
    isListening.value = false;
    console.log("🛑 Escolta finalitzada.");
  };

  recognition.onerror = (event) => {
    isListening.value = false;
    console.error("❌ Error Speech API:", event.error);
    error.value = event.error;
    
    if (event.error === 'no-speech') {
        console.warn("⚠️ Consell: Parla més fort o revisa la configuració del micròfon a l'OS.");
    }
  };

  recognition.onresult = (event) => {
    let finalChunk = '';
    let interimChunk = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalChunk += event.results[i][0].transcript;
        console.log("✅ Final:", finalChunk);
      } else {
        interimChunk += event.results[i][0].transcript;
        // console.log("⏳ Intermig:", interimChunk); 
      }
    }

    if (finalChunk) transcript.value = finalChunk;
    interimTranscript.value = interimChunk; 
  };

  const start = () => recognition.start();
  const stop = () => recognition.stop();

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    start,
    stop
  };
}