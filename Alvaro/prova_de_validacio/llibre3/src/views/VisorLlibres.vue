<template>
  <v-container>
    <h1 class="text-center mb-6">Llibres disponibles</h1>

    <v-row>
      <v-col
        v-for="llibre in llibres" :key="llibre.id" cols="12" sm="6" md="4" lg="4">
        <TargetaLlibre :llibre="llibre" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getLibros } from "@/services/communicationManager.js";
import TargetaLlibre from "@/components/TargetaLlibre.vue";

const llibres = ref([]);

onMounted(async () => {
  llibres.value = await getLibros();
});
</script>
