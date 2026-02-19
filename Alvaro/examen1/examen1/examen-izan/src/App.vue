<template>
  <v-app>
    <v-app-bar title="Examen M7" color="indigo">
      <router-link to="/" style="color:white; margin-right:15px;">Inicio</router-link>
    </v-app-bar>

    <v-main>
      <router-view></router-view>
    </v-main>

    <v-footer app color="grey-lighten-1">
      Examen Vue - 2025
    </v-footer>
  </v-app>
</template>