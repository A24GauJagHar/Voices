# Voices
# Voice Commander (Electron + Vue 3)

Exemple pràctic d’una **aplicació Electron** amb **Vue 3 i Vuetify** que utilitza la **Web Speech API** per controlar la interfície mitjançant ordres de veu en català.

Aquest projecte és una **prova de concepte guiada**, pensada per entendre:
- Com donar permisos de micròfon a Electron
- Com encapsular la lògica de reconeixement de veu amb un *composable*
- Com reaccionar a comandes de veu des de la interfície

---

## Funcionalitats

- Accés automàtic al micròfon en Electron
- Reconeixement de veu amb la Web Speech API (Chromium)
- Visualització del text detectat en temps real (*interim results*)
- Processament de comandes de veu simples
- Interfície amb Vuetify

---

## Tecnologies utilitzades

- **Electron**
- **Vue 3 (Composition API)**
- **Vuetify**
- **Web Speech API (SpeechRecognition)**

> La Web Speech API només funciona correctament en entorns basats en **Chromium** (Electron sí).

---

## Estructura rellevant del projecte

```text
src/
  background.js / main.js        
  composables/
       useSpeechRecognition.js   
  components/
       VoiceCommander.vue        