<script setup>
import { ref, watch } from 'vue';
import { useSpeechRecognition } from '@/composables/useSpeechRecognition';
import { useTheme } from 'vuetify';

const { isListening, transcript, interimTranscript, error, start } = useSpeechRecognition();
const theme = useTheme();

const uiMessage = ref("Prem el botó per començar...");
const statusColor = ref("primary");

const showSnackbar = ref(false);
const snackbarMessage = ref('');

watch(transcript, (newText) => {
  const command = newText.toLowerCase().trim();

  if (command.includes('hello')) {
    uiMessage.value = "Hola! Benvingut a l'aplicació.";
    statusColor.value = "success";
    alert("Hola!");
  }
  else if (command.includes('help')) {
    uiMessage.value = "Aquesta és una prova de concepte.";
    statusColor.value = "info";
  }
  else if (command.includes('esborra') || command.includes('borrar')) {
    uiMessage.value = "Prem el botó per començar...";
    statusColor.value = "primary";
  }
  else if (command.includes('dark')) {
    theme.global.name.value = 'dark';
    uiMessage.value = "Tema fosc activat.";
    statusColor.value = "primary";
  }
  else if (command.includes('light')) {
    theme.global.name.value = 'light';
    uiMessage.value = "Tema clar activat.";
    statusColor.value = "primary";
  }
  else if (newText) {
    uiMessage.value = `Comanda no reconeguda: "${newText}"`;
    statusColor.value = "warning";
    snackbarMessage.value = `Comanda no reconeguda: "${newText}"`;
    showSnackbar.value = true;
    setTimeout(() => showSnackbar.value = false, 3000);
  }
});
</script>

<template>
  <v-container class="d-flex justify-center align-center fill-height">
    <v-card width="400" :color="statusColor" variant="tonal">
      <v-card-item>
        <v-card-title class="text-h5 text-center">Control per Veu</v-card-title>
      </v-card-item>

      <v-card-text class="text-center py-4">
        <div class="mb-4">
          <v-icon 
            :icon="isListening ? 'mdi-microphone' : 'mdi-microphone-off'" 
            size="64"
            :class="{'text-red animate-pulse': isListening}"
          ></v-icon>
        </div>

        <p class="text-h6 font-weight-bold">{{ isListening ? 'Escoltant...' : 'En espera' }}</p>

        <p v-if="interimTranscript" class="text-caption text-grey">
          Detectant: {{ interimTranscript }}
        </p>

        <p class="mt-2 text-body-1">{{ uiMessage }}</p>

        <v-alert v-if="error" type="error" class="mt-3" density="compact">{{ error }}</v-alert>
      </v-card-text>

      <v-card-actions class="justify-center pb-4">
        <v-btn 
          variant="elevated" color="primary" size="large"
          @click="start" :disabled="isListening"
        >
          Escolta
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-snackbar v-model="showSnackbar" :timeout="3000" color="red" location="bottom">
      {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<style scoped>
.animate-pulse { animation: pulse 1.5s infinite; }
@keyframes pulse {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.1); }
  100% { opacity: 1; transform: scale(1); }
}
</style>
