<template>
  <v-container>
    <v-btn color="primary" class="mb-5" @click="buscar">
      Donam de menjar!!
    </v-btn>

    <v-row>
      <v-col cols="12" md="6">
        <v-card v-if="plato">
          <v-img :src="plato.strMealThumb" height="200" cover></v-img>
          <v-card-title>{{ plato.strMeal }}</v-card-title>
          <v-card-text>
            Categoría: {{ plato.strCategory }} <br>
            País: {{ plato.strArea }}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { getComida } from './communicationManager.js';

const plato = ref(null);

async function buscar() {
  plato.value = await getComida();
}
</script>