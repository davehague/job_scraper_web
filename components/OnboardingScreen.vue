<template>
  <div class="box">
    <form @submit.prevent="onSubmitLocal">
      <slot></slot> <!-- Place for form fields -->
      <div class="button-group">
        <button v-if="showBackButton" @click="onBack" class="button-secondary">Back</button>
        <button type="submit" class="button-primary">{{ isLastScreen ? 'Finish' : 'Next' }}</button>
      </div>
    </form>
  </div>

</template>

<script setup lang="ts">
import { defineProps, withDefaults, ref } from 'vue';

const props = withDefaults(defineProps<{
  onSubmit: (data: any) => void;
  onBack?: () => void;
  isLastScreen?: boolean;
  showBackButton?: boolean;
}>(), {
  onSubmit: (data: any) => { },
  onBack: () => { },
  isLastScreen: false,
  showBackButton: false
});

const onBack = () => {
  if (props.onBack) {
    props.onBack();
  }
};

// Dummy ref to represent some kind of data collection, adjust as needed
const formData = ref({});

const onSubmitLocal = () => {
  // Call the passed onSubmit function with formData
  props.onSubmit(formData.value);
};
</script>

<style scoped>
form {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.box {
  height: fit-content;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 30px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.button-group {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  gap: 16px;
}
</style>