<!-- pages/index.vue -->
<template>
  <div class="landing-page">
    <header>
      <h1>AI-Powered Job Matching</h1>
      <p>Find better jobs faster with our intelligent job search tool</p>
      <button @click="navigateToSignup" class="cta-button">Get Started</button>
    </header>

    <main>
      <section class="features">
        <h2>Key Features</h2>
        <ul>
          <li>Real-time job updates 3 times a day</li>
          <li>AI-powered job summaries and requirement lists</li>
          <li>Personalized job ratings based on your profile</li>
          <li>Customizable email notifications</li>
        </ul>
      </section>

      <section class="screenshots">
        <h2>See it in Action</h2>
        <div class="screenshot-container">
          <img class="landscape" :src="jobCardScreenshot" alt="Job Cards Screen" />
          <img class="portrait" :src="guidanceScreenshot" alt="Job Guidance Feature" />
        </div>
      </section>

      <section class="target-audience">
        <h2>Perfect for Career Movers</h2>
        <p>Already employed but looking for your next opportunity? Our tool helps you discreetly find and evaluate new positions that match your skills and aspirations.</p>
      </section>
    </main>

    <footer>
      <button @click="navigateToSignup" class="cta-button">Start Your Job Search</button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'nuxt/app'

const router = useRouter()

const jobCardScreenshot = '/landing/jobs-app-ss.png'
const guidanceScreenshot = '/landing/jobs app-guidance.png'

const navigateToSignup = () => {
  router.push('/login')
}
</script>

<style scoped>
.landing-page {
  font-family: Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

header {
  text-align: center;
  margin-bottom: 3rem;
}

h1 {
  font-size: 2.5rem;
  color: #333;
}

.cta-button {
  max-width: 500px;
  background-color: #59C9A5;
  font-size: 20px;
}

.cta-button:hover {
  background-color: #4DAF9C;
}

.features, .screenshots, .target-audience {
  margin-bottom: 3rem;
}

.screenshot-container {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}

.screenshot-container img {
  max-width: 45%;
  margin: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.landscape {
  min-height: 600px;
  min-width: 1200px;
}

.portrait {
  min-width: 300px;
  min-height: 600px;
}

footer {
  text-align: center;
  margin-top: 3rem;
}
</style>
