<template>
  <div class="info-tooltip">
    <button @mouseover="showTooltip" @mouseleave="hideTooltip" class="info-button">
      <i class="fas fa-info-circle"></i>
    </button>
    <div v-if="visible" class="tooltip-content" v-html="text">
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

interface Props {
  text: string;
}

const props = defineProps<Props>();

const visible = ref(false);

const showTooltip = () => {
  visible.value = true;
};

const hideTooltip = () => {
  visible.value = false;
};
</script>

<style scoped>
.info-tooltip {
  position: relative;
  display: inline-block;
}

.info-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  color: #333;
}

.info-button:hover {
  background-color: #eee;
}

.tooltip-content {
  visibility: visible;
  width: 400px;
  background-color: #ddd;
  color: #333;
  text-align: left;
  border-radius: 6px;
  padding: 15px;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  margin-left: -200px;
}

.tooltip-content::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #555 transparent transparent transparent;
}
</style>
