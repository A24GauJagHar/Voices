<template>
  <v-card class="ma-4">
    <v-img :src="llibre.cover" height="180"></v-img>

    <v-card-title>{{ llibre.title }}</v-card-title>

    <v-card-text>
      {{ llibre.description}}
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  llibre: Object,
});
</script>
