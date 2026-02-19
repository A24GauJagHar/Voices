
<template>
  <v-container class="pa-6" max-width="700px">
    <v-card class="pa-6" rounded="xl" elevation="6">
      <v-card-title class="text-h6">Formulario de Alumno</v-card-title>

      <v-form ref="formRef" v-model="valid">
        <!-- Campos numéricos -->
        <v-text-field
          v-for="(c, i) in campos"
          :key="i"
          v-model.number="form[c.model]"
          :label="c.label"
          type="number"
          :suffix="c.suffix || ''"
          :rules="c.rules"
          :prepend-icon="c.icon"
        />

        <!-- Frase alumno -->
        <v-textarea
          v-model="form.frase"
          label="Frase del alumno"
          auto-grow
          :rules="[rules.required]"
          prepend-icon="mdi-text"
        />

        <!-- Botones -->
        <v-card-actions class="mt-4">
          <v-btn color="primary" @click="entrenar">Entrenar</v-btn>
          <v-btn color="success" @click="predir">Predecir</v-btn>
          <v-btn color="secondary" @click="guardarModel">Guardar modelo</v-btn>
          <v-btn color="info" @click="cargarModel">Cargar modelo</v-btn>
        </v-card-actions>
      </v-form>

      <!-- Resultados -->
      <v-divider class="my-4"></v-divider>
      <v-card-subtitle>Resultados:</v-card-subtitle>
      <v-card-text>
        <p><strong>Nota prevista:</strong> {{ resultados.nota }}</p>
        <p><strong>Actitud:</strong> {{ resultados.actitud }}</p>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";

// WebSocket
const ws = ref(null)

// Resultados en pantalla
const resultados = ref({ nota: "-", actitud: "-" });

onMounted(() => {
  ws.value = new WebSocket("ws://localhost:3000");

  ws.value.onopen = () => {
    console.log('WebSocket abierto ✅');
  }

  ws.value.onmessage = (event) => {
    console.log('Mensaje recibido:', event.data)
    try {
      const data = JSON.parse(event.data);

      // Si el mensaje es de predicción, actualizamos resultados
      if (data.type === "prediction") {
        resultados.value.nota = data.nota;
        resultados.value.actitud = data.actitud;
      }

      // Opcional: mensajes de entrenar, guardar o cargar
      if (data.type === "trained" || data.type === "saved" || data.type === "loaded") {
        alert(data.message);
      }

    } catch (err) {
      console.error("Error parseando mensaje:", err);
    }
  }

  ws.value.onerror = (err) => { 
    console.error('Error WebSocket:', err)
  }

  ws.value.onclose = () => {
    console.log('WebSocket cerrado ❌') 
  }
})

// Formulario y validación
const form = ref({
  faltes: null,
  retards: null,
  enTermini: null,
  foraTermini: null,
  frase: "",
  nota: null,
  actitud: 1, // opcional, para entrenamiento
});

const valid = ref(false);

const rules = {
  required: (v) => !!v || "Obligatorio",
  percent: (v) => (v >= 0 && v <= 100) || "0–100",
  note: (v) => (v >= 0 && v <= 10) || "0–10",
};

const campos = [
  { model: "faltes", label: "Promedio de faltas", icon: "mdi-alert-circle-outline", rules: [rules.required] },
  { model: "retards", label: "Promedio de retardos (min)", icon: "mdi-clock-outline", rules: [rules.required] },
  { model: "enTermini", label: "% actividades a tiempo", icon: "mdi-check-circle-outline", suffix: "%", rules: [rules.required, rules.percent] },
  { model: "foraTermini", label: "% actividades tarde", icon: "mdi-close-circle-outline", suffix: "%", rules: [rules.required, rules.percent] },
  { model: "nota", label: "Nota obtenida (solo entrenamiento)", icon: "mdi-star-outline", rules: [rules.required, rules.note] },
];

// -------------------- Funciones --------------------
const entrenar = () => {
  if (valid.value) {
    ws.value.send(JSON.stringify({ type: "train", payload: form.value }));
  } else {
    alert("Por favor, completa todos los campos correctamente antes de entrenar.");
  }
};

const predir = () =>{
  ws.value.send(JSON.stringify({ type: "predict", payload: form.value }));
} 

const guardarModel = () => {
  ws.value.send(JSON.stringify({ type: "save" }));
} 

const cargarModel = () => {
  ws.value.send(JSON.stringify({ type: "load" }));
}
</script>
