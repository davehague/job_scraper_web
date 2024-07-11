<template>
  <div class="score-circle" :style="{ backgroundColor: getScoreColor(props.overall_score) }">
    <span class="score-text">{{ props.overall_score }}</span>
  </div>
</template>

<script lang="ts" setup>
import { getScoreColor } from '@/utils/jobs';

const props = defineProps({
  overall_score: Number
});

</script>

<style scoped>
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

.score-text {
  position: relative;
  z-index: 1;
}
</style>