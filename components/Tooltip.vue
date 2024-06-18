<template>
  <div class="tooltip-wrapper" @mouseover="showTooltip" @mouseleave="hideTooltip">
    <slot></slot>
    <div v-if="visible" class="tooltip-content" v-html="content">
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

interface Props {
  content: string;
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
.tooltip-wrapper {
  position: relative;
  display: inline-block;
}

.tooltip-content {
  visibility: visible;
  width: 400px;
  height: auto;
  background-color: #ddd;
  color: #000;
  text-align: left;
  border-radius: 6px;
  padding: 15px;
  position: absolute;
  z-index: 1;
  left: 50%;
  transform: translateX(-80%) translateY(5px); 
  font-size: 14px;
}

.tooltip-content::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 5px;
  border-style: solid;
  border-color: #ddd transparent transparent transparent;
}
</style>
