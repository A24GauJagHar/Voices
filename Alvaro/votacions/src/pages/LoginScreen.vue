<template>
  <v-container class="d-flex justify-center align-center" style="height: 100vh;">
    <v-card width="400">
      <v-card-title class="text-h5 text-center">Login</v-card-title>
      <v-card-text>
        <v-form ref="loginForm" v-model="valid">
          <v-text-field
            v-model="username"
            label="Usuari"
            required
          ></v-text-field>

          <v-text-field
            v-model="password"
            label="Contrasenya"
            type="password"
            required
          ></v-text-field>

          <v-btn class="mt-4" color="primary" block @click="submit">
            Login
          </v-btn>

          <v-alert v-if="error" type="error" class="mt-3" dense>
            Usuari o contrasenya incorrectes.
          </v-alert>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'

const username = ref('')
const password = ref('')
const valid = ref(false)
const loginForm = ref(null)
const error = ref(false)

const router = useRouter()
const appStore = useAppStore()

const submit = () => {
  error.value = false

  if (loginForm.value.validate()) {
    // Validació simple: usuari 'user' i contrasenya '123'
    if (username.value === 'user' && password.value === '123') {
      // Actualitzar l'estat de login a Pinia
      appStore.setLoginInfo({
        loggedIn: true,
        username: username.value,
        image: 'https://i.pravatar.cc/150?img=3' 
      })

      // Redirigir a /VotacionsScreen
      router.push('/votacionsScreen')
    } else {
      error.value = true
    }
  }
}
</script>

<style scoped>
.v-card {
  padding: 20px;
}
</style>
