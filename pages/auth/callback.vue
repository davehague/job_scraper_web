<template>
  <div>
    Redirecting...
  </div>
</template>

<script setup lang="ts">
import { supabase } from "@/utils/supabaseClient";
import { useRouter, useRoute } from 'vue-router';
import { onMounted } from "vue";
import PersistentDataService from "~/services/PersistentDataService";

const parseHash = (hash: string): Record<string, string> => {
  const params: Record<string, string> = {};
  hash.substring(1).split('&').forEach((param: string) => {
    const [key, value] = param.split('=');
    params[key] = decodeURIComponent(value);
  });
  return params;
};

const router = useRouter();

const handleOAuthCallback = async () => {
  const hash = window.location.hash;
  const params = parseHash(hash);

  const accessToken = params.access_token;
  const refreshToken = params.refresh_token;

  if (accessToken && refreshToken) {
    try {
      // Set the Supabase session using the tokens
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        throw error;
      }

      const user = data.user;
      console.log('Google sign-up successful:', user);
      const uid = user?.id;
      const email = user?.email;
      const name = user?.user_metadata?.full_name || '';

      if (!uid) {
        throw new Error('User ID not found in session data.');
      }

      if (!email) {
        throw new Error('Email not found in session data.');
      }

      await handlePostSignUp(uid, email, name);

    } catch (error) {
      console.error('Error during session exchange:', error);
    }
  } else {
    console.error('Access token or refresh token not found in URL hash.');
  }
};


const handlePostSignUp = async (userId: string, userEmail: string, userName?: string) => {
  const dbUser = await PersistentDataService.fetchUserByEmail(userEmail);
  if (dbUser) {
    console.log('User already exists in DB:', dbUser);

  } else { // Create a new user
    const { error: userCreateError } = await supabase
      .from('users')
      .insert({ id: userId, email: userEmail, name: userName });

    if (userCreateError) {
      console.error('Error creating user:', userCreateError.message);
      throw userCreateError;
    }
  }

  router.push('/');
};

onMounted(() => {
  handleOAuthCallback();
});
</script>
