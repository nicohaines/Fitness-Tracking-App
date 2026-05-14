<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { vIntersectionObserver } from '@vueuse/components'
import { useUserStore } from '../stores/users'
import { api } from '../services/myFetch'
import type { Activity, DataListEnvelope } from '../../types'

const loaded = ref<Activity[]>([])
const visibleCount = ref(5)
const pageSize = 5
const currentPage = ref(0)
const total = ref<number | null>(null)
const loading = ref(false)

async function onLoadMore() {
  if (loading.value) return
  if (visibleCount.value < loaded.value.length) {
    visibleCount.value += pageSize
    return
  }
  if (total.value !== null && loaded.value.length >= total.value) return
  const userId = userStore.displayProfileUser?.id
  if (!userId) return
  try {
    loading.value = true
    const next = currentPage.value + 1
    const data = await api<DataListEnvelope<Activity>>(`/users/${userId}/activities?page=${next}&pageSize=${pageSize}`)
    const items = data.data ?? []
    loaded.value = [...loaded.value, ...items]
    currentPage.value = next
    total.value = data.total ?? total.value
    visibleCount.value += pageSize
  } catch (err) {
  } finally {
    loading.value = false
  }
}

function canLoadMore() {
  return !loading.value && (visibleCount.value < loaded.value.length || total.value === null || loaded.value.length < total.value)
}

function onSentinelVisible(entries: IntersectionObserverEntry[]) {
  if (entries[0]?.isIntersecting && canLoadMore()) {
    void onLoadMore()
  }
}

const userStore = useUserStore()

async function loadFromServer(userId: number) {
  try {
    loading.value = true
    // load first page
    const data = await api<DataListEnvelope<Activity>>(`/users/${userId}/activities?page=1&pageSize=${pageSize}`)
    loaded.value = data.data ?? []
    currentPage.value = 1
    total.value = data.total ?? loaded.value.length
  } catch (err) {
    loaded.value = []
    currentPage.value = 0
    total.value = 0
  } finally {
    loading.value = false
  }
}

watch(
  () => userStore.displayProfileUser,
  (next) => {
    if (next && next.id) {
      visibleCount.value = pageSize
      total.value = null
      void loadFromServer(next.id)
    } else {
      loaded.value = []
      currentPage.value = 0
      total.value = null
    }
  },
  { immediate: true },
)

const sortedActivities = computed(() => {
  const list = [...loaded.value].sort((a, b) => {
    const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime()
    if (dateDiff !== 0) return dateDiff
    return b.id - a.id
  })
  return list.slice(0, visibleCount.value)
})

function formatTime(time: number) {
  return new Date(time * 1000).toISOString().slice(11, 19)
}

async function toggleReaction(activity: Activity) {
  if (!userStore.currentUser) return

  const hasReacted = activity.reactions?.some((r) => r.userId === userStore.currentUser?.id)
  if (hasReacted) {
    await userStore.removeReaction(userStore.currentUser.id, activity.id)
  } else {
    await userStore.addReaction(userStore.currentUser.id, activity.id)
  }
}

</script>

<template>
  <div v-if="userStore.currentUser && userStore.displayProfileUser">
    <div v-if="sortedActivities.length" class="table-container">
      <div>
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
                  <strong>{{ sortedActivity.type }}:</strong> <small>{{ sortedActivity.intensity.toUpperCase() }} Intensity</small> | <small>{{ formatTime(sortedActivity.timeElapsed) }}</small> | <small>{{ sortedActivity.date }}</small>
                  <div v-if="sortedActivity.distance"><strong>Distance:</strong> {{ sortedActivity.distance }} miles</div>
                  <div v-if="sortedActivity.weight"><strong>Weight:</strong> {{ sortedActivity.weight }} lbs</div>
                  <div v-if="sortedActivity.notes"> {{ sortedActivity.notes}} </div>

                </p>
              </div>
              
              <nav class="level is-mobile">
                <div class="level-left">
                  <a class="level-item" @click="toggleReaction(sortedActivity)">
                    <span class="icon is-small heart"><i class="fas fa-heart" :class="{'red-heart': sortedActivity.reactions?.some((r) => r.userId === userStore.currentUser?.id)}"></i></span>
                    <span v-if="sortedActivity.reactions && sortedActivity.reactions.length > 0">&nbsp;{{ sortedActivity.reactions.length }}</span>
                  </a>
                </div>
              </nav>
            </div>
            <div v-if="userStore.currentUser === userStore.displayProfileUser" class="media-right">
              <button class="delete" @click="userStore.deleteActivity(sortedActivity.id)"></button>
            </div>
          </article>
        </div>
        <div v-if="loading" v-for="n in pageSize" :key="`skeleton-${n}`">
          <article class="media">
            <figure class="media-left">
              <p class="image is-128x128 is-skeleton">
                <img class ="is-rounded activity-image" src="https://bulma.io/assets/images/placeholders/128x128.png" />
              </p>
            </figure>
            <div class="media-content">
              <div class="content">
                <p>
                  <strong class="is-skeleton">Activity:</strong>
                  <small class="is-skeleton">HIGH Intensity</small>
                  |
                  <small class="is-skeleton">00:00:00</small>
                  |
                  <small class="is-skeleton">0000-00-00</small>
                  <div class="is-skeleton"><strong>Distance:</strong> 0 miles</div>
                  <div class="is-skeleton"><strong>Weight:</strong> 0 lbs</div>
                  <div class="is-skeleton">Loading notes...</div>
                </p>
              </div>
            </div>
          </article>
        </div>
        <div
          v-if="canLoadMore()"
          v-intersection-observer="[onSentinelVisible, { rootMargin: '0px 0px 120px 0px', threshold: 0 }]"
        />
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
