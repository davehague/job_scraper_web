<template>
  <div class="container">
    <div class="box">
      <form @submit.prevent="onSubmitLocal">
        <slot></slot> <!-- Place for form fields -->
        <div class="button-group">
          <button v-if="showBackButton" @click="onBack" class="button-secondary">Back</button>
          <button type="submit" class="button-primary">{{ isLastScreen ? 'Finish' : 'Next' }}</button>
        </div>
      </form>
    </div>
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
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.box {
  background: #fff;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 800px;
  text-align: center;
}

.button-group {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  gap: 16px;
}
</style>