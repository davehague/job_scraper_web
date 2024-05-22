<!-- components/JobCard.vue -->
<template>
  <div :class="['job-card', { 'older-job': isOlder }]">
    <h2>{{ job.title }} ({{ job.score }})</h2>
    <div class="company">
      <span>{{ job.company }}</span>&nbsp;<span v-if="job.location">({{ job.location }})</span>
    </div>
    <div v-if="job.date_posted">Posted on {{ job.date_posted }} on {{  job.job_site }}</div>
    <div v-else-if="job.date_pulled">Pulled on {{ job.date_pulled }} from {{  job.job_site }}</div>
    <div v-if="job.comp_interval">${{ round(job.comp_min! / 1000) }}k to ${{ round(job.comp_max! / 1000) }}k</div>
    <h4>Summary</h4>
    <div v-html="renderMarkdown(job.short_summary)"></div>
    <h4>Requirements</h4>
    <div v-html="renderMarkdown(job.hard_requirements)"></div>
    <a :href="job.url" @click="openInBrowser">View Job</a>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { type Job } from '~/types/job'
import { marked } from 'marked'

export default defineComponent({
  props: {
    job: {
      type: Object as PropType<Job>,
      required: true
    }
  },
  computed: {
    truncatedDescription(): string {
      return this.truncate(this.job.description, 200)
    },
    isOlder(): boolean {
      const todayDate = new Date().toISOString().split('T')[0]
      return this.job.date_posted < todayDate || this.job.date_pulled < todayDate
    },
  },
  methods: {
    renderMarkdown(text: string) {
      return marked(text)
    },
    truncate(text: string, length: number) {
      if (text.length > length) {
        return text.substring(0, length) + '...'
      }
      return text
    },
    round(value: number): number {
      return Math.round(value)
    },
    openInBrowser(event: MouseEvent) {
      event.preventDefault();
      const url = (event.target as HTMLAnchorElement)?.href;
      window.open(url, '_blank');
    }
  },

})
</script>

<style scoped>
.company
{
  font-size: 1.2em;
  color: #666;
}

.job-card {
  border: 1px solid #ccc;
  padding: 24px;
  margin: 24px;
  border-radius: 8px;
  width: calc(33% - 48px);
  box-sizing: border-box;
  overflow: hidden;
  width: 100%;
}

.job-card.older-job {
  background-color: #efefef; 
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

.job-card div {
  margin: 0 0 16px;
  line-height: 1.5;
  white-space: normal;
}

.job-card a {
  color: #007bff;
  text-decoration: none;
}

.job-card a:hover {
  text-decoration: underline;
}
</style>
