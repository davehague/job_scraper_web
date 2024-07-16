<template>
  <div class="box">
    <form @submit.prevent="onSubmitLocal">
      <slot></slot> <!-- Place for form fields -->
      <div class="button-group">
        <button v-if="showBackButton" @click="onBack" class="button-secondary">Back</button>
        <button type="submit" class="button-primary" :disabled="isSubmitting">
          {{ isLastScreen ? (isSubmitting ? 'Finishing up...' : 'Finish') : (isSubmitting ? 'Saving...' : 'Next') }}
        </button>
      </div>
      <div class="form-errors" v-for="error in errors" :key="error">
        <p class="form-error">{{ error }}</p>
      </div>
    </form>
  </div>

</template>

<script setup lang="ts">
import { withDefaults, ref } from 'vue';

const props = withDefaults(defineProps<{
  onSubmit: (data: any) => void,
  onBack?: () => void,
  isLastScreen?: boolean,
  showBackButton?: boolean,
  isSubmitting: boolean,
  validateForm?: () => string[],
  errors?: string[]
}>(), {
  onSubmit: (data: any) => { },
  onBack: () => { },
  isLastScreen: false,
  showBackButton: false,
  validateForm: () => [],
  errors: () => []
});

const onBack = () => {
  if (props.onBack) {
    props.onBack();
  }
};

// Dummy ref to represent the passed-in form data
const formData = ref({});

const onSubmitLocal = () => {
  const result = props.validateForm();
  if (result.length === 0) {
    props.onSubmit(formData.value);
  }
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

.button-primary:disabled {
  opacity: 0.5; 
  cursor: not-allowed; 
}

.form-errors {
  margin-top: 8px;
}
.form-error {
  color: red;
  margin: 2px 0;
}
</style>