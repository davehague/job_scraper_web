<template>
  <button @click="handleClick" :disabled="isSubmitting" :class="buttonClass">
    {{ isSubmitting ? submittingText : defaultText }}
  </button>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  defaultText: {
    type: String,
    required: true,
  },
  submittingText: {
    type: String,
    required: true,
  },
  onClick: {
    type: Function,
    required: true,
  },
  buttonClass: {
    type: String,
    default: '',
  },
});

const isSubmitting = ref(false);

const handleClick = async () => {
  if (!isSubmitting.value) {
    isSubmitting.value = true;
    await props.onClick();
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
