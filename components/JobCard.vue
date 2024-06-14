<!-- components/JobCard.vue -->
<template>
  <div :class="['job-card', { 'older-job': isOlder }]">
    <div class="title-and-score">
      <h2 class="title" @click="toggleCard">{{ job.title }}</h2>
      <div :title="'Overall Score: ' + job.overall_score
    + '\nDesire Score: ' + job.desire_score
    + '\nExperience Score: ' + job.experience_score
    + '\nMeets Requirements Score: ' + job.meets_requirements_score
    + '\nMeets Experience Score: ' + job.meets_experience_score
    + '\n\nGuidance: ' + job.guidance" class="score-circle"
        :style="{ backgroundColor: getScoreColor(job.overall_score) }">
        <span class="score-text">{{ job.overall_score }}</span>
      </div>
    </div>
    <div class="content-container" v-if="showContent">
      <div class="company">
        <span>{{ job.company }}</span>&nbsp;<span v-if="job.location">({{ job.location }})</span>
      </div>
      <div class="job-comp" v-if="job.comp_interval">${{ round(job.comp_min! / 1000) }}k to ${{ round(job.comp_max! /
    1000) }}k</div>

      <div class="job-source" v-if="job.date_posted">Posted on {{ job.date_posted }} on {{ job.job_site }}</div>
      <div class="job-source" v-else-if="job.date_pulled">Pulled on {{ job.date_pulled }} from {{ job.job_site }}</div>

      <!-- Summary -->
      <h4>Summary</h4>
      <div v-if="showFullSummary" v-html="renderMarkdown(job.short_summary)"></div>
      <div v-else v-html="renderMarkdown(truncate(job.short_summary, 300))"></div>
      <span class="link-like" @click="toggleSummary">{{ showFullSummary ? '[Show Less]' : '[Show More]' }}</span>

      <!-- Requirements -->
      <h4 class="expandable-section" @click="toggleRequirements">Requirements <span v-if="!showRequirements">[Show]</span><span
          v-else>[Hide]</span>
      </h4>
      <div v-if="showRequirements" v-html="renderMarkdown(job.hard_requirements)"></div>
    </div>

    <!-- Job link -->
    <a :href="job.url" @click="openInBrowser">View Job</a>

    <!-- Action buttons -->
    <div v-if="userLoggedIn" class="action-buttons">
      <button v-if="userAction !== false" @click="setUserInterest(userAction === true ? null : true)"
        class="button-primary">
        {{ userAction === true ? 'Saved' : 'Save' }}
      </button>
      <button v-if="userAction !== true" @click="setUserInterest(userAction === false ? null : false)"
        class="button-secondary">
        {{ userAction === false ? 'Discarded' : 'Discard' }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType, ref, onMounted, onUnmounted } from 'vue';
import { type Job } from '~/types/interfaces';
import { marked } from 'marked';
import PersistentDataService from '@/services/PersistentDataService';
import { useJsaStore } from '@/stores/jsaStore'
import '~/assets/buttons.css';

export default defineComponent({
  props: {
    job: {
      type: Object as PropType<Job>,
      required: true
    }
  },
  async setup({ job }) {
    const showRequirements = ref(false);
    const showFullSummary = ref(false);
    const showContent = ref(true);
    const userAction = ref<boolean | null>(null);
    const store = useJsaStore();
    const userLoggedIn = store.authUser !== null;

    const handleResize = () => {
      if (window.innerWidth > 768) {
        showContent.value = true;
      }
    };

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize);
    });

    onMounted(async () => {
      window.addEventListener('resize', handleResize);
      const result = await getUserInterest();
      if (result) {
        userAction.value = result.interested;
      }
    });

    const toggleCard = () => {
      if (window.innerWidth <= 768) {
        showContent.value = !showContent.value;
      }
    };

    const getScoreColor = (score: number) => {
      return score >= 85
        ? '#59C9A5' // Green
        : score > 75
          ? '#93c1b2' // Gray-Green
          : '#888' // Gray      
    }

    const toggleRequirements = () => {
      showRequirements.value = !showRequirements.value;
    };

    const toggleSummary = () => {
      showFullSummary.value = !showFullSummary.value;
    };

    const setUserInterest = async (interested: boolean | null) => {
      try {
        const uid = store.authUser?.id || '';
        if (!uid || uid === '') return;

        const result = await PersistentDataService.setUserInterest(uid, job.id, interested);
        userAction.value = interested;
        console.log("Interest set:", result);
      } catch (error) {
        console.error("Failed to set user interest:", error);
      }
    };

    const getUserInterest = async () => {
      try {
        const uid = store.authUser?.id || '';
        if (!uid || uid === '') return;

        const result = await PersistentDataService.getUserInterest(uid, job.id);

        return result;
      } catch (error) {
        console.error("Failed to get user interest:", error);
      }
    };

    return {
      showContent, toggleCard,
      showRequirements, toggleRequirements,
      showFullSummary, toggleSummary,
      userAction, setUserInterest,
      getScoreColor,
      userLoggedIn
    };
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
.job-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #fff;
  border: 1px solid #ccc;
  padding: 24px;
  box-sizing: border-box;
  overflow: hidden;
  box-shadow: 4px 4px 20px 0px rgba(0, 0, 0, 0.2);
  min-height: 640px;
  max-width: 500px;
}

.job-card.older-job {
  background-color: #F5F5F5;
}

@media (max-width: 768px) {
  .job-card h2 {
    cursor: pointer;
  }
}

.title-and-score {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
}

.title {
  margin-top: 10px;
  font-size: 24px;
  font-weight: 700;
  width: 80%;
}

.score-circle {
  align-items: center;
  background-color: #59C9A5;
  border-radius: 50%;
  color: #333;
  display: flex;
  font-weight: 700;
  font-size: 24px;
  height: 64px;
  width: 64px;
  justify-content: center;
  /* position: absolute; */
  transition: background-color 0.3s ease;
}

.score-circle::before {
  content: '';
  background-color: #FFF;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  position: absolute;
}

.score-circle .score-text {
  position: relative;
  z-index: 1;
}

.content-container {
  flex-grow: 1;
}

.company,
.job-comp {
  font-size: 20px;
  font-weight: 400;
  color: #040913;
}

.job-source {
  margin: 16px 0;
  font-size: 16px;
}

.job-card a {
  color: #007bff;
  text-decoration: none;
  margin: 10px 0;
}

.job-card a:hover {
  text-decoration: underline;
}

.job-card h4 {
  margin: 16px 0;
}

.job-card h4 span {
  font-weight: normal;
  font-size: 0.8em;
  color: #333;
  text-decoration: underline;
}

.link-like {
  margin-top: 0px;
  font-size: 0.8em;
  color: #333;
  cursor: pointer;
  text-decoration: underline;
}

.job-card .link-like:hover {
  text-decoration: none;
}

.expandable-section {
  cursor: pointer;
}

.job-card .action-buttons {
  display: flex;
  justify-content: space-between;
  margin: 10px 0 0 0;
  gap: 24px;
}

.job-card button {
  border-radius: 4px;
  padding: 4px 32px;
  height: 32px;
  font-weight: 400;
}

.save-button,
.discard-button {
  flex: 1;
  padding: 10px;
  font-size: 16px;
  border: none;
  cursor: pointer;

  border: 1px solid #ccc;
}



.job-card .icon-saved-active {
  color: red;
}

.job-card .icon-discarded-active {
  color: #000;
}
</style>
