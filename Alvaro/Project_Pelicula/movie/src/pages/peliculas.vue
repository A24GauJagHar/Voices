<template>
  <!-- Barra de cerca -->
  <div class="search-bar">
    <v-text-field v-model="textCerca" label="Cerca pel·lícules" class="search-input" />
    <v-btn class="search-btn" @click="enviarPeticio">Cercar</v-btn>
  </div>

  <!-- Llista de pel·lícules -->
  <v-row>
    <v-col
      cols="3"
      v-for="actual in pelicules"
      :key="actual.imdbID"
      class="d-flex justify-center"
    >
      <v-card class="movie-card" max-width="200">
        <v-img
          :src="actual.Poster"
          cover
          aspect-ratio="2/3"
        ></v-img>
        <v-card-title>{{ actual.Title }}</v-card-title>
        <v-card-subtitle>{{ actual.Year }}</v-card-subtitle>
        <v-card-actions>
          <v-btn
            class="info-btn"
            text
            @click="mostrarMesInfo(actual.imdbID)"
          >
            Més Informació
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>

  <!-- Diàleg per mostrar la informació detallada -->
  <v-dialog v-model="dialog" max-width="600px">
    <v-card class="dialog-card">
      <v-card-title>{{ infoDetallada?.Title }}</v-card-title>
      <v-card-text>
        <v-img
          v-if="infoDetallada?.Poster && infoDetallada.Poster !== 'N/A'"
          :src="infoDetallada.Poster"
          max-height="300"
          cover
        ></v-img>
        <p><strong>Any:</strong> {{ infoDetallada?.Year }}</p>
        <p><strong>Director:</strong> {{ infoDetallada?.Director }}</p>
        <p><strong>Actors:</strong> {{ infoDetallada?.Actors }}</p>
        <p><strong>Sinopsi:</strong> {{ infoDetallada?.Plot }}</p>
      </v-card-text>
      <v-card-actions>
        <v-btn class="close-btn" text @click="dialog = false">Tancar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue'

const textCerca = ref('')
const pelicules = ref([])
const infoDetallada = ref(null)
const dialog = ref(false)

const API_KEY = '19f8a30e'
const BASE_URL = 'https://www.omdbapi.com/'

async function enviarPeticio() {
  const data = await searchMovies(textCerca.value)
  if (data.Response === 'True') {
    pelicules.value = data.Search
  } else {
    pelicules.value = []
    alert(data.Error)
  }
}

async function mostrarMesInfo(id) {
  infoDetallada.value = await getMovieDetails(id)
  dialog.value = true
}

async function searchMovies(searchTerm) {
  const response = await fetch(`${BASE_URL}?s=${searchTerm}&apikey=${API_KEY}`)
  return response.json()
}

async function getMovieDetails(movieId) {
  const response = await fetch(`${BASE_URL}?i=${movieId}&plot=full&apikey=${API_KEY}`)
  return response.json()
}
</script>

<style scoped>
/* ===== GLOBAL LAYOUT ===== */
body, #app, .v-application {
  background-color: #e0f7fa !important; /* Soft sky-blue background */
  color: #222 !important;
}

/* ===== SEARCH BAR ===== */
.search-bar {
  display: flex;
  gap: 10px;
  margin: 20px auto 30px auto;
  max-width: 700px;
  padding: 10px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.2); /* Sky-blue shadow */
}
.search-input {
  flex: 1;
  background-color: #f0f9ff; /* Light sky-blue input */
  border-radius: 8px;
  padding: 5px;
  font-size: 1rem;
  color: #000;
}
.search-btn {
  background-color: #29b6f6 !important; /* Sky-blue button */
  color: white !important;
  border-radius: 8px;
  padding: 8px 18px;
  text-transform: uppercase;
  font-weight: 600;
  transition: 0.2s;
}
.search-btn:hover {
  background-color: #0288d1 !important; /* Darker sky-blue hover */
}

/* ===== MOVIE CARDS GRID ===== */
.movie-card {
  border-radius: 16px !important;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(0, 123, 255, 0.1); /* Sky-blue shadow */
  transition: 0.25s ease;
}
.movie-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 10px 24px rgba(0, 123, 255, 0.2);
}

.v-card-title {
  font-size: 1rem;
  font-weight: 700;
  color: #01579b; /* Dark sky-blue title */
  text-align: center;
}
.v-card-subtitle {
  font-size: 0.85rem;
  color: #0288d1; /* Medium sky-blue subtitle */
  text-align: center;
}

.info-btn {
  color: #29b6f6 !important; /* Sky-blue button */
  font-weight: bold;
  transition: 0.2s;
}
.info-btn:hover {
  color: #0277bd !important; /* Darker hover */
}

/* ===== DIALOG ===== */
.dialog-card {
  border-radius: 20px !important;
  padding: 20px;
  background: #ffffff;
  box-shadow: 0 6px 25px rgba(0, 123, 255, 0.25); /* Sky-blue shadow */
}
.dialog-card p {
  font-size: 1rem;
  color: #01579b; /* Darker sky-blue text */
}
.close-btn {
  color: #29b6f6 !important;
  font-weight: bold;
}
.close-btn:hover {
  color: #0288d1 !important;
}
</style>
