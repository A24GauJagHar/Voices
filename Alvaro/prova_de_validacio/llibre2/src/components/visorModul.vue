<template>
  <v-card class="ma-4">
    <v-img :src="llibre.imatge" height="180"></v-img>

    <v-card-title>{{ llibre.titol }}</v-card-title>

    <v-card-text>
      {{ llibre.descripcio }}
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  llibre: Object,
});
</script>
