<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>Aplicació de Llibres</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn to="/" variant="text">Portada</v-btn>
      <v-btn to="/llibres" variant="text">Llibres</v-btn>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>

    <v-footer app color="grey-lighten-3" class="justify-center py-3">
      © 2025 — Harsh
    </v-footer>
  </v-app>
</template>

<script setup>
</script>
