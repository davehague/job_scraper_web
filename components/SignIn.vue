<template>
  <div class="auth-container">
    <div class="auth-box">
      <h2>Sign In</h2>
      <form>
        <div class="form-group">
          <label for="email">Email:</label>
          <input v-model="email" type="email" id="email" required />
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input v-model="password" type="password" id="password" required />
        </div>

        <SubmitButton class="auth-button" defaultText="Sign In" submittingText="Signing In..." :onClick="signIn" />
        <GoogleSignInButton class="google-signin" @success="handleGoogleLoginSuccess" @error="handleGoogleLoginError">
        </GoogleSignInButton>
        
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <p class="toggle-auth" @click="toggleAuth">Don't have an account? Sign up</p>
      </form>
      <button class="link-button" @click="logout">Skip sign in for now</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from '#app'
import { supabase } from "@/utils/supabaseClient";
import { handlePostSignIn } from '~/utils/helpers';
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

const store = useJsaStore();
const router = useRouter()

onMounted(() => {
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      console.log('Sign-in successful:', session.user)
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

const logout = async () => {
  await store.signOutUser();
  router.push('/login');
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
</style>