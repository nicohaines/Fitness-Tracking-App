<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const isActive = ref(false)
</script>

<template>
  <nav class="navbar is-dark" role="navigation" aria-label="main navigation">
    <div class="container">
      <div class="navbar-brand">
        <a class="navbar-item" href="https://bulma.io">
          <img alt="Vue logo" src="@/assets/logo.svg" width="30" height="30" />
        </a>

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
          <RouterLink to="/" active-class="is-active" class="navbar-item"> Home </RouterLink>
          <RouterLink to="/activity" active-class="is-active" class="navbar-item"> Activity </RouterLink>
          <RouterLink to="/friends" active-class="is-active" class="navbar-item"> Friends </RouterLink>
          
            <div class="navbar-item has-dropdown is-hoverable">
                <RouterLink to="/profile" active-class="is-active" class="navbar-link has-text-primary-100" href="https://bulma.io/documentation/overview/start/"> Account </RouterLink>
                <div class="navbar-dropdown is-boxed">
                    <RouterLink to="/profile" active-class="is-active" class="navbar-item"> Profile </RouterLink>
                    <RouterLink to="/account-settings" active-class="is-active" class="navbar-item"> Settings </RouterLink>
                    <hr class="navbar-divider">
                    <RouterLink to="/admin" active-class="is-active" class="navbar-item "> Admin Panel </RouterLink>
                </div>
            </div>
        </div>

        <div class="navbar-end">
          <div class="navbar-item">
            <div class="buttons">
              <RouterLink to="/login" class="button is-primary">
                <strong>Log in</strong>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped></style>
