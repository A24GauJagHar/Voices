<template>
  <div>
    <h1>Find Drinks</h1>
    <input v-model="searchQuery" placeholder="Search a drink..." @input="fetchDrinks" />
    
    <div v-for="drink in drinks" :key="drink.idDrink">
      <drink-card :drink="drink" @add="store.addFavorite" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DrinkCard from '../components/DrinkCard.vue'
import { useFavoritesStore } from '../stores/favorites'

const store = useFavoritesStore()
const drinks = ref([])
const searchQuery = ref('')

const fetchDrinks = async () => {
  if (searchQuery.value.length < 3) return
  const res = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${searchQuery.value}`)
  const data = await res.json()
  drinks.value = data.drinks || []
}
</script>
