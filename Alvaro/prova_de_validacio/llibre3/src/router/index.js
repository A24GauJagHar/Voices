import { createRouter, createWebHistory } from "vue-router";
import PortadaInicial from "@/views/PortadaInicial.vue";
import VisorLlibres from "@/views/VisorLlibres.vue";

const routes = [
  { path: "/", component: PortadaInicial },
  { path: "/llibres", component: VisorLlibres },
];

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});
