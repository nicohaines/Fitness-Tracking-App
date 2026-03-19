<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
import LoginScreen from './components/LoginScreen.vue';
import AddWorkout from './components/AddWorkout.vue';
</script>

<template>
  <NavBar />
  <LoginScreen />
  <AddWorkout />
  <div class="container card">
    <RouterView />
  </div>
  
</template>

<style scoped></style>
