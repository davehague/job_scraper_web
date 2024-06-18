<template>
  <div>
    <!-- Resume screen -->
    <OnboardingScreen v-if="currentScreen === 1" :onSubmit="submitResume" :isLastScreen="currentScreen === totalScreens"
      :showBackButton="currentScreen > 1" :onBack="handleBack">

      <template #default>
        <h2>Welcome, we're glad you're here. Let's get started.</h2>
        <p class="instructions">Paste your resume here. This will help us tailor job recommendations to you.</p>
        <textarea v-model="formData.resume" rows="15" style="width: 100%;"
          placeholder="Paste your resume here"></textarea>
        <p class="instructions">What are you looking for in your next job?</p>
        <textarea v-model="formData.nextRole" rows="5" style="width: 100%;"
          placeholder="Are you looking to pivot to a new career? Take the next step in your current career?  Stay in the same role but switch companies?  What have you done to make progress toward your next step?"></textarea>
      </template>
    </OnboardingScreen>

    <!-- Personal info screen -->
    <OnboardingScreen v-if="currentScreen === 2" :onSubmit="submitPersonalInfo"
      :isLastScreen="currentScreen === totalScreens" :showBackButton="currentScreen > 1" :onBack="handleBack">

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

        <div class="label-container">
          <label>Minimum Salary:</label>
          <InfoTooltip
            text="If the job lists the salary, we won't show it to you if the max offer is below your minimum" />
        </div>
        <input v-model="formData.minSalaryInput" type="text" @blur="formatMinSalary" @focus="removeFormatting" />

        <div>
          <label>
            Send me emails about new jobs</label>
          <select v-model="formData.sendEmails">
            <option value="never">Never</option>
            <option value="daily">Daily</option>
            <option value="immediately">Immediately</option>
          </select>
        </div>
      </template>
    </OnboardingScreen>

    <!-- Job info screen -->
    <OnboardingScreen v-if="currentScreen === 3" :onSubmit="submitJobInfo"
      :isLastScreen="currentScreen === totalScreens" :showBackButton="currentScreen > 1" :onBack="handleBack">
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
        <InfoTooltip text="Are there any words that would appear in the TITLE of a job that would let you know you DON'T want that job?  We won't show you jobs where your stop words appear in the title.
          <br><br><b>Example:</b> If you're looking for your first developer job, you don't want jobs that say 'Senior', 'Sr.', or 'III' 
          in the title <br><br><b>Example</b>: If you don't want to be a manager you would ask to filter out jobs with 'manager', 'supervisor', 
          or 'lead' in the title." />
      </div>
      <input v-model="formData.stopWords" type="text" placeholder="Enter stop words" />

      <div class="label-container">
        <label>Skill Words (comma separated):</label>
        <InfoTooltip text="Are there any words that would appear in the DESCRIPTION of a job that would let you know you've got a good fit?  List 2-5 examples.  This will only improve results, not disqualify jobs.<br><br>
              <b>Example:</b>  I'm a CNC machinist.  I'll know I've got a potentially good job if I see the words 'CNC', 'CAM programming' 
              or 'PLC programming'<br><br><b>Example:</b>  I'm a developer.  I'll know I've got a potentially good job if I see the words 'Java', 
              'Agile',  or 'Pull requests'." />
      </div>
      <input v-model="formData.skillWords" type="text" placeholder="Enter skill words" />

      <div class="label-container">
        <label>Other Requirements (comma separated):</label>
        <InfoTooltip
          text="Are there any other requirements you absolutely need the job to have?  Health insurance, 401k, education assistance, etc?  
          Not all jobs list these things, but we can highlight the ones that do. This will only improve results, not disqualify jobs." />
      </div>
      <input v-model="formData.candidateRequirements" type="text" placeholder="Enter other requirements" />
    </OnboardingScreen>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import PersistentDataService from '@/services/PersistentDataService';
import { useJsaStore } from '@/stores/jsaStore';
import { type User, type UserConfig } from '@/types/interfaces';
import { shouldRedirectToOnboarding, consolidateText } from '@/utils/helpers.ts';

const router = useRouter();
const store = useJsaStore();

const currentScreen = ref(1);
const totalScreens = ref(3);

onMounted(async () => {
  const userShouldOnboard = await shouldRedirectToOnboarding();
  if (userShouldOnboard) {
    router.push("/onboarding");
  } else {
    router.push("/");
  }
});

const formData = ref({
  resume: '',
  nextRole: '',
  name: '',
  remotePreference: 'YES',
  location: '',
  distance: 20,
  jobTitles: '',
  stopWords: '',
  skillWords: '',
  candidateRequirements: '',
  minSalaryInput: '',
  sendEmails: 'daily'
});

const submitResume = async () => {
  console.log('Submitting resume...');
  const loggedInUser = await store.getAuthUser();
  const uid = loggedInUser?.id;
  console.log('User ID:', uid);
  if (!uid || uid === '') return;

  const fullResume = `${formData.value.resume}\n\n${formData.value.nextRole}`;
  const baseUser = {
    id: uid,
    resume: fullResume,
  };

  try {
    const result = await PersistentDataService.upsertUser(baseUser as User);
    console.log(result);

    let suggestedConfigsResult = await getSuggestedUserConfigs(formData.value.resume, formData.value.nextRole);
    let content = suggestedConfigsResult;
    console.log('Suggested configs:', content);

    let values = content.split('\n');
    if (values.length === 4) {

      let configs = values.map((v: string) => v.split(':').map((item: string) => item.trim()));
      let valid = configs.every((config: string[]) => config.length === 2);
      if (valid) {
        formData.value.jobTitles = configs[0][1];
        formData.value.stopWords = configs[1][1];
        formData.value.skillWords = configs[2][1];
        formData.value.candidateRequirements = configs[3][1];
      }
    }
  } catch (error) {
    console.error('Error in processing:', error);
  } finally {
    console.log('User saved successfully');
    await handleSubmit();
  }
};

const getSuggestedUserConfigs = async (resume: string, nextRole: string) => {
  const prompt = `
Given the following user resume: <resume>${consolidateText(resume)}</resume>
And what the user is looking for in their next role: <nextRole>${nextRole}</nextRole>
Answer the following in a bulleted list
Job Titles: What would the top 3 job titles this candidate may be looking for? Use a comma separated list
Stop Words: What are 3 words, phrases, or title modifiers that may appear in the title of a job that a job search engine might find but wouldn't actually be a good job fit for this person? Use a comma separated list
Skill Words: What are 3 words, phrases, or skills that this person would see in a job posting that would let them know it's a good fit? Use a comma separated list
Must Haves: What are 3 company "must haves" that this person may desire. Be creative here. Use a comma separated list

For each of the above, only include a single sentence response with no explanation and format it in a comma separated list

Example:
Job Titles: Job Title 1, Job Title 2, Job Title 3
Stop words: Senior, Manager, Lead
Skill words: Software Development Lifecycle (SDLC), Agile, Software Testing
Must Haves: 401k, health insurance, focus on training
`;
  try {
    const response = await fetch('/api/openrouter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct:free",
        messages: [
          { role: "user", content: prompt }
        ],
      }),
    });

    console.log('API response:', response);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const responseData = await response.json();
    console.log('API response data:', responseData);

    if (responseData.success) {
      return responseData.data.choices[0].message.content;

    } else {
      console.error('Error from OpenRouter:', responseData.message);
      return "\n";
    }
  } catch (error) {
    console.error('Failed to fetch suggested configs:', error);
    return "\n";
  }
};


const submitPersonalInfo = async () => {
  const loggedInUser = await store.getAuthUser();
  const uid = loggedInUser?.id;
  console.log('User ID:', uid);
  if (!uid || uid === '') return;

  const baseUser = {
    id: uid,
    name: formData.value.name,
    remote_preference: formData.value.remotePreference,
    location: formData.value.location,
    distance: formData.value.distance,
    send_emails: formData.value.sendEmails,
    min_salary: minSalary.value,
  };

  try {
    const result = await PersistentDataService.upsertUser(baseUser as User)
    console.log(result);
  } catch (error) {
    console.error('Error saving user configuration:', error);
  } finally {
    console.log('User saved successfully');
    await handleSubmit();
  }
};

const submitJobInfo = async () => {
  console.log('Submitting job info:', formData.value.jobTitles);

  const loggedInUser = await store.getAuthUser();
  const uid = loggedInUser?.id;
  console.log('User ID:', uid);
  if (!uid || uid === '') return;

  try {
    clearConfigs(uid);

    const titles = createConfigs(uid, 'job_titles', formData.value.jobTitles, 3);
    performInsert(titles);

    const stopWords = createConfigs(uid, 'stop_words', formData.value.stopWords);
    performInsert(stopWords);

    const skillWords = createConfigs(uid, 'skill_words', formData.value.skillWords);
    performInsert(skillWords);

    const candidateRequirements = createConfigs(uid, 'candidate_requirements', formData.value.candidateRequirements, 3);
    performInsert(candidateRequirements);

    generateJobs(uid);

  } catch (error) {
    console.error('Error saving user configuration:', error);
  } finally {
    console.log('User saved successfully');
    await handleSubmit();
  }
};

const generateJobs = (uid: string) => {
  console.log('Generating jobs for user...');
  // Intentionally not awaiting this
  const gcpResponse = fetch('/api/onboarding', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id: uid, resume: formData.value.resume }),
  });
}

const clearConfigs = async (uid: string) => {
  try {
    const configs = await PersistentDataService.fetchUserConfigs(uid);

    if (configs.length === 0) return;
    else { console.log('Deleting user configuration:', configs); }

    for (const config of configs) {
      await PersistentDataService.deleteUserConfig(config.id);
    }
  } catch (error) {
    console.error('Error deleting user configuration:', error);
  }
};

const createConfigs = (uid: string, key: string, newValue: string, maxValues = 99) => {
  let configs = [];
  let newValues = newValue.split(',').map(v => v.trim().toLowerCase());
  newValues = newValues.slice(0, maxValues);

  for (let i = 0; i < newValues.length; i++) {
    configs.push({
      id: 0,
      key,
      string_value: newValues[i],
      int_value: null,
      bool_value: null,
      user_id: uid,
    });
  }

  return configs;
};

async function performInsert(configs: UserConfig[]) {
  for (const config of configs) {
    await PersistentDataService.insertUserConfig(config);
  }
}

const updateUserCompletedOnboarding = async () => {
  const loggedInUser = await store.getAuthUser();
  const uid = loggedInUser?.id;
  console.log('User ID:', uid);
  if (!uid || uid === '') return;

  const baseUser = {
    id: uid,
    onboarding_complete: true
  };

  try {
    const result = await PersistentDataService.upsertUser(baseUser as User)
    console.log(result);
  } catch (error) {
    console.error('Error updating user onboarding status:', error);
  } finally {
    console.log('User onboarding status updated successfully');
    await store.refreshDBUser();
  }
};

const handleSubmit = async () => {
  console.log('Handling submit...', currentScreen.value, totalScreens.value);
  if (currentScreen.value === totalScreens.value) {
    console.log('Onboarding complete.');
    await updateUserCompletedOnboarding();
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