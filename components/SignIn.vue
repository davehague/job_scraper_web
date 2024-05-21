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
import { ref, defineComponent, type PropType } from 'vue'
import { useNuxtApp, useRouter } from '#app'

export default {
  props: {
    toggleAuth: {
      type: Function as PropType<() => void>,
      required: true
    }
  },
  setup(props) {
    const email = ref('')
    const password = ref('')
    const errorMessage = ref('')
    const { $supabase } = useNuxtApp()
    const router = useRouter()

    const signIn = async () => {
      try {
        const { data, error } = await ($supabase as any).auth.signInWithPassword({
          email: email.value,
          password: password.value
        })
        if (error) {
          throw error
        }
        console.log('Sign-in successful:', data)
        router.push('/')
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
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.auth-button:hover {
  background-color: #0056b3;
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