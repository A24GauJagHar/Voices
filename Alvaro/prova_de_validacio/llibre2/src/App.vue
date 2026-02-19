<template>
 <v-app>
    <v-app-bar title="Application bar">
      <v-btn
        v-for="link in links"
        :key="link.title"
        :text="link.title"
        :to="link.route"
        variant="text"
      ></v-btn>
    </v-app-bar>
    <v-navigation-drawer>
     <v-list nav>
       <v-list-item title="Buscador de Llibres" to="/cerca"></v-list-item>
       </v-list>
     </v-navigation-drawer>
   <v-main>
     <router-view />
   </v-main>
 </v-app>
</template>


<script setup >
const links = [
  { title: 'Portada', route: '/PortadaInicial' },
  { title: 'Cerca', route: '/cerca' },
];
</script>
