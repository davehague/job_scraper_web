<div class="auth-container">
  <SignUp v-if="showSignUp" :toggleAuth="toggleAuth" />
  <SignIn v-else :toggleAuth="toggleAuth" />
</div>

<script lang="ts" setup>
import { ref } from 'vue'

const showSignUp = ref(false)

</script>

<style>

</style>