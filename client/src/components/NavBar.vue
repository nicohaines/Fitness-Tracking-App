<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/users'

const isActive = ref(false)
const userStore = useUserStore()
const router = useRouter()

function handleLogout() {
  userStore.logout()}
</script>

<template>
  <nav class="navbar is-dark" role="navigation" aria-label="main navigation">
    <div class="container">
      <div class="navbar-brand">
        <RouterLink to="/" active-class="is-active" class="navbar-item">
          <img alt="Vue logo" src="@/assets/logo.svg" width="30" height="30" />
        </RouterLink>

        <a
          role="button"
          class="navbar-burger"
          aria-label="menu"
          aria-expanded="false"
          @click="isActive = !isActive" :class="{ 'is-active': isActive }"
          data-target="navbarBasicExample"
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div id="navbarBasicExample" class="navbar-menu" :class="{ 'is-active': isActive }">
        <div class="navbar-start">
          <RouterLink to="/" active-class="is-active" class="navbar-item"> Activity </RouterLink>
          <!-- <a class="navbar-item" @click="userStore.newWorkoutActive = !userStore.newWorkoutActive">+Workout</a> -->
          <RouterLink to="/friends" active-class="is-active" class="navbar-item"> Friends </RouterLink>
          <div class="navbar-item" v-if="userStore.currentUser">
            <div class="buttons">
              <a class="button is-link" @click="userStore.newWorkoutActive = !userStore.newWorkoutActive">
                <i class="fa-solid fa-circle-plus"></i><strong>New Workout</strong>
              </a>
            </div>
          </div>
          
            
        </div>

        <div class="navbar-end">
          <div class="navbar-item has-dropdown is-hoverable" :class="{ 'is-hidden': !userStore.currentUser }">
                <RouterLink to="/profile" active-class="is-active" class="navbar-link has-text-primary-100" href="https://bulma.io/documentation/overview/start/"> Account </RouterLink>
                <div class="navbar-dropdown is-boxed">
                    <RouterLink to="/profile" active-class="is-active" class="navbar-item"> Profile </RouterLink>
                    <a class="navbar-item" @click="handleLogout"> Log out </a>
                    <hr v-if="userStore.currentUser?.administrator" class="navbar-divider">
                    <RouterLink v-if="userStore.currentUser?.administrator" to="/admin" active-class="is-active" class="navbar-item "> Admin Panel </RouterLink>
                </div>
            </div>
          <div class="navbar-item" v-if="!userStore.currentUser">
            <div class="buttons">
              <a class="button is-link" @click="userStore.loginActive = !userStore.loginActive">
                <strong>Log in</strong>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped></style>
