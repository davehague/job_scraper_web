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

    <h2>Professional Info</h2>
    <div>
      
      <div class="label-container">
        <label>Job Titles (comma separated):</label>
        <InfoTooltip
          text="What are the top 3 job titles you'd like to target?  If you don't know, you can simply list your recent job titles.  This is what you would type into a job search engine. There may be some overlap and duplication in the titles." />
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
      <label>Location:</label>
      <input v-model="location" type="text" />
      <label>Distance (miles):</label>
      <input v-model="distance" type="number" />
    </div>

    <div>
      <div class="label-container">
        <label>Stop Words (comma separated):</label>
        <InfoTooltip
          text="Are there any words that would appear in the TITLE of a job that would let you know you DON'T want that job?  
          <br><br><b>Example:</b> If you're looking for your first developer job, you don't want jobs that say 'Senior', 'Sr.', or 'III' 
          in the title <br><br><b>Example</b>: If you don't want to be a manager you would ask to filter out jobs with 'manager', 'supervisor', 
          or 'lead' in the title" />
      </div>
      <input v-model="stopWords" type="text" placeholder="Enter stop words" />
    </div>
    <div>
      <div class="label-container">
        <label>Skill Words (comma separated):</label>
        <InfoTooltip
          text="Are there any words that would appear in the DESCRIPTION of a job that would let you know you've got a good fit?  List 2-5 examples.<br><br>
              <b>Example:</b>  I'm a CNC machinist.  I'll know I've got a potentially good job if I see the words 'CNC', 'CAM programming' 
              or 'PLC programming'<br><br><b>Example:</b>  I'm a developer.  I'll know I've got a potentially good job if I see the words 'Java', 
              'Agile',  or 'Pull requests'" />
      </div>
      <input v-model="skillWords" type="text" placeholder="Enter skill words" />
    </div>
    <div>
      <div class="label-container">
        <label>Other Requirements (comma separated):</label>
        <InfoTooltip
          text="Are there any other requirements you absolutely need the job to have?  Health insurance, 401k, salary or hourly rate requirements?  Not all jobs list these things, but we can filter out the ones that do (and are too low, in the case of pay)." />
      </div>
      <input v-model="candidateRequirements" type="text" placeholder="Enter other requirements" />
    </div>

    <div>
      <label>Minimum Salary:</label>
      <input v-model="minSalaryInput" type="text" @blur="formatMinSalary" @focus="removeFormatting" />
    </div>

    <div>
      <label>Resume:</label>
      <textarea v-model="resume" rows="10"></textarea>
    </div>

    <button @click="save">Save</button>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useJsaStore } from '@/stores/jsaStore'
import PersistentDataService from '@/services/PersistentDataService'
import { type User, type UserConfig } from '@/types/interfaces'
import InfoTooltip from '@/components/InfoTooltip.vue';


const store = useJsaStore();
const router = useRouter()

const email = ref('example@example.com')
const location = ref('')
const remotePreference = ref('YES')
const distance = ref(0)
const minSalary = ref(0)
const resume = ref('')
const name = ref('')

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
  const u: User = {
    id: store.authUser?.id ?? '',
    email: email.value,
    location: location.value,
    remote_preference: remotePreference.value,
    distance: distance.value,
    min_salary: minSalary.value,
    resume: resume.value,
    results_wanted: 20, // TODO
    is_public: true,  // TODO
    name: name.value
  };

  try {
    const result = await PersistentDataService.upsertUser(u as User)

    await reconcileAndPersistConfigs('job_titles', jobTitles.value);
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


async function reconcileAndPersistConfigs(key: string, newValue: string) {
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


function reconcileConfigs(key: string, newValue: string) {
  const uid = store.authUser?.id || '';
  if (!uid || uid === '') return { toUpdate: [], toInsert: [], toDelete: [] };

  const newValues = newValue.split(',').map(v => v.trim().toLowerCase());
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

  if (!store.dbUser) {
    await store.getDBUser();
  }

  name.value = store.dbUser?.name || '';
  email.value = store.authUser?.email || '';
  remotePreference.value = store.dbUser?.remote_preference || 'YES';
  location.value = store.dbUser?.location || '';
  distance.value = store.dbUser?.distance || 0;
  resume.value = store.dbUser?.resume || '';
  minSalary.value = store.dbUser?.min_salary || 0;
  minSalaryInput.value = minSalary.value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });


  userConfigs.value = await PersistentDataService.fetchUserConfigs(store.authUser?.id || '');

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
  margin-bottom: 8px; /* Adjust as needed */
}

label {
  display: block;
  font-weight: 600;
  margin: 0;
}

input,
select,
textarea {
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
  margin: 10px 5px 10px 0;
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
