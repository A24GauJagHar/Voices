<template>
  <div>
    <h1>My Favorites</h1>
    <div v-if="store.favoritesList.length === 0">No favorites yet.</div>
    <ul>
      <li v-for="fav in store.favoritesList" :key="fav.idDrink">
        {{ fav.strDrink }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useFavoritesStore } from '../stores/favorites'
const store = useFavoritesStore()
</script>
