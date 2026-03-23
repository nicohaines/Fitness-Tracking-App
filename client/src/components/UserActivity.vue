<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '../stores/users'
import type { Activity } from '../../types'

const userStore = useUserStore()

const sortedActivities = computed(() => {
  return userStore.displayProfileUser?.activity
    ? [...userStore.displayProfileUser.activity].sort((a, b) => b.id - a.id)
    : []
})

function formatTime(time: number) {
    const timeFormatted = computed(() => new Date(time * 1000).toISOString().slice(11, 19))
    return timeFormatted
}

</script>

<template>
  <div v-if="userStore.currentUser && userStore.displayProfileUser">
    <div v-if="sortedActivities.length" class="table-container">
      <div v-for="sortedActivity in sortedActivities" :key="sortedActivity.id">
        <article class="media">
          <figure class="media-left">
            <p class="image is-128x128">
              <img class ="is-rounded activity-image" src="https://bulma.io/assets/images/placeholders/128x128.png" />
            </p>
          </figure>
          <div class="media-content">
            <div class="content">
              <p>
                <strong>{{ sortedActivity.type }}:</strong> <small>{{ sortedActivity.intensity }} Intensity</small> | <small>{{ formatTime(sortedActivity.timeElapsed) }}</small> | <small>{{ sortedActivity.date }}</small>
                <div v-if="sortedActivity.distance"><strong>Distance:</strong> {{ sortedActivity.distance }} miles</div>
                <div v-if="sortedActivity.weight"><strong>Weight:</strong> {{ sortedActivity.weight }} lbs</div>
                <div v-if="sortedActivity.notes"> {{ sortedActivity.notes}} </div>

              </p>
            </div>
            
            <nav class="level is-mobile">
              <div class="level-left">
                <a class="level-item">
                  <span class="icon is-small heart"><i class="fas fa-heart" :class="{'red-heart': sortedActivity.reactions?.some((r) => r.userId === userStore.currentUser?.id)}"></i></span><span v-if="sortedActivity.reactions && sortedActivity.reactions.length > 0">&nbsp;{{ sortedActivity.reactions.length }}</span>
                </a>
              </div>
            </nav>
          </div>
          <div v-if="userStore.currentUser === userStore.displayProfileUser" class="media-right">
            <button class="delete" @click="userStore.deleteActivity(sortedActivity.id)"></button>
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
.activity-image {
  padding: .7rem;
}
.heart{
  color: #4a4a4a;
}
.red-heart {
  color: #ff3860;
}
</style>
