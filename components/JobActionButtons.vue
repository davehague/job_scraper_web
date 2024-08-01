<template>
    <div class="action-buttons-container">
      <!-- Latest Search -->
      <div v-if="job.user_interested === null && !job.has_applied" class="action-buttons">
        <button @click="markUserInterest(true)" class="button-primary">Save</button>
        <!-- <button @click="markAsApplied(!job.has_applied)" class="button-primary">Mark as applied</button> -->
        <button @click="markUserInterest(false)" class="button-secondary">Discard</button>
      </div>
      <!-- Saved Results -->
      <div v-else-if="job.user_interested === true && !job.has_applied" class="action-buttons">
        <button @click="markAsApplied(!job.has_applied)" class="button-primary">Mark as applied</button>
        <button @click="markUserInterest(false)" class="button-secondary">Discard</button>
      </div>
      <!-- View Applied -->
      <div v-if="job.has_applied && (job.user_interested === null || job.user_interested === true)"
        class="action-buttons">
        <button @click="restoreToSaved()" class="button-primary">Move to saved</button>
        <button @click="markUserInterest(false)" class="button-secondary">Discard</button>
      </div>
      <!-- View Discards -->
      <div v-else-if="job.user_interested === false" class="action-buttons">
        <button @click="restoreToSaved()" class="button-primary">Move to saved</button>
        <button @click="restoreToApplied()" class="button-secondary">Mark as applied</button>
      </div>
    </div>
</template>

<script lang="ts" setup>
import { type PropType } from 'vue';
import type { Job } from '@/types/interfaces';
import { setHasApplied, setUserInterest } from '@/utils/jobs';
import '@/assets/buttons.css';

const props = defineProps({
  job: {
    type: Object as PropType<Job>,
    required: true
  }
});

const emits = defineEmits(['interestUpdated', 'appliedUpdated']);

const markUserInterest = async (interested: boolean | null) => {
  setUserInterest(props.job.id, interested);
  emits('interestUpdated', props.job.id, interested);
};

const markAsApplied = (hasApplied: boolean) => {
  setHasApplied(props.job.id, hasApplied);
  emits('appliedUpdated', props.job.id, hasApplied)
};

const restoreToSaved = () => {
  markUserInterest(true);
  markAsApplied(false);
}

const restoreToApplied = () => {
  markUserInterest(true);
  markAsApplied(true);
}
</script>

<style scoped>
.action-buttons-container {
  display: flex;
  flex: 1;
}

.action-buttons {
  display: flex;
  flex: 1;
  justify-content: space-between;
  margin: 10px 0 0 0;
  gap: 24px;
}

button {
  border-radius: 4px;
  padding: 4px 24px;
  height: 32px;
  font-weight: 400;
  flex: 1;
}
</style>