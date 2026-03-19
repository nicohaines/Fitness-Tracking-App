<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
import LoginScreen from './components/LoginScreen.vue';
</script>

<template>
  <NavBar />
  <LoginScreen />
  <div class="container card">
    <RouterView />
  </div>
  
</template>

<style scoped></style>
