<template>
  <div class="auth-container">
    <SignUp v-if="showSignUp" :toggleAuth="toggleAuth" />
    <SignIn v-else :toggleAuth="toggleAuth" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { handlePostSignIn } from '~/utils/helpers';
import { supabase } from "@/utils/supabaseClient";
import type { Subscription } from '@supabase/supabase-js';

const showSignUp = ref(false)

const toggleAuth = () => {
  showSignUp.value = !showSignUp.value
}

let authSubscription: Subscription;

onMounted(() => {
  authSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('onAuthStateChange', event, session)
    if (event === 'SIGNED_IN' && session?.user) {
      console.log('Sign-in successful:', session.user)
      await handlePostSignIn(session.user)
    }
  }).data.subscription;
})

onUnmounted(() => {
  authSubscription.unsubscribe();
})

</script>

<style>
.auth-container {
  display: flex;
  justify-content: center;
  margin: 20px;
}
</style>