<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
import LoginScreen from './components/LoginScreen.vue';
import AddWorkout from './components/AddWorkout.vue';
import ModifyUser from './components/ModifyUser.vue';
</script>

<template>
  <NavBar />
  <LoginScreen />
  <AddWorkout />
  <ModifyUser />
  <div class="container card">
    <RouterView />
  </div>
  
</template>

<style scoped></style>
