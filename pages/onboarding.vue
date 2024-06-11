<template>
  <div>
    <!-- Resume screen -->
    <OnboardingScreen v-if="currentScreen === 1" :onSubmit="handleSubmit" :isLastScreen="currentScreen === totalScreens"
      :showBackButton="currentScreen > 1" :onBack="handleBack">

      <template #default>
        <h2>Welcome, we're glad you're here. Let's get started.</h2>
        <p class="instructions">Paste your resume here. This will help us tailor job recommendations to you.</p>
        <textarea v-model="formData.resume" rows="20" style="width: 100%;"
          placeholder="Paste your resume here"></textarea>
      </template>
    </OnboardingScreen>

    <!-- Personal info screen -->
    <OnboardingScreen v-if="currentScreen === 2" :onSubmit="handleSubmit" :isLastScreen="currentScreen === totalScreens"
      :showBackButton="currentScreen > 1" :onBack="handleBack">

      <template #default>
        <h2>Tell us a bit about you and where you want your job to be</h2>
        <p class="instructions">This helps us filter out jobs that don't fit your working style</p>
        <label for="name">Name:</label>
        <input id="name" v-model="formData.name" type="text" placeholder="Enter your name">

        <label for="remote-preference">Remote Preference:</label>
        <select id="remote-preference" v-model="formData.remotePreference">
          <option value="YES">Remote OK</option>
          <option value="ONLY">Remote ONLY</option>
          <option value="NO">Local ONLY</option>
        </select>

        <div v-if="formData.remotePreference !== 'ONLY'">
          <label>Location (City, State, Country):</label>
          <input id="location" v-model="formData.location" type="text" placeholder="e.g., Worthington, OH, USA">

          <label>Distance (miles):</label>
          <input id="distance" v-model="formData.distance" type="text" placeholder="e.g., 25">
        </div>

        <div class="checkbox-container">
          <label>
            Send me emails about new jobs
            <input type="checkbox" v-model="formData.emailConsent">
            <span class="checkmark"></span>
          </label>
        </div>
      </template>
    </OnboardingScreen>

    <!-- Job info screen -->
    <OnboardingScreen v-if="currentScreen === 3" :onSubmit="handleSubmit" :isLastScreen="currentScreen === totalScreens"
      :showBackButton="currentScreen > 1" :onBack="handleBack">
      <h2>Now, what are you looking for?</h2>
      <p class="instructions">This will really help narrow it down</p>

      <div class="label-container">
        <label>Job Titles (top 3, comma separated):</label>
        <InfoTooltip
          text="What are the top 3 job titles you'd like to target?  If you don't know, you can simply list your recent job titles.  
          This is what you would type into a job search engine. There may be some overlap and duplication in the titles." />
      </div>
      <input v-model="formData.jobTitles" type="text" placeholder="Enter job titles" />

      <div class="label-container">
        <label>Stop Words (comma separated):</label>
        <InfoTooltip text="Are there any words that would appear in the TITLE of a job that would let you know you DON'T want that job?  
          <br><br><b>Example:</b> If you're looking for your first developer job, you don't want jobs that say 'Senior', 'Sr.', or 'III' 
          in the title <br><br><b>Example</b>: If you don't want to be a manager you would ask to filter out jobs with 'manager', 'supervisor', 
          or 'lead' in the title" />
      </div>
      <input v-model="formData.stopWords" type="text" placeholder="Enter stop words" />

      <div class="label-container">
        <label>Skill Words (comma separated):</label>
        <InfoTooltip text="Are there any words that would appear in the DESCRIPTION of a job that would let you know you've got a good fit?  List 2-5 examples.<br><br>
              <b>Example:</b>  I'm a CNC machinist.  I'll know I've got a potentially good job if I see the words 'CNC', 'CAM programming' 
              or 'PLC programming'<br><br><b>Example:</b>  I'm a developer.  I'll know I've got a potentially good job if I see the words 'Java', 
              'Agile',  or 'Pull requests'" />
      </div>
      <input v-model="formData.skillWords" type="text" placeholder="Enter skill words" />

      <div class="label-container">
        <label>Other Requirements (comma separated):</label>
        <InfoTooltip text="Are there any other requirements you absolutely need the job to have?  Health insurance, 401k, education assistance, etc?  
          Not all jobs list these things, but we can highlight the ones that do." />
      </div>
      <input v-model="formData.candidateRequirements" type="text" placeholder="Enter other requirements" />

      <div class="label-container">
        <label>Minimum Salary:</label>
        <InfoTooltip
          text="If the job lists the salary, we won't show it to you if the max offer is below your minimum" />
      </div>
      <input v-model="formData.minSalaryInput" type="text" @blur="formatMinSalary" @focus="removeFormatting" />
    </OnboardingScreen>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router'
import '~/assets/checkbox.css';

const router = useRouter()

const currentScreen = ref(1);
const totalScreens = ref(3);

const formData = ref({
  resume: '',
  name: '',
  remotePreference: 'YES',
  location: '',
  distance: '',
  jobTitles: '',
  stopWords: '',
  skillWords: '',
  candidateRequirements: '',
  minSalaryInput: '',
  emailConsent: true
});

const handleSubmit = async (data) => {
  console.log('Submitting data:', data);
  if (currentScreen.value === totalScreens.value) {

    console.log('Onboarding complete.');
    router.push("/");
  } else {
    currentScreen.value++;
  }
};

const handleBack = () => {
  if (currentScreen.value > 1) {
    currentScreen.value--;
  }
};

const minSalary = ref(0);
const formatMinSalary = () => {
  const numericValue = parseInt(formData.value.minSalaryInput.replace(/[^0-9]/g, ''));
  minSalary.value = isNaN(numericValue) ? 0 : numericValue;
  formData.value.minSalaryInput = minSalary.value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

const removeFormatting = () => {
  formData.value.minSalaryInput = minSalary.value.toString();
};
</script>

<style scoped>
h2 {
  text-align: left;
  margin-bottom: 4px;
}

.instructions {
  text-align: left;
  margin: 0 0 20px 0;
}

.label-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

label {
  text-align: left;
  display: block;
  font-weight: 600;
  margin-bottom: 10px;
}

input[type="text"],
input[type="email"],
input[type="number"],
select,
textarea,
input[type="checkbox"] {
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
  box-sizing: border-box;
}
</style>