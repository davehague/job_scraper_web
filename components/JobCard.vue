<!-- components/JobCard.vue -->
<template>
  <div :class="['job-card', { 'older-job': isOlder }]">
    <div class="title-and-score">

      <h2 class="title" @click="toggleCard">{{ job.title }}</h2>

      <Tooltip :content="tooltipContent">
        <div class="score-circle" :style="{ backgroundColor: getScoreColor(job.overall_score) }">
          <span class="score-text">{{ job.overall_score }}</span>
        </div>
      </Tooltip>
    </div>
    <div class="content-container" v-if="showContent">
      <div class="company">
        <span>{{ job.company }}</span>&nbsp;<span v-if="job.location">({{ job.location }})</span>
      </div>
      <div class="job-comp" v-if="job.comp_interval">${{ round(job.comp_min! / 1000) }}k to ${{ round(job.comp_max! /
    1000) }}k</div>

      <div class="job-source">{{ jobRecencyText() }}</div>

      <!-- Summary -->
      <h4>Summary</h4>
      <div v-if="showFullSummary" v-html="renderMarkdown(job.short_summary)"></div>
      <div v-else v-html="renderMarkdown(truncate(job.short_summary, 300))"></div>
      <span class="link-like" @click="toggleSummary">{{ showFullSummary ? '[Show Less]' : '[Show More]' }}</span>

      <!-- Requirements -->
      <h4 class="expandable-section" @click="toggleRequirements">Requirements <span
          v-if="!showRequirements">[Show]</span><span v-else>[Hide]</span>
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

<script setup lang="ts">
import { ref, onMounted, onUnmounted, defineProps, defineEmits } from 'vue';
import type { PropType } from 'vue';
import type { Job } from '~/types/interfaces';
import { marked } from 'marked';
import PersistentDataService from '@/services/PersistentDataService';
import { useJsaStore } from '@/stores/jsaStore'
import '~/assets/buttons.css';

const props = defineProps({
  job: {
    type: Object as PropType<Job>,
    required: true
  }
});

const store = useJsaStore();
const userLoggedIn = store.authUser !== null;
const showRequirements = ref(false);
const showFullSummary = ref(false);
const showContent = ref(true);
const userAction = ref<boolean | null>(null);

const emitInterestSet = defineEmits(['interestSet']);

const tooltipContent = computed(() => {
  const g = props.job.guidance.replace(/\./g, '.<br><br>');
  return `Overall Score: ${props.job.overall_score}<br>
Desire Score: ${props.job.desire_score}<br>
Experience Score: ${props.job.experience_score}<br>
Meets Requirements Score: ${props.job.meets_requirements_score}<br>
Meets Experience Score: ${props.job.meets_experience_score}<br>
<br>
Guidance: ${g}`;
});

onMounted(async () => {
  window.addEventListener('resize', handleResize);
  const result = await getUserInterest();
  if (result) {
    userAction.value = result.interested;
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

const jobRecencyText = () => {
  const todayDate = new Date().toISOString().split('T')[0];
  const date = props.job.date_posted || props.job.date_pulled;
  const dateDiff = Math.floor((Date.parse(todayDate) - Date.parse(date)) / (1000 * 60 * 60 * 24));

  if (dateDiff === 0) {
    if (props.job.date_posted) return 'Posted today!';
    return 'Pulled today!';
  }

  return props.job.date_posted ? `Posted ${dateDiff} day(s) ago` : `Pulled ${dateDiff} day(s) ago`;
};

const handleResize = () => {
  if (window.innerWidth > 768) {
    showContent.value = true;
  }
};

const toggleCard = () => {
  if (window.innerWidth <= 768) {
    showContent.value = !showContent.value;
  }
};

const getScoreColor = (score: number) => {
  return score >= 85 ? '#59C9A5' : score > 75 ? '#93c1b2' : '#888';
};

const toggleRequirements = () => {
  showRequirements.value = !showRequirements.value;
};

const toggleSummary = () => {
  showFullSummary.value = !showFullSummary.value;
};

const setUserInterest = async (interested: boolean | null) => {
  try {
    const uid = store.authUser?.id || '';
    if (!uid) return;

    const result = await PersistentDataService.setUserInterest(uid, props.job.id, interested);
    userAction.value = interested;

    emitInterestSet('interestSet', props.job.id, interested);
  } catch (error) {
    console.error("Failed to set user interest:", error);
  }
};

const getUserInterest = async () => {
  try {
    const uid = store.authUser?.id || '';
    if (!uid) return null;

    const result = await PersistentDataService.getUserInterest(uid, props.job.id);
    return result;
  } catch (error) {
    console.error("Failed to get user interest:", error);
    return null;
  }
};

const renderMarkdown = (text: string) => {
  return marked(text);
};

const truncate = (text: string, length: number) => {
  if (text.length > length) {
    return text.substring(0, length) + '...';
  }
  return text;
};

const round = (value: number) => {
  return Math.round(value);
};

const openInBrowser = (event: MouseEvent) => {
  event.preventDefault();
  const url = (event.target as HTMLAnchorElement)?.href;
  window.open(url, '_blank');
};

const isOlder = () => {
  const todayDate = new Date().toISOString().split('T')[0];
  return props.job.date_posted < todayDate || props.job.date_pulled < todayDate;
};
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
  overflow: visible;
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
