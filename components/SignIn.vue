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
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <p class="toggle-auth" @click="toggleAuth">Don't have an account? Sign Up</p>
      </form>
      <NuxtLink to="/">Skip sign in for now</NuxtLink>
    </div>
  </div>
</template>


<script lang="ts">
import { ref, type PropType } from 'vue'
import { useRouter } from '#app'
import { supabase } from "@/utils/supabaseClient";
import { useJsaStore } from '@/stores/jsaStore';
import PersistentDataService from '~/services/PersistentDataService';
import { type User as DBUser } from '~/types/interfaces';

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
    const router = useRouter();
    const store = useJsaStore();

    const signIn = async () => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.value,
          password: password.value
        });

        if (data && data.user != null) {
          console.log('Sign-in successful:', data)
          store.setAuthUser(data.user);

          let dbUser = await PersistentDataService.singleRecordFetch('users', data.user.id);
          store.setDBUser(dbUser as DBUser);

          router.push('/')
        } else {
          throw error;
        }
      } catch (error) {
        errorMessage.value = (error as Error).message
        console.error('Sign-in error:', error)
      }
    }

    return {
      email,
      password,
      errorMessage,
      signIn
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
</style>