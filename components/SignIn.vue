<template>
  <div class="auth-container">
    <div class="auth-box">
      <div v-if="magicLinkComplete">
        <div class="thank-you-message">Please check your email for a magic link to sign in!</div>
        <NuxtLink to="/">Return to home</NuxtLink>
      </div>
      <div v-else>
        <h2>Sign In</h2>
        <form>
          <div class="form-group">
            <label for="email">Email:</label>
            <input v-model="email" type="email" id="email" required />
          </div>
          <div class="form-group">
            <label for="password">Password:</label>
            <input v-model="password" type="password" id="password" required />
            <a href="#" class="link-button link-small" @click="sendMagicLink">Forgot your password? Send a magic
              link</a>
          </div>

          <SubmitButton class="auth-button" defaultText="Sign In" submittingText="Signing In..." :onClick="signIn" />
          <GoogleSignInButton class="google-signin" @success="handleGoogleLoginSuccess" @error="handleGoogleLoginError">
          </GoogleSignInButton>

          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
          <p class="toggle-auth" @click="toggleAuth">Don't have an account? Sign up</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from '#app'
import { supabase } from "@/utils/supabaseClient";
import { GoogleSignInButton, type CredentialResponse, decodeCredential } from "vue3-google-signin";
import PersistentDataService from '~/services/PersistentDataService';
import { type User as DBUser } from '~/types/interfaces';
import { useJsaStore } from '@/stores/jsaStore'

defineProps<{
  toggleAuth: () => void
}>()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const magicLinkComplete = ref(false)


const store = useJsaStore();
const router = useRouter()

const signIn = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    });

    if (error) {
      console.error('Sign-in error:', error)
      errorMessage.value = error.message
    }

    // Remainder is handled by onAuthStateChange
  } catch (error) {
    errorMessage.value = (error as Error).message
    console.error('Sign-in error:', error)
  }
};

const handleGoogleLoginSuccess = async (response: CredentialResponse) => {
  const { credential } = response;
  if (credential) {
    let decodedCredential = decodeCredential(credential);
    console.log('decodedCredential', decodedCredential);

    if (response.credential) {
      try {
        console.log('Logging in to supabase with google credential');
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: response.credential
        })

        // Update the user's profile pic
        if (data && data.user && data.user.id) {
          let user = {
            id: data.user.id,
            avatar_url: data.user.user_metadata.avatar_url
          }
          PersistentDataService.upsertUser(user as DBUser)
        }
        // Remainder is handled by onAuthStateChange
      } catch {
        console.error('Error signing in with Google credential');
        handleGoogleLoginError();
      }
    }
  }
};

const handleGoogleLoginError = () => {
  console.error("Login with Google failed");
  errorMessage.value = 'There was some problem logging in with Google';
};

const sendMagicLink = async () => {
  if (!email.value) {
    errorMessage.value = 'Please enter your email address';
    return;
  }
  console.log('Sending magic link to', email.value);
  const config = useRuntimeConfig()

  console.log('config', config.public.baseURL)
  const { data, error } = await supabase.auth.signInWithOtp({
    email: email.value
  })

  console.log('Magic link response:', data)
  if (error) {
    console.error('Magic link error:', error)
    errorMessage.value = 'Something went wrong, please try again later'
    return;
  }

  magicLinkComplete.value = true;
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

.google-signin {
  margin-top: 20px;
}

.link-small {
  font-size: 12px;
  font-style: italic;
  color: #00458a;
  cursor: pointer;
}

.thank-you-message {
  margin-bottom: 20px;
}
</style>