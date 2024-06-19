<template>
  <div>
    Redirecting...
  </div>
</template>

<script setup lang="ts">
import { supabase } from "@/utils/supabaseClient";
import { useRouter, useRoute } from 'vue-router';
import { onMounted } from "vue";

const router = useRouter();
const route = useRoute();

const handleOAuthCallback = async () => {
  const code = route.query.code as string;

  if (code) {
    try {
      const response = await fetch('/api/exchange-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const sessionData = await response.json();
      if (sessionData && sessionData.user) {
        console.log('Google sign-up successful:', sessionData.user);
        const uid = sessionData.user.id;
        const email = sessionData.user.email || '';
        const name = sessionData.user.user_metadata?.full_name || '';
        await handlePostSignUp(uid, email, name);
        router.push('/'); 
      }
    } catch (error) {
      console.error('Error during session exchange:', error);
    }
  } else {
    console.error('No code found in query parameters.');
  }
};

const handlePostSignUp = async (userId: string, userEmail: string, userName?: string) => {
  const { error: userCreateError } = await supabase
    .from('users')
    .insert({ id: userId, email: userEmail, name: userName })

  if (userCreateError) {
    throw userCreateError
  }
};

onMounted(() => {
  handleOAuthCallback();
});
</script>
