<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '../stores/users'

const userStore = useUserStore()

function formatTime(time: number) {
    const timeFormatted = computed(() => new Date(time * 1000).toISOString().slice(11, 19))
    return timeFormatted
}

</script>

<template>
  <div v-if="userStore.currentUser">
    <div v-if="userStore.currentUser.activity.length" class="table-container">
      <div v-for="activity in userStore.currentUser.activity" :key="activity.date">
        <article class="media">
          <figure class="media-left">
            <p class="image is-128x128">
              <img src="https://bulma.io/assets/images/placeholders/128x128.png" />
            </p>
          </figure>
          <div class="media-content">
            <div class="content">
              <p>
                <strong>{{ activity.type }}:</strong> <small>{{ activity.intensity }} Intensity</small> | <small>{{ formatTime(activity.timeElapsed) }}</small> | <small>{{ activity.date }}</small>
                <div v-if="activity.distance"><strong>Distance:</strong> {{ activity.distance }} miles</div>
                <div v-if="activity.weight"><strong>Weight:</strong> {{ activity.weight }} lbs</div>
                <div v-if="activity.notes"> {{ activity.notes}} </div>

              </p>
            </div>
            <nav class="level is-mobile">
              <div class="level-left">
                <a class="level-item">
                  <span class="icon is-small"><i class="fas fa-heart"></i></span>
                </a>
              </div>
            </nav>
          </div>
          <div class="media-right">
            <button class="delete"></button>
          </div>
        </article>
      </div>

    </div>
    <p v-else>You haven't recorded any activity yet.</p>
  </div>
</template>

<style scoped>
.media {
  margin-bottom: 1rem;
  box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1);
}
</style>
