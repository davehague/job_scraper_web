<template>
  <div class="auth-container">
    <div class="auth-box">
      <div v-if="signUpComplete">
        <div class="thank-you-message">Thank you, please check your email to verify your account!</div>
        <NuxtLink to="/">Return to home</NuxtLink>
      </div>
      <div v-else>
        <h2>Sign Up</h2>
        <form>
          <div class="form-group">
            <label for="email">Email:</label>
            <input v-model="email" type="email" id="email" required />
          </div>
          <div class="form-group">
            <label for="password">Password:</label>
            <input v-model="password" type="password" id="password" required />
          </div>

          <SubmitButton class="auth-button" defaultText="Sign up" submittingText="Signing Up..." :onClick="signUpWithEmail" />
          <GoogleSignInButton class="google-signin" @success="handleGoogleLoginSuccess" @error="handleGoogleLoginError">
          </GoogleSignInButton>

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
import { GoogleSignInButton, type CredentialResponse, decodeCredential } from "vue3-google-signin";


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
      signUpComplete.value = true;
    }
    else {
      console.error('Sign-up error:', error)
      errorMessage.value = 'There was some problem signing up';
    }

    // Remainder is handled by onAuthStateChange

  } catch (error) {
    errorMessage.value = (error as Error).message
    console.error('Sign-up error:', error)
  }
}

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

.google-signin {
  margin-top: 20px;
}
</style>