<template>
  <div class="auth-container">
    <SignUp v-if="showSignUp" :toggleAuth="toggleAuth" />
    <SignIn v-else :toggleAuth="toggleAuth" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showSignUp = ref(false)


const toggleAuth = () => {
  showSignUp.value = !showSignUp.value
}

</script>

<style>
.auth-container {
  display: flex;
  justify-content: center;
  margin: 20px;
}
</style>