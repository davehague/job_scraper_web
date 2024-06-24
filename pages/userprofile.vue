<template>
  <button @click="cancel" class="back-btn">
    <i class="fas fa-arrow-left"></i>
  </button>

  <div class="user-profile">
    <h2>Personal Info</h2>
    <div>
      <label>Name:</label>
      <input v-model="name" type="text" />
    </div>
    <div>
      <label>Email:</label>
      <input v-model="email" type="email" disabled />
    </div>
    <div>
      <label>
        Send me emails about new jobs</label>
      <select v-model="emailFrequency">
        <option value="never">Never</option>
        <option value="daily">Daily</option>
        <option value="immediately">Immediately</option>
      </select>
    </div>

    <h2>Professional Info</h2>
    <div>

      <div class="label-container">
        <label>Job Titles (top 3, comma separated):</label>
        <InfoTooltip
          text="What are the top 3 job titles you'd like to target?  If you don't know, you can simply list your recent job titles.  
          This is what you would type into a job search engine. There may be some overlap and duplication in the titles." />
      </div>
      <input v-model="jobTitles" type="text" placeholder="Enter job titles" />
    </div>

    <div>
      <label>Remote:</label>
      <select v-model="remotePreference">
        <option value="YES">Remote OK</option>
        <option value="ONLY">Remote ONLY</option>
        <option value="NO">Local ONLY</option>
      </select>
    </div>
    <div v-if="remotePreference !== 'ONLY'">
      <label>Location (City, State, Country):</label>
      <input v-model="location" type="text" />
      <label>Distance (miles):</label>
      <input v-model="distance" type="number" />
    </div>

    <div>
      <div class="label-container">
        <label>Stop Words (comma separated):</label>
        <InfoTooltip text="Are there any words that would appear in the TITLE of a job that would let you know you DON'T want that job?  We won't show you jobs where your stop words appear in the title.
          <br><br><b>Example:</b> If you're looking for your first developer job, you don't want jobs that say 'Senior', 'Sr.', or 'III' 
          in the title <br><br><b>Example</b>: If you don't want to be a manager you would ask to filter out jobs with 'manager', 'supervisor', 
          or 'lead' in the title." />
      </div>
      <input v-model="stopWords" type="text" placeholder="Enter stop words" />
    </div>
    <div>
      <div class="label-container">
        <label>Skill Words (comma separated):</label>
        <InfoTooltip text="Are there any words that would appear in the DESCRIPTION of a job that would let you know you've got a good fit?  List 2-5 examples.  This will only improve results, not disqualify jobs.<br><br>
              <b>Example:</b>  I'm a CNC machinist.  I'll know I've got a potentially good job if I see the words 'CNC', 'CAM programming' 
              or 'PLC programming'<br><br><b>Example:</b>  I'm a developer.  I'll know I've got a potentially good job if I see the words 'Java', 
              'Agile',  or 'Pull requests'." />
      </div>
      <input v-model="skillWords" type="text" placeholder="Enter skill words" />
    </div>
    <div>
      <div class="label-container">
        <label>Other Requirements (comma separated):</label>
        <InfoTooltip text="Are there any other requirements you absolutely need the job to have?  Health insurance, 401k, education assistance, etc?  
          Not all jobs list these things, but we can highlight the ones that do. This will only improve results, not disqualify jobs." />
      </div>
      <input v-model="candidateRequirements" type="text" placeholder="Enter other requirements" />
    </div>

    <div>

      <div class="label-container">
        <label>Minimum Salary:</label>
        <InfoTooltip
          text="If the job lists the salary, we won't show it to you if the max offer is below your minimum." />
      </div>
      <input v-model="minSalaryInput" type="text" @blur="formatMinSalary" @focus="removeFormatting" />

    </div>

    <div>
      <div class="label-container">
        <label>Resume:</label>
        <InfoTooltip
          text="We'll use your resume to match your particular skills against each and every job we show you." />
      </div>
      <textarea v-model="resume" rows="10"></textarea>
    </div>

    <button @click="save">Save</button>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useJsaStore } from '@/stores/jsaStore';
import PersistentDataService from '@/services/PersistentDataService';
import { type User, type UserConfig } from '@/types/interfaces';
import InfoTooltip from '@/components/InfoTooltip.vue';

const store = useJsaStore();
const router = useRouter();

const email = ref('');
const emailFrequency = ref('never');

const location = ref('');
const remotePreference = ref('YES');
const distance = ref(0);
const minSalary = ref(0);
const resume = ref('');
const name = ref('');

const jobTitles = ref('');
const stopWords = ref('');
const skillWords = ref('');
const candidateRequirements = ref('');

let userConfigs = ref<UserConfig[]>([]);

const minSalaryInput = ref('');
const formatMinSalary = () => {
  const numericValue = parseInt(minSalaryInput.value.replace(/[^0-9]/g, ''));
  minSalary.value = isNaN(numericValue) ? 0 : numericValue;
  minSalaryInput.value = minSalary.value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

const removeFormatting = () => {
  minSalaryInput.value = minSalary.value.toString();
};

async function save() {
  const uid = store.authUser?.id || '';
  if (!uid || uid === '') return;

  if (store.selectedUserId.length > 0 && (uid != store.selectedUserId)) {
    console.error('Unauthorized to save user profile');
    return;
  }

  const baseUser = {
    id: uid,
    location: location.value,
    remote_preference: remotePreference.value,
    distance: distance.value,
    min_salary: minSalary.value,
    resume: resume.value,
    name: name.value,
    send_emails: emailFrequency.value,
  };

  try {
    const result = await PersistentDataService.upsertUser(baseUser as User)

    await reconcileAndPersistConfigs('job_titles', jobTitles.value, 3);
    await reconcileAndPersistConfigs('stop_words', stopWords.value);
    await reconcileAndPersistConfigs('skill_words', skillWords.value);
    await reconcileAndPersistConfigs('candidate_requirements', candidateRequirements.value);

  } catch (error) {
    console.error('Error saving user configuration:', error);
  } finally {
    console.log('User saved successfully');
    router.push('/')
  }
}


async function reconcileAndPersistConfigs(key: string, newValue: string, maxValues = 99) {
  const { toUpdate, toInsert, toDelete } = reconcileConfigs(key, newValue);

  await performUpdate(toUpdate);
  await performInsert(toInsert);
  await performDelete(toDelete);
}

async function performUpdate(configs: UserConfig[]) {
  for (const config of configs) {
    await PersistentDataService.updateUserConfig(config);
  }
}

async function performInsert(configs: UserConfig[]) {
  for (const config of configs) {
    await PersistentDataService.insertUserConfig(config);
  }
}

async function performDelete(configs: UserConfig[]) {
  for (const config of configs) {
    await PersistentDataService.deleteUserConfig(config.id);
  }
}

function reconcileConfigs(key: string, newValue: string, maxValues = 99) {
  const uid = store.authUser?.id || '';
  if (!uid || uid === '') return { toUpdate: [], toInsert: [], toDelete: [] };

  let newValues = newValue.split(',').map(v => v.trim().toLowerCase());
  newValues = newValues.slice(0, maxValues);

  const existingConfigs = userConfigs.value.filter(config => config.key === key);

  // Create a map for quick lookup with normalized values
  const existingMap = new Map(existingConfigs.map(config => [config.string_value?.trim().toLowerCase(), config]));

  const toUpdate: UserConfig[] = [];
  const toInsert: UserConfig[] = [];
  const toDelete: UserConfig[] = existingConfigs.slice(); // Clone array

  // Process new values
  newValues.forEach((value, index) => {
    const originalValue = newValue.split(',')[index].trim(); // Preserve the original case and whitespace
    if (existingMap.has(value)) {
      const existingConfig = existingMap.get(value);
      if (!existingConfig) return;
      toUpdate.push({
        ...existingConfig,
        string_value: originalValue
      });
      // Remove from toDelete array if it exists
      const index = toDelete.indexOf(existingConfig);
      if (index > -1) {
        toDelete.splice(index, 1);
      }
    } else {
      toInsert.push({
        id: 0,
        key,
        string_value: originalValue,
        int_value: null,
        bool_value: null,
        user_id: uid,
      });
    }
  });

  return { toUpdate, toInsert, toDelete };
}

function cancel() {
  router.push('/')
}

onMounted(async () => {
  if (!store.authUser) {
    await store.getAuthUser();
  }

  await store.refreshDBUser();

  let user = store.dbUser;
  if (store.dbUser?.is_admin) {
    user = await PersistentDataService.fetchUserById(store.selectedUserId);
  }

  if (!user) {
    console.error('User not found');
    return;
  }

  name.value = user.name || '';
  email.value = user.email || '';
  emailFrequency.value = user.send_emails || 'never';
  remotePreference.value = user.remote_preference || 'YES';
  location.value = user.location || '';
  distance.value = user.distance || 0;
  resume.value = user.resume || '';
  minSalary.value = user.min_salary || 0;
  minSalaryInput.value = minSalary.value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  userConfigs.value = await PersistentDataService.fetchUserConfigs(user.id || '');

  const jobTitlesConfig = userConfigs.value.filter(config => config.key === 'job_titles');
  jobTitles.value = jobTitlesConfig.map(config => config.string_value).join(', ');

  const stopWordsConfig = userConfigs.value.filter(config => config.key === 'stop_words');
  stopWords.value = stopWordsConfig.map(config => config.string_value).join(', ');

  const skillWordsConfig = userConfigs.value.filter(config => config.key === 'skill_words');
  skillWords.value = skillWordsConfig.map(config => config.string_value).join(', ');

  const candidateRequirementsConfig = userConfigs.value.filter(config => config.key === 'candidate_requirements');
  candidateRequirements.value = candidateRequirementsConfig.map(config => config.string_value).join(', ');
});
</script>

<style scoped>
.user-profile {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background: #f9f9f9;
  border: 1px solid #ccc;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
}

.back-btn {
  position: fixed;
  top: 20px;
  left: 20px;
  padding: 10px;
  color: #333;
  background-color: #555;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.back-btn:hover {
  background-color: #333;
  color: #fff;
}

.label-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

label {
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

input:disabled {
  border: none;
  background: #f9f9f9;
}

button {
  margin-top: 20px;
  padding: 10px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

button i {
  color: white;
}
</style>
