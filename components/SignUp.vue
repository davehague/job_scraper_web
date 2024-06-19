<template>
  <div class="auth-container">
    <div class="auth-box">
      <div v-if="signUpComplete">
        <div class="thank-you-message">Thank you, please check your email to verify your account!</div>
        <NuxtLink to="/">Return to home</NuxtLink>
      </div>
      <div v-else>
        <h2>Sign Up</h2>
        <form @submit.prevent="signUpWithEmail">
          <div class="form-group">
            <label for="email">Email:</label>
            <input v-model="email" type="email" id="email" required />
          </div>
          <div class="form-group">
            <label for="password">Password:</label>
            <input v-model="password" type="password" id="password" required />
          </div>
          <button type="submit" class="auth-button">Sign up</button>
          <button type="button" @click="signUpWithGoogle" class="google-auth-button">Sign up with Google</button>
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
          <p class="toggle-auth" @click="toggleAuth">Already have an account? Sign In</p>
        </form>

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from "@/utils/supabaseClient";
import PersistentDataService from '~/services/PersistentDataService';

defineProps<{
  toggleAuth: () => void
}>()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const signUpComplete = ref(false)

const signUpWithEmail = async () => {
  try {
    let existingUser = await PersistentDataService.fetchUserByEmail(email.value);
    console.log('existingUser', existingUser);
    if (existingUser) {
      errorMessage.value = 'Email already exists, please sign in instead.';
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value
    })

    if (data && data.user != null) {
      console.log('Sign-up successful:', data);
      await handlePostSignUp(data.user?.id, email.value)
        } else {
      throw error;
    }
  } catch (error) {
    errorMessage.value = (error as Error).message
    console.error('Sign-up error:', error)
  }
}

const signUpWithGoogle = async () => {
  console.log('signing up with google');

  try {
    const runtimeConfig = useRuntimeConfig()
    const redirectUrl = runtimeConfig.public.baseURL + '/auth/callback';

    console.log('signing up with google, will redirect to ', redirectUrl);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          access_type: 'offline', // To get a refresh token
          prompt: 'consent', // To re-prompt the user to select a Google account,
          redirectTo: redirectUrl,
        },
      },
    });

    console.log('data', data);
    console.log('error', error); 

    if (error) {
      throw error;
    }

  } catch (error) {
    console.error('Error during Google sign-in:', (error as Error).message);
  }
};

const handlePostSignUp = async (userId: string, userEmail: string, userName?: string) => {
  const { error: userCreateError } = await supabase
    .from('users')
    .insert({ id: userId, userEmail: email, name: userName })

  if (userCreateError) {
    throw userCreateError
  }

  signUpComplete.value = true
}

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

.thank-you-message {
  margin-bottom: 20px;
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