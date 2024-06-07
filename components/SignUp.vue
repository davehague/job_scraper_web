<template>
  <div class="auth-container">
    <div class="auth-box">
      <div v-if="signUpComplete">
        <div class="thank-you-message">Thank you, please check your email to verify your account!</div>
        <NuxtLink to="/">Return to home</NuxtLink>
      </div>
      <div v-else>
        <h2>Sign Up</h2>
        <form @submit.prevent="signUp">
          <div class="form-group">
            <label for="email">Email:</label>
            <input v-model="email" type="email" id="email" required />
          </div>
          <div class="form-group">
            <label for="password">Password:</label>
            <input v-model="password" type="password" id="password" required />
          </div>
          <button type="submit" class="auth-button">Sign Up</button>
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
          <p class="toggle-auth" @click="toggleAuth">Already have an account? Sign In</p>
        </form>
      </div>

    </div>
  </div>
</template>

<script lang="ts">
import { ref, type PropType } from 'vue'
import { supabase } from "@/utils/supabaseClient";
import { useJsaStore } from '@/stores/jsaStore';
import PersistentDataService from '~/services/PersistentDataService';
import { welcome } from '@/services/emailTemplates';

export default {
  props: {
    toggleAuth: {
      type: Function as PropType<() => void>,
      required: true
    }
  },
  setup(props) {
    const email = ref('');
    const password = ref('');
    const errorMessage = ref('');
    const signUpComplete = ref(false);

    const sendWelcomeEmail = async (email: string) => {
      try {
        const response = await fetch('/api/sendEmail', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            toEmail: email,
            subject: `Welcome to the Job App!`,
            htmlTemplate: welcome,
          }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const result = await response.json();
        console.log('Member added successfully:', result);

      } catch (error) {
        console.error('Error adding member:', error);
      }
    }

    const signUp = async () => {
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
          sendWelcomeEmail(email.value);
          console.log('Sign-up successful:', data);
          const { error: userCreateError } = await supabase
            .from('users')
            .insert({ id: data.user?.id, email: email.value })

          if (userCreateError) {
            throw userCreateError
          }

          signUpComplete.value = true
        } else {
          throw error;
        }
      } catch (error) {
        errorMessage.value = (error as Error).message
        console.error('Sign-up error:', error)
      }
    }

    return {
      email,
      password,
      errorMessage,
      signUp,
      signUpComplete,
    }
  }
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
</style>