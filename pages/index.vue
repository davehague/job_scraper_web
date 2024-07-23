<!-- pages/index.vue -->
<template>
  <div class="landing-page">
    <header>
      <div class="buttons">
        <button @click="navigateToSignup(true)" class="cta-primary">Sign up</button>
        <button @click="navigateToSignup()" class="cta-secondary">Log In</button>
      </div>
      <div class="header-left">
        <div class="max-width">
          <h1>Search smarter, not harder.</h1>
          <p class="header-details">Get job postings that match your
            <span class="emphasized">skills</span>,
            <span class="emphasized">experience</span>, and
            <span class="emphasized">preferences</span>
            and take the guesswork out of your job search with our intelligent job search tool.
          </p>
          <button @click="navigateToSignup(true)" class="cta-primary">Sign up now</button>
        </div>
        <div class="right">
          <img src="/landing/job-hunt-amico-1.svg" alt="Jobs App Screenshot">
        </div>
      </div>
    </header>

    <main>
      <section class="frustrations">
        <div class="text-left">
          <div class="max-width">
            <h2>Tired of sorting through hundreds of job posts on numerous job board sites?</h2>
            <p>We use AI to do the work for you. We search job boards to find job postings that match what you're
              looking for and bring them together in one easy-to-use interface to streamline your search.</p>
          </div>
          <div class="right">
            <img src="/landing/search-bro-1.svg" alt="Detective searching a website">
          </div>
        </div>
        <div class="text-right">
          <div class="max-width">
            <img src="/landing/choose-pana-1.svg" alt="Man attempting to decide">
          </div>
          <div class="right">
            <h2>Overwhelmed deciding which roles are worth your time to apply to?</h2>
            <p>Our match scores and role insights let you know which job postings are a strong match, taking the
              tediousness and guesswork out of prioritizing your applications. </p>
          </div>

        </div>
        <div class="text-left">
          <div class="max-width">
            <h2>Frustrated with sending out endless applications hoping to find a good match?</h2>
            <p>Our hiring manager insights help you tailor your application and stand out from the crowd. And by
              focusing your job search on your strongest matches, you’ll reap greater rewards for your efforts.</p>
          </div>
          <div class="right">
            <img src="/landing/hired-amico-1.svg" alt="Woman in middle, spotlighted">
          </div>
        </div>
      </section>

      <section class="bg-box-cta seventy-percent-green">
        <h2 class="center-wrapped">Spend less time searching and more time succeeding with targeted job matches</h2>
        <button @click="navigateToSignup(true)" class="cta-tertiary">Sign up now</button>
      </section>

      <section class="text-left text-features">
        <div class="max-width">
          <h2 class="features-h2">Key Features</h2>
          <ul>
            <li>AI-powered job summaries and requirement lists</li>
            <li>Personalized job ratings based on your profile</li>
            <li>Smart insights to help you target your job materials</li>
            <li>Real-time job updates 3 times a day</li>
            <li>Customizable email notifications</li>
          </ul>
        </div>
        <div class="right-50">
          <img src="/landing/jobs-details.png" alt="Job Details Screenshot">
        </div>
      </section>

      <section class="image-cta">
        <div class="buffer-line"></div>
        <div class="column">
          <h2>Maximize your chances of landing the right job with AI-driven insights</h2>
          <img src="/landing/resume-amico-1.svg" alt="Resume with two people shaking hands" />
          <button @click="navigateToSignup(true)" class="cta-tertiary">Sign up now</button>
        </div>
        <div class="buffer-line"></div>
      </section>

      <div class="divider-line"></div>

      <section class="bg-box-cta ten-percent-green">
        <h2 class="centered">Your AI-driven job search with JobScout</h2>
        <div class="steps">
          <div class="column search-step">
            <div class="round">
              <span class="number">1</span>
            </div>
            <h3>Complete your profile</h3>
            <span>Upload your resume and answer a few questions</span>
          </div>
          <div class="column search-step">
            <div class="round">
              <span class="number">2</span>
            </div>
            <h3>Review your matches</h3>
            <span>Save jobs that interest you and discard the rest</span>
          </div>
          <div class="column search-step">
            <div class="round">
              <span class="number">3</span>
            </div>
            <h3>Prep your materials</h3>
            <span>Use AI-driven insights to put your best foot forward</span>
          </div>
          <div class="column search-step">
            <div class="round">
              <span class="number">4</span>
            </div>
            <h3>Apply!</h3>
            <span>Mark jobs as applied to clear your queue</span>
          </div>
        </div>
      </section>

      <!-- <section class="text-left text-features">
        <div class="left-50">
          <img src="/landing/track-progress.gif" alt="Job Details Screenshot">
        </div>
        <div class="right-50">
          <h2 class="features-h2">Work your queue, track your progress</h2>
          <p>Keep track of the jobs you’re interested in, the ones you’ve applied to, and the
            ones you’ve heard back from. No more losing track of where you are in the application process.</p>
        </div>
      </section> -->
    </main>

    <footer style="display:flex; justify-content: space-around;">
      <div>
        <h2>Copyright 2024. All rights reserved</h2>
        <h3>Image Credits</h3>
        <a href="https://storyset.com/job">Job illustrations by Storyset</a><br />
        <a href="https://storyset.com/people">People illustrations by Storyset</a><br />
        <a href="https://storyset.com/marketing">Marketing illustrations by Storyset</a><br />
        <a href="https://storyset.com/business">Business illustrations by Storyset</a><br />
        <a href="https://storyset.com/job">Job illustrations by Storyset</a>
        <p></p>
      </div>
      <div>
        <a class="social" href="https://discord.gg/EZ5cyyvu">
          <i class="fab fa-discord larger-icon"></i>
          <h2>Build with us on Discord</h2>
        </a>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'nuxt/app'
import { supabase } from "@/utils/supabaseClient";
import { handlePostSignIn } from '~/utils/helpers';

const router = useRouter()

const navigateToSignup = (shouldGoToSignup = false) => {
  if (shouldGoToSignup) {
    router.push('/login?showSignUp=true')
  } else {
    router.push('/login')
  }
}

onMounted(() => {
  checkIfConfirmingEmail();
})

const parseHash = (hash: string): Record<string, string> => {
  const params: Record<string, string> = {};
  hash.substring(1).split('&').forEach((param: string) => {
    const [key, value] = param.split('=');
    params[key] = decodeURIComponent(value);
  });
  return params;
};

const checkIfConfirmingEmail = async () => {
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

      if (data && data.user) {
        console.log('Sign-up completion successful:', data.user);
        handlePostSignIn(data.user);
      }
      else {
        console.error('Sign-up completion error:', error);
      }

    } catch (error) {
      console.error('Error during session exchange:', error);
    }
  }
}
</script>

<style scoped>
.buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-bottom: 2rem;
}

.cta-primary {
  background-color: #59C9A5;
  color: #263238;
  font-weight: 700;
  font-size: 20px;
  box-shadow: 2px 4px 16px 0px #26323880;
  width: 146px;
  height: 48px;
  margin-right: 24px;
}

.cta-secondary {
  background-color: #408E82;
  border: 2px solid #59C9A5;
  color: #fff;
  font-weight: 700;
  font-size: 20px;
  width: 146px;
  height: 48px;
}

.cta-tertiary {
  background-color: #2B6065;
  color: #fff;
  box-shadow: 2px 4px 16px 0px #26323840;
  font-weight: 700;
  font-size: 20px;
  width: 280px;
  height: 48px;
}


header {
  background: linear-gradient(0deg, #2B6065, #2B6065),
    linear-gradient(116.84deg, rgba(89, 201, 165, 0) 0%, rgba(89, 201, 165, 0.05) 18.81%, rgba(89, 201, 165, 0.1) 58.3%, rgba(89, 201, 165, 0.55) 106.31%, #59C9A5 117.56%);
  color: white;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  height: 982px;
}

.header-details {
  font-size: 32px;
  font-weight: 400;
  line-height: 48px;
  text-align: left;
}

.emphasized {
  font-size: 32px;
  font-weight: 700;
  color: #59C9A5;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 64px;
  margin: 24px 48px;
}

.text-left,
.text-right {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin: 0 200px;
}

.text-features {
  margin: 48px;
  align-items: start;
}

.left {
  flex: 1;
}

.max-width {
  flex: 1;
}

.left-50 img,
.right-50 img {
  max-width: 100%;
  height: auto;
}

.features-h2 {
  border-bottom: 4px solid #59C9A5;
  padding-bottom: 8px;
  margin-right: 64px;
}

h1 {
  font-size: 80px;
  font-weight: 700;
  line-height: 92px;
  text-align: left;
}

h2 {
  font-weight: 400;
}

p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.right img {
  max-width: 100%;
  height: auto;
}

.bg-box-cta {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  margin: 48px;
  border-radius: 4px;
  height: auto;
}

.ten-percent-green {
  background-color: #59C9A522;
}

.seventy-percent-green {
  background-color: #59C9A5CC;
}

.center-wrapped {
  text-align: center;
  max-width: 600px;
  margin-bottom: 24px;
  font-weight: 400;
}

ul {
  list-style-type: none;
  padding-left: 0;
  margin-top: 20px;
}

li {
  position: relative;
  padding-left: 30px;
  margin-bottom: 15px;
  font-size: 16px;
  line-height: 1.5;
  color: #333;
}

li::before {
  content: "";
  position: absolute;
  top: 4px;
  left: 0;
  width: 10px;
  height: 10px;
  background-color: #59C9A5;
  border-radius: 50%;
}

.image-cta {
  display: flex;
}

.steps {
  display: flex;
  flex-direction: row;
}

.column {
  display: flex;
  flex-direction: column;
  flex: 1;
  text-align: center;
  align-items: center;
}

.search-step {
  padding: 8px;
  margin: 16px;
}

.buffer-line {
  margin: 48px;
  flex: 1;
  border-top: 4px solid #59C9A5;
  width: 100%;
}

.divider-line {
  margin: 48px;
  flex: 1;
  border-top: 4px solid #59C9A5;
  width: 100%;
}

footer {
  margin-top: 48px;
  background: linear-gradient(0deg, #2B6065, #2B6065),
    linear-gradient(116.84deg, rgba(89, 201, 165, 0) 0%, rgba(89, 201, 165, 0.05) 18.81%, rgba(89, 201, 165, 0.1) 58.3%, rgba(89, 201, 165, 0.55) 106.31%, #59C9A5 117.56%);
  color: white;
  padding: 2rem;
}

a {
  color: #ccc;
  text-decoration: none;
}

.social {
  color: #eee;
  display: flex;
  gap: 16px;
  align-items: center;
}

.larger-icon {
  font-size: 24px;
}

span {
  margin-top: 16px;
  font-size: 24px;
}

.round {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #8BD9C0;
  border: 4px solid #234F5B;
}

.number {
  margin-top: 0;
  font-size: 24px;
  font-weight: bold;
}

.centered {
  text-align: center;
  font-weight: 700;
}

@media (max-width: 768px) {
  header {
    height: auto;
    padding: 1rem;
  }

  .buttons {
    justify-content: center;
    margin-bottom: 1rem;
  }

  .header-left,
  .text-left,
  .text-right {
    flex-direction: column;
    gap: 1rem;
    margin: 0;
  }

  .header-details, .emphasized {
    font-size: 24px;
    line-height: 36px;
  }

  h1 {
    font-size: 48px;
    line-height: 56px;
  }

  h1, h2, p, li {
    margin-left: 16px;
    margin-right: 16px;
  }

  .cta-primary,
  .cta-secondary,
  .cta-tertiary {
    width: 100%;
    margin-right: 0;
  }

  .text-left-features {
    margin: 24px;
  }

  .features-h2 {
    margin-right: 0;
  }

  .text-cta {
    height: auto;
    margin: 24px;
    padding: 24px;
  }

  .center-wrapped {
    max-width: 100%;
  } 

  .image-cta {
    flex-direction: column;
  }

  .buffer-line {
    margin: 24px 0;
  }

  .right img,
  .left img {
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
    display: block;
  }

  .steps {
    flex-direction: column;
  }

  .divider-line {
    display: none;
  }

  .bg-box-cta {
    margin: 24px;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 36px;
    line-height: 44px;
  }

  .header-details {
    font-size: 20px;
    line-height: 30px;
  }

  .cta-primary,
  .cta-secondary,
  .cta-tertiary {
    font-size: 16px;
    height: 40px;
  }

  li {
    font-size: 14px;
  }
}
</style>
