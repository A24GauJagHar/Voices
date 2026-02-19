<template>
  <div>
    <h3>{{ drink.strDrink }}</h3>
    <img :src="drink.strDrinkThumb" />
    <br />
    <button @click="$emit('add', drink)">Add to favorites</button>
  </div>
</template>

<script setup>
defineProps(['drink'])
defineEmits(['add'])
</script>
