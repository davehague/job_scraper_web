<!-- FloatingBackButton.vue -->
<template>
  <button @click="handleClick" class="back-btn">
    <i class="fas fa-arrow-left"></i>
  </button>
</template>

<script setup lang="ts">

const props = defineProps<{
  action?: () => void;
}>();

const emit = defineEmits<{
  (e: 'click'): void;
}>();

const handleClick = () => {
  if (props.action) {
    props.action();
  }
  emit('click');
};
</script>

<style scoped>
.back-btn {
  position: fixed;
  top: 20px;
  left: 20px;
  padding: 10px;
  color: #333;
  background-color: #555;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: #fff;
}

.back-btn:hover {
  background-color: #333;
  color: #fff;
}
</style>
