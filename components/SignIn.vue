<template>
  <div class="auth-container">
    <div class="auth-box">
      <h2>Sign In</h2>
      <form @submit.prevent="signIn">
        <div class="form-group">
          <label for="email">Email:</label>
          <input v-model="email" type="email" id="email" required />
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input v-model="password" type="password" id="password" required />
        </div>
        <button type="submit" class="auth-button">Sign In</button>
        <button type="button" @click="signInWithGoogle" class="google-auth-button">Sign in with Google</button>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <p class="toggle-auth" @click="toggleAuth">Don't have an account? Sign up</p>
      </form>
      <button class="link-button" @click="logout">Skip sign in for now</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type PropType } from 'vue'
import { useRouter } from '#app'
import { supabase } from "@/utils/supabaseClient";
import { useJsaStore } from '@/stores/jsaStore';
import PersistentDataService from '~/services/PersistentDataService';
import { type User as DBUser } from '~/types/interfaces';
import { shouldRedirectToOnboarding } from '~/utils/helpers.ts';
import type { AuthUser } from '@supabase/supabase-js';

const props = defineProps<{
  toggleAuth: () => void
}>()

const email = ref('')
const password = ref('')
const errorMessage = ref('')

const router = useRouter()
const store = useJsaStore()

onMounted(() => {
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      console.log('Google sign-in successful:', session.user)
      await handlePostSignIn(session.user)
    }
  })
})

const signIn = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    });

    if (data && data.user != null) {
      console.log('Sign-in successful:', data)
      store.setAuthUser(data.user);
      store.getDBUser(); // Pre-fetch the DB user

      let dbUser = await PersistentDataService.singleRecordFetch('users', data.user.id);
      store.setDBUser(dbUser as DBUser);

      const userShouldOnboard = await shouldRedirectToOnboarding();
      if (userShouldOnboard) {
        router.push("/onboarding");
      } else {
        router.push("/");
      }

    } else {
      throw error;
    }
  } catch (error) {
    errorMessage.value = (error as Error).message
    console.error('Sign-in error:', error)
  }
};

const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('Error during Google sign-in:', error.message);
    errorMessage.value = error.message;
  }
};

const handlePostSignIn = async (user: AuthUser) => {
  try {
    store.setAuthUser(user);
    store.getDBUser(); // Pre-fetch the DB user
    let dbUser = await PersistentDataService.singleRecordFetch('users', user.id);
    store.setDBUser(dbUser as DBUser);

    const userShouldOnboard = await shouldRedirectToOnboarding();
    if (userShouldOnboard) {
      router.push("/onboarding");
    } else {
      router.push("/");
    }
  } catch (error) {
    console.error('Error handling post-sign-in:', error);
    errorMessage.value = (error as Error).message;
  }
};

const logout = async () => {
  await supabase.auth.signOut();
  router.push('/');
};
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.auth-box {
  background: #fff;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 300px;
  text-align: center;
}

h2 {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
}

.auth-button {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.error-message {
  color: red;
  margin-top: 10px;
}

.toggle-auth {
  margin-top: 20px;
  color: #007bff;
  cursor: pointer;
}

.toggle-auth:hover {
  text-decoration: underline;
}

.google-auth-button {
  background-color: #4285F4;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
}

.google-auth-button:hover {
  background-color: #357ae8;
}
</style>