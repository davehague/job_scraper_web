<template>
  <FloatingBackButton :action="cancel" />
  <div class="onboarding-container">
    <p class="mobile-status">{{ currentScreen }} / {{ totalScreens }}</p>
    <div class="sidebar">
      <ul>
        <li :class="{ active: currentScreen === 1 }">
          <span class="checkmark-complete" v-if="currentScreen > 1">✔</span>
          <span class="checkmark" v-else></span>
          Resume
        </li>
        <li :class="{ active: currentScreen === 2 }">
          <span class="checkmark-complete" v-if="currentScreen > 2">✔</span>
          <span class="checkmark" v-else></span>
          Role Information
        </li>
        <li :class="{ active: currentScreen === 3 }">
          <span class="checkmark-complete" v-if="currentScreen > 3">✔</span>
          <span class="checkmark" v-else></span>
          Additional Search Info
        </li>
        <li :class="{ active: currentScreen === 4 }">
          <span class="checkmark-complete" v-if="currentScreen > 4">✔</span>
          <span class="checkmark" v-else></span>
          About You
        </li>
      </ul>
    </div>
    <div class="container">
      <!-- Resume -->
      <OnboardingScreen v-if="currentScreen === 1" :onSubmit="submitResume"
        :isLastScreen="currentScreen === totalScreens" :showBackButton="currentScreen > 1" :onBack="handleBack"
        :isSubmitting="isSubmitting" :validateForm="validateResumeForm">

        <template #default>
          <h2>Welcome, we're glad you're here. Let's get started.</h2>
          <p class="instructions">Paste your up-to-date resume below to help us tailor your job recommendations to your
            skills and experience.

          </p>
          <textarea v-model="formData.resume" rows="20" style="width: 100%;"
            placeholder="Paste your resume here"></textarea>
          <div>
            <input type="file" @change="handleFileUpload" accept=".pdf" />
            <button @click="uploadFile" :disabled="!file">Upload Resume</button>
          </div>
        </template>
      </OnboardingScreen>

      <!-- Role information -->
      <OnboardingScreen v-if="currentScreen === 2" :onSubmit="submitRoleInfo"
        :isLastScreen="currentScreen === totalScreens" :showBackButton="currentScreen > 1" :onBack="handleBack"
        :isSubmitting="isSubmitting" :validateForm="validateRoleInfoForm">
        <h2>Tell us some basics about the role you want</h2>
        <p class="instructions">This helps us filter out jobs that don't fit your current needs</p>

        <div class="label-container">
          <label>Job Titles (top 3, comma separated)</label>
        </div>
        <input v-model="formData.jobTitles" type="text" :placeholder=jobTitlesPlaceholder />

        <label for="remote-preference">Remote/hybrid/onsite</label>
        <select id="remote-preference" v-model="formData.remotePreference">
          <option value="YES">Remote OK</option>
          <option value="ONLY">Remote ONLY</option>
          <option value="NO">Local ONLY</option>
        </select>

        <div class="left-right-container" v-if="formData.remotePreference !== 'ONLY'">
          <div class="left">
            <label>Location</label>
            <input id="location" v-model="formData.location" type="text" placeholder="City, state, country">
          </div>
          <div class="right">
            <label>Distance (miles)</label>
            <input id="distance" v-model="formData.distance" type="text" placeholder="20">
          </div>

        </div>

        <div class="left-right-container">
          <div class="left">
            <div class="label-container">
              <label>Minimum Salary (US dollars)</label>
            </div>
            <input v-model="formData.minSalary" type="text" placeholder="Minimum salary" @blur="formatMinSalary"
              @focus="removeFormatting" />
          </div>
          <div class="right"></div>
        </div>
      </OnboardingScreen>

      <!-- Additional search info -->
      <OnboardingScreen v-if="currentScreen === 3" :onSubmit="submitAdditionalSearchInfo"
        :isLastScreen="currentScreen === totalScreens" :showBackButton="currentScreen > 1" :onBack="handleBack"
        :validateForm="validateAdditionalSearchInfoForm" :isSubmitting="isSubmitting">
        <h2>Now, let's dig into what you're looking for</h2>
        <p class="instructions">This will help us find the best matches for your career goals. Use commas to separate
          entries in each field.</p>

        <div class="label-container">
          <label>List the top 2-5 skills that show that a job is a good fit for you</label>
        </div>
        <input v-model="formData.skillWords" type="text" :placeholder=skillWordsPlaceholder />

        <div class="label-container">
          <label>List 2-5 skills that show that a job is a NOT a good fit for you</label>
        </div>
        <input v-model="formData.skillStopWords" type="text" :placeholder=skillStopWordsPlaceholder />

        <div class="label-container">
          <label>List any job titles or descriptors (senior, manager, etc.) that you're NOT looking for</label>
        </div>
        <input v-model="formData.stopWords" type="text" :placeholder=stopWordsPlaceholder />

        <div class="label-container">
          <label>List any must haves (health insurance, 401k, bonus, etc.)</label>
        </div>
        <input v-model="formData.candidateRequirements" type="text" placeholder="Enter other requirements" />
      </OnboardingScreen>

      <!-- About you -->
      <OnboardingScreen v-if="currentScreen === 4" :onSubmit="submitAboutYou"
        :isLastScreen="currentScreen === totalScreens" :showBackButton="currentScreen > 1" :onBack="handleBack"
        :isSubmitting="isSubmitting" :validateForm="validateAboutYouForm">

        <template #default>
          <h2>Finally, tell us a little bit about yourself</h2>
          <label for="name">Name</label>
          <input id="name" v-model="formData.name" type="text" placeholder="Enter your name">

          <label for="intention">Where are you in your job search?</label>
          <div class="checkbox-rows">
            <div class="checkbox-row">
              <input type="checkbox" id="curious" name="intention" value="curious" v-model="formData.intentions">
              <label for="curious">Just curious about the market and what's out there</label>
            </div>
            <div class="checkbox-row">
              <input type="checkbox" id="new-grad" name="intention" value="new-grad" v-model="formData.intentions">
              <label for="new-grad">New grad or career changer looking for my first role</label>
            </div>
            <div class="checkbox-row">
              <input type="checkbox" id="passive-employed" name="intention" value="passive-employed"
                v-model="formData.intentions">
              <label for="passive-employed">Currently employed and passively looking for my next role -- I'll apply if
                the right opportunity comes to my attention</label>
            </div>
            <div class="checkbox-row">
              <input type="checkbox" id="active-employed" name="intention" value="active-employed"
                v-model="formData.intentions">
              <label for="active-employed">Currently employed but actively ready to move on</label>
            </div>
            <div class="checkbox-row">
              <input type="checkbox" id="active-unemployed" name="intention" value="active-unemployed"
                v-model="formData.intentions">
              <label for="active-unemployed">Experienced but unemployed and actively looking for my next role</label>
            </div>
          </div>

          <label>Email notifications</label>
          <div class="checkbox-rows">
            <div class="checkbox-row">
              <input type="radio" id="never" name="email" value="never" v-model="formData.sendEmails">
              <label for="never">Never</label>
            </div>
            <div class="checkbox-row">
              <input type="radio" id="daily" name="email" value="daily" v-model="formData.sendEmails">
              <label for="daily">Daily (default)</label>
            </div>
            <div class="checkbox-row">
              <input type="radio" id="immediately" name="email" value="immediately" v-model="formData.sendEmails">
              <label for="immediately">Instantaneous</label>
            </div>
          </div>
        </template>
      </OnboardingScreen>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import PersistentDataService from '@/services/PersistentDataService';
import { useJsaStore } from '@/stores/jsaStore';
import { type User, type UserConfig } from '@/types/interfaces';
import { shouldRedirectToOnboarding, consolidateText, isNumeric } from '@/utils/helpers';

const router = useRouter();
const store = useJsaStore();

const currentScreen = ref(1);
const totalScreens = ref(4);

const isSubmitting = ref(false);

onMounted(async () => {
  const userShouldOnboard = await shouldRedirectToOnboarding();
  if (userShouldOnboard) {
    router.push("/onboarding");
  } else {
    router.push("/home");
  }
});

const formData = ref({
  resume: '',
  name: '',
  remotePreference: 'YES',
  location: '',
  distance: 20,
  jobTitles: '',
  stopWords: '',
  skillWords: '',
  skillStopWords: '',
  candidateRequirements: '',
  minSalary: '',
  sendEmails: 'daily',
  intentions: [],
});

const file = ref<File | null>(null)

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    file.value = target.files[0]
  }
}

const uploadFile = async () => {
  if (!file.value) {
    console.log('Please select a file first.');
    return
  }

  const resumeData = new FormData()
  resumeData.append('pdfs', file.value)

  try {
    const response = await fetch('/api/upload-resume', {
      method: 'POST',
      body: resumeData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.statusMessage || 'Upload failed')
    }

    const result = await response.json()
    console.log('Upload successful:', result)
    
    formData.value.resume = result.text;
  } catch (error) {
    console.error('Upload error:', error)
  }
}

const cancel = () => {
  store.signOutUser();
  router.push('/login')
}

let jobTitlesPlaceholder = 'Enter job titles ';
let stopWordsPlaceholder = 'Exclude titles with certain keywords ';
let skillWordsPlaceholder = 'Keywords to look for in a job description ';
let skillStopWordsPlaceholder = 'Keywords to avoid in a job description ';

const validateResumeForm = () => {
  const minLengthValidation = formData.value.resume.trim().length < 500 ? ['Please expand upon your experience, education, and goals (min length is 500 characters).'] : [];
  const maxLengthValidation = formData.value.resume.trim().length > 15000 ? ['Please shorten your resume (max lengh is 15,000 characters).'] : [];
  return [...minLengthValidation, ...maxLengthValidation];
};

const submitResume = async () => {
  console.log('Submitting resume...');
  isSubmitting.value = true;
  const loggedInUser = await store.getAuthUser();
  const uid = loggedInUser?.id;
  console.log('User ID:', uid);
  if (!uid || uid === '') return;

  const fullResume = `${formData.value.resume}`;
  const baseUser = {
    id: uid,
    resume: fullResume,
  };

  try {
    const result = await PersistentDataService.upsertUser(baseUser as User);
    console.log(result);

    let suggestedConfigsResult = await getSuggestedUserConfigs(formData.value.resume);
    let content = suggestedConfigsResult;
    console.log('Suggested configs:', content);

    let values = content.split('\n');
    if (values.length === 4) {

      let configs = values.map((v: string) => v.split(':').map((item: string) => item.trim()));
      let valid = configs.every((config: string[]) => config.length === 2);
      if (valid) {
        jobTitlesPlaceholder = cleanSuggestedTextFromPlaceholder(jobTitlesPlaceholder) + `(e.g. ${configs[0][1]})`;
        stopWordsPlaceholder = cleanSuggestedTextFromPlaceholder(stopWordsPlaceholder) + `(e.g. ${configs[1][1]})`;
        skillWordsPlaceholder = cleanSuggestedTextFromPlaceholder(skillWordsPlaceholder) + `(e.g. ${configs[2][1]})`;
        skillStopWordsPlaceholder = cleanSuggestedTextFromPlaceholder(skillStopWordsPlaceholder) + `(e.g. ${configs[3][1]})`;
      }
    }
  } catch (error) {
    console.error('Error in processing:', error);
  } finally {
    console.log('Resume saved successfully');
    await handleSubmit();
  }
};

const cleanSuggestedTextFromPlaceholder = (text: string) => {
  return text.substring(0, text.indexOf('(e.g.') > 0 ? text.indexOf('(e.g.') : text.length);
};

const getSuggestedUserConfigs = async (resume: string) => {
  const prompt = `
You are a helpful no-nonsense assistant. You listen to directions carefully and follow them to the letter. 

Given the following user resume: <resume>${consolidateText(resume)}</resume>
Answer the following in a bulleted list
Job Titles: What would the top three job titles this candidate may be looking for? Use a comma separated list
Stop Words: What are a few words or title modifiers that may appear in the title of a job that would signify a bad job fit for this person? Use a comma separated list
Skill Words: What a a few skills that this person would see in a job posting that would let them know it's a good fit? Use a comma separated list
Skill Stop Words: What are a few skills that this person could see in a job posting that would let them know it's NOT a good fit? Use a comma separated list

Example (sales development representative):
Job Titles: SDR, Sales Development Representative, Business Development Representative
Stop words: Account Executive, Account Manager, Sales Manager
Skill words: Cold calling, CRM, SalesForce
Skill Stop Words: Marketing, Product Management, Software Development

Fill out this form below, and nothing else for the user based on their resume.  Do not give explanations, and keep each line short and to the point.
Job Titles: (your answer in comma separated list format)
Stop words: (your answer in comma separated list format)
Skill words: (your answer in comma separated list format)
Skill Stop Words: (your answer in comma separated list format)
`;
  try {
    const response = await fetch('/api/openrouter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-haiku",
        max_tokens: 100,
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

const validateRoleInfoForm = () => {
  const jobTitlesMinLength = formData.value.jobTitles.trim().length == 0 ? ['Please enter at least one job title to continue.'] : [];
  const jobTitlesMaxLength = formData.value.jobTitles.trim().length > 300 ? ['Please enter a maximum of 300 characters for job titles.'] : [];
  const jobTitlesMaxCount = formData.value.jobTitles.split(',').length > 3 ? ['Please enter a maximum of three job titles.'] : [];

  const locationMinLength = formData.value.remotePreference != 'ONLY' && formData.value.location.trim().length == 0 ? ['Please enter a location to continue.'] : [];
  const locationMaxLength = formData.value.location.trim().length > 200 ? ['Please enter a maximum of 200 characters for location.'] : [];

  const distanceIsNumeric = !isNumeric(formData.value.distance) ? ['Please enter a numeric value for distance.'] : [];
  const distanceMinValue = formData.value.remotePreference != 'ONLY' && formData.value.distance <= 0 ? ['Please enter a positive integer for distance.'] : [];
  const distanceMaxValue = formData.value.remotePreference != 'ONLY' && formData.value.distance > 200 ? ['Maximum distance is 200 miles.'] : [];

  const salaryMinValue = minSalary.value < 0 ? ['Please enter a positive integer for salary.'] : [];
  const salaryMaxValue = minSalary.value > 1000000 ? ['Maximum salary value is $1,000,000.'] : [];

  return [...jobTitlesMinLength, ...jobTitlesMaxLength, ...jobTitlesMaxCount,
  ...locationMinLength, ...locationMaxLength,
  ...distanceIsNumeric, ...distanceMinValue, ...distanceMaxValue,
  ...salaryMinValue, ...salaryMaxValue];
};

const submitRoleInfo = async () => {
  isSubmitting.value = true;
  const loggedInUser = await store.getAuthUser();
  const uid = loggedInUser?.id;
  console.log('User ID:', uid);
  if (!uid || uid === '') return;

  const baseUser = {
    id: uid,
    remote_preference: formData.value.remotePreference,
    location: formData.value.location,
    distance: formData.value.distance,
    min_salary: minSalary.value,
  };

  try {
    const result = await PersistentDataService.upsertUser(baseUser as User)
    console.log('User updated: ', result);

    await clearConfigsByKey(uid, 'job_titles');
    const titles = createConfigs(uid, 'job_titles', formData.value.jobTitles, 3);
    await performInsert(titles);

  } catch (error) {
    console.error('Error in processing:', error);
  } finally {
    console.log('Role info saved successfully');
    await handleSubmit();
  }
};

const validateAdditionalSearchInfoForm = () => {
  const skillWordsMaxLength = formData.value.skillWords.trim().length > 300 ? ['Please enter a maximum of 300 characters for good-fit skill words.'] : [];
  const skillStopWordsMaxLength = formData.value.skillStopWords.trim().length > 300 ? ['Please enter a maximum of 300 characters for non-fit skill stop words.'] : [];
  const stopWordsMaxLength = formData.value.stopWords.trim().length > 300 ? ['Please enter a maximum of 300 characters for job and title descriptors.'] : [];
  const candidateRequirementsMaxLength = formData.value.candidateRequirements.trim().length > 300 ? ['Please enter a maximum of 300 characters for must havese.'] : [];

  return [...skillWordsMaxLength, ...skillStopWordsMaxLength, ...stopWordsMaxLength, ...candidateRequirementsMaxLength];
};

const submitAdditionalSearchInfo = async () => {
  console.log('Submitting job info:', formData.value.jobTitles);
  isSubmitting.value = true;

  const loggedInUser = await store.getAuthUser();
  const uid = loggedInUser?.id;
  console.log('User ID:', uid);
  if (!uid || uid === '') return;

  try {
    await clearConfigsByKey(uid, 'skill_words');
    const skillWords = createConfigs(uid, 'skill_words', formData.value.skillWords);
    await performInsert(skillWords);

    await clearConfigsByKey(uid, 'skill_stop_words');
    const skillStopWords = createConfigs(uid, 'skill_stop_words', formData.value.skillStopWords);
    await performInsert(skillStopWords);

    await clearConfigsByKey(uid, 'stop_words');
    const stopWords = createConfigs(uid, 'stop_words', formData.value.stopWords);
    await performInsert(stopWords);

    await clearConfigsByKey(uid, 'candidate_requirements');
    const candidateRequirements = createConfigs(uid, 'candidate_requirements', formData.value.candidateRequirements);
    await performInsert(candidateRequirements);

  } catch (error) {
    console.error('Error in processing:', error);
  } finally {
    console.log('Additional search info saved successfully');
    await handleSubmit();
  }
};

const validateAboutYouForm = () => {
  const nameMinLength = formData.value.name.trim().length == 0 ? ['Please enter your name to continue.'] : [];
  const nameMaxLength = formData.value.name.trim().length > 150 ? ['Please enter a maximum of 150 characters for your name.'] : [];

  const intentionsValidation = formData.value.intentions.length > 0 ? [] : ['Please select at least one intention to continue.'];
  return [...nameMinLength, ...nameMaxLength, ...intentionsValidation];
};

const submitAboutYou = async () => {
  isSubmitting.value = true;
  const loggedInUser = await store.getAuthUser();
  const uid = loggedInUser?.id;
  console.log('User ID:', uid);
  if (!uid || uid === '') return;

  const baseUser = {
    id: uid,
    name: formData.value.name,
    send_emails: formData.value.sendEmails,
    intentions: formData.value.intentions.join(','),
  };

  try {
    const result = await PersistentDataService.upsertUser(baseUser as User)
    console.log('User updated: ', result);
    generateJobs(uid); // Intentionally not awaiting this

  } catch (error) {
    console.error('Error in processing:', error);
  } finally {
    console.log('About you saved successfully');
    await handleSubmit();
  }
};

const generateJobs = (uid: string) => {
  console.log('Generating jobs for user...');
  // Intentionally not awaiting this
  const resumePlus = `
    <full_resume>${formData.value.resume}</full_resume>\n
    <user_intentions>${formData.value.intentions.join(',')}</user_intentions>\n
    <desired_job_keywords>${formData.value.skillWords}</desired_job_keywords>\n
    <undesired_job_keywords>${formData.value.skillStopWords}</undesired_job_keywords>\n
    <desired_job_titles>${formData.value.jobTitles}</desired_job_titles>\n
    <undesired_job_titles>${formData.value.stopWords}</undesired_job_titles>\n
    `;

  const gcpResponse = fetch('/api/onboarding', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id: uid, resume: resumePlus }),
  });
}

const clearConfigsByKey = async (uid: string, key: string) => {
  try {
    const configs = await PersistentDataService.fetchUserConfigsByKey(uid, key);

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

const performInsert = async (configs: UserConfig[]) => {
  for (const config of configs) {
    await PersistentDataService.insertUserConfig(config);
  }
};

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
    router.push({ path: '/home', query: { onboarding: 'true' } });
  } else {
    currentScreen.value++;
  }
  isSubmitting.value = false;
};

const handleBack = () => {
  if (currentScreen.value > 1) {
    currentScreen.value--;
  }
};

const minSalary = ref(0);
const formatMinSalary = () => {
  const numericValue = parseInt(formData.value.minSalary.replace(/[^0-9]/g, ''));
  minSalary.value = isNaN(numericValue) ? 0 : numericValue;
  formData.value.minSalary = minSalary.value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

const removeFormatting = () => {
  formData.value.minSalary = minSalary.value.toString();
};
</script>

<style scoped>
.onboarding-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
}

.container {
  display: flex;
  height: 70vh;
  flex: 1;
  padding: 20px;
}

/* Sidebar */
.sidebar {
  margin-left: 20px;
  height: 70vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: start;
}

.mobile-status {
  display: none;
  margin-top: 64px;
}

@media (max-width: 768px) {
  .onboarding-container {
    flex-direction: column;
  }
  .mobile-status {
    display: block;
  }
  .sidebar {
    display: none;
    background-color: red;
  }
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar li {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.sidebar li:hover {
  cursor: default;
}

.sidebar li.active {
  font-weight: bold;
}

li .checkmark,
li .checkmark-complete {
  width: 20px;
  height: 20px;
  border: 1px solid #000;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 5px;
}

.checkmark-complete {
  color: #28a745;
  font-weight: bold;
}

/* Container */
.content {
  flex-grow: 1;
  overflow: auto;
}

h2 {
  text-align: left;
  margin-bottom: 8px;
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
  margin-top: 16px;
  margin-bottom: 4px;
}

input[type="text"],
input[type="email"],
input[type="number"],
input[type="checkbox"],
input[type="radio"],
select,
textarea {
  margin-bottom: 16px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
  box-sizing: border-box;
}

/* Role information Onboarding screen */
.left-right-container {
  display: flex;
  flex-direction: row;
  gap: 20px;
  justify-content: space-between
}

.left {
  display: flex;
  flex-direction: column;
  width: 70%;
}

.right {
  display: flex;
  flex-direction: column;
  width: 30%;
}

/* Abput you Onboarding screen */
.checkbox-rows {
  margin-top: 8px;
}

.checkbox-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 20px;
}

.checkbox-row label {
  margin: 0;
  display: flex;
  font-weight: 400;
  flex: 1;
}

.checkbox-row input {
  flex: 0;
}
</style>