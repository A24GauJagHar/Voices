<template>
   <v-row>
      <v-col cols="12" class="text-center">
        Este es el cercador
        <v-btn @click="cerca" color="primary" class="my-4">
          Dona'm de Llibers !!
        </v-btn>
      </v-col>
    </v-row>
    <v-row no-gutters justify="center">
      <v-col cols="12" sm="10" md="6" lg="4">
        <visorlliber v-if="resultat" :info="resultat"/>
      </v-col>
      </v-row>
    </template>


<script setup>
import { getLibros} from "@/services/communicationManager.js";
import visorlliber from "@/components/TargetaLlibre.vue";
import {ref} from "vue"
const resultat = ref ("")


async function cerca(){
    resultat.value = await getLibros();
}
</script>
