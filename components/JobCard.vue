<!-- components/JobCard.vue -->
<template>
  <div class="job-card">
    <h2>{{ job.title }}</h2>
    <h3>{{ job.company }}</h3>
    <p>{{ truncate(job.short_summary, 200) }}</p>
    <p>{{ truncate(job.hard_requirements, 200) }}</p>
    <p>{{ truncate(job.description, 200) }}</p>
    <a :href="job.url" target="_blank">View Job</a>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  props: {
    job: {
      type: Object as PropType<any>,
      required: true
    }
  },
  methods: {
    truncate(text: string, length: number) {
      return text.length > length ? text.substring(0, length) + '...' : text
    }
  }
})
</script>

<style scoped>
.job-card {
  border: 1px solid #ccc;
  padding: 24px;
  margin: 24px;
  border-radius: 8px;
  width: calc(33% - 48px); /* Adjust width to fit three cards in a row with some margin */
  box-sizing: border-box;
  overflow: hidden;
}

.job-card h2 {
  margin: 0 0 16px;
  font-size: 1.5em;
}

.job-card h3 {
  margin: 0 0 16px;
  color: #666;
  font-size: 1.2em;
}

.job-card p {
  margin: 0 0 16px;
  line-height: 1.5;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: normal; /* Wrap text */
  display: -webkit-box;
  -webkit-line-clamp: 6; /* Adjust to show up to 6 lines */
  -webkit-box-orient: vertical;
}

.job-card a {
  color: #007bff;
  text-decoration: none;
}

.job-card a:hover {
  text-decoration: underline;
}
</style>
