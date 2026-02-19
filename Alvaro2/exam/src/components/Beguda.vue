<template>
  <v-card class="mx-auto" max-width="344">
    <v-img :src="info.strDrinkThumb" height="200px" cover></v-img>
    <v-card-title>
      {{ info.strDrink }}
    </v-card-title>
  </v-card>
</template>

<script setup>
defineProps(['info'])
</script>