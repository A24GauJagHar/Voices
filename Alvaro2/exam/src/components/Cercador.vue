<template>
  <div class="text-center">
    <v-btn-group color="primary" variant="outlined" class="mb-6">
      <v-btn v-for="lletra in ['A', 'B', 'C']" :key="lletra" @click="fetchByLetter(lletra)">
        Lletra {{ lletra }}
      </v-btn>
    </v-btn-group>

    <v-row v-if="drinks.length">
      <v-col v-for="drink in drinks" :key="drink.idDrink">
        <Beguda :info="drink" />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Beguda from './Beguda.vue'

const drinks = ref([])
const fetchByLetter = async (letter)=> {
  try {
    const res = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?f=${letter}`)
    const data = await res.json()
    drinks.value = data.drinks || []
  } catch (error) {
    console.error("Error fetching drinks:", error)
  }
}
</script>

