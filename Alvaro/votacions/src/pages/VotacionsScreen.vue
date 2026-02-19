<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>

  <v-row class="mt-4" justify="center" align="center" dense>
    <v-col cols="auto" v-for="(label, index) in chartData.labels" :key="index">
      <v-btn
        :color="buttonColors[index]"
        large
        class="vote-btn"
        @click="sendVote(index)"
        elevation="2"
      >
        <v-icon left>{{ buttonIcons[index] }}</v-icon>
        {{ label }}
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import Chart from 'chart.js/auto'
import { VBtn, VRow, VCol, VIcon } from 'vuetify/components'

const store = useAppStore()
const chartCanvas = ref(null)
let chartInstance = null

onMounted(() => {
  // Conectamos el WebSocket desde el store (instancia única)
  store.connectWebSocket()

  if (chartCanvas.value) {
    const ctx = chartCanvas.value.getContext('2d')
    chartInstance = new Chart(ctx, {
      type: 'bar',
      data: chartData.value,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
      },
    })
  }
})

onBeforeUnmount(() => {
  // Opcional: desconectar WebSocket al desmontar el componente
  // store.disconnectWebSocket()
})

// Datos del gráfico
const chartData = ref({
  labels: ['Opció 1', 'Opció 2', 'Opció 3', 'Opció 4'],
  datasets: [{
    label: 'Vots',
    data: store.votos,
    backgroundColor: [
      'rgba(102, 51, 153, 0.6)',   
      'rgba(255, 153, 51, 0.6)',   
      'rgba(0, 204, 102, 0.6)',    
      'rgba(255, 51, 102, 0.6)'    
    ],
  }],
})

// Iconos y colores para los botones
const buttonIcons = ['mdi-thumb-up', 'mdi-thumb-up', 'mdi-thumb-up', 'mdi-thumb-up']
const buttonColors = ['green', 'red', 'blue', 'orange']

// Watcher para actualizar el gráfico automáticamente
watch(
  () => store.votos,
  (newVotos) => {
    if (chartInstance) {
      chartInstance.data.datasets[0].data = [...newVotos]
      chartInstance.update()
    }
  },
  { deep: true }
)

// Función para votar
const sendVote = (index) => {
  store.sendVote(index)
}
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 50vh;
  width: 90vw;
  max-width: 800px;
  margin: 20px auto;
}

.vote-btn {
  min-width: 120px;
  font-weight: bold;
  transition: transform 0.1s ease;
}

.vote-btn:active {
  transform: scale(0.95);
}
</style>