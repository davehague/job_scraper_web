<template>
  <button @click="cancel" class="back-btn">
    <!-- <font-awesome-icon :icon="['fas', 'arrow-left']" /> -->
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
    <h3>Job Titles</h3>
    <template>
      <div>
        <div v-for="(title, index) in jobTitles" :key="'jobTitle-' + index" class="input-group">
          <input class="multi" v-model="jobTitles[index]" type="text" placeholder="Enter job title" />
          <button @click="removeJobTitle(index)" v-if="jobTitles.length > 1" class="remove-btn">
            <i class="fas fa-minus-circle"></i>
          </button>
          <button @click="addJobTitle" v-if="index === jobTitles.length - 1 && jobTitles.length < 4" class="add-btn">
            <i class="fas fa-plus-circle"></i>
          </button>
        </div>
      </div>
    </template>

    <hr />

    <div>
      <label>Remote:</label>
      <select v-model="remote">
        <option value="remoteOk">Remote OK</option>
        <option value="remoteOnly">Remote ONLY</option>
        <option value="localOnly">Local ONLY</option>
      </select>
    </div>
    <div v-if="remote !== 'remoteOnly'">
      <label>Location:</label>
      <input v-model="location" type="text" />
      <label>Distance:</label>
      <input v-model="distance" type="number" />
    </div>

    <hr />

    <h3>Stop Words</h3>
    <template>
      <div>
        <div v-for="(word, index) in stopWords" :key="'stopWord-' + index" class="input-group">
          <input class="multi" v-model="stopWords[index]" type="text" placeholder="Enter stop word" />
          <button @click="removeStopWord(index)" v-if="stopWords.length > 1" class="remove-btn">
            <i class="fas fa-minus-circle"></i>
          </button>
          <button @click="addStopWord" v-if="index === stopWords.length - 1 && stopWords.length < 4" class="add-btn">
            <i class="fas fa-plus-circle"></i>
          </button>
        </div>
      </div>
    </template>

    <hr />

    <h3>Skill Words</h3>
    <template>
      <div>
        <div v-for="(word, index) in skillWords" :key="'skillWord-' + index" class="input-group">
          <input class="multi" v-model="skillWords[index]" type="text" placeholder="Enter skill word" />
          <button @click="removeSkillWord(index)" v-if="skillWords.length > 1" class="remove-btn">
            <i class="fas fa-minus-circle"></i>
          </button>
          <button @click="addSkillWord" v-if="index === skillWords.length - 1 && skillWords.length < 4" class="add-btn">
            <i class="fas fa-plus-circle"></i>
          </button>
        </div>
      </div>
    </template>

    <hr />

    <h3>Other Requirements</h3>
    <template>
      <div>
        <div v-for="(requirement, index) in otherRequirements" :key="'otherRequirement-' + index" class="input-group">
          <input class="multi" v-model="otherRequirements[index]" type="text" placeholder="Enter other requirement" />
          <button @click="removeOtherRequirement(index)" v-if="otherRequirements.length > 1" class="remove-btn">
            <i class="fas fa-minus-circle"></i>
          </button>
          <button @click="addOtherRequirement"
            v-if="index === otherRequirements.length - 1 && otherRequirements.length < 4" class="add-btn">
            <i class="fas fa-plus-circle"></i>
          </button>
        </div>
      </div>
    </template>

    <hr />

    <div>
      <label>Resume:</label>
      <textarea v-model="resume" rows="10"></textarea>
    </div>

    <button @click="save">Save</button>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const name = ref('')
const email = ref('example@example.com')
const jobTitles = ref([''])
const remote = ref('remoteOk')
const location = ref('')
const distance = ref(0)
const stopWords = ref([''])
const skillWords = ref([''])
const otherRequirements = ref([''])
const resume = ref('')

function addJobTitle() {
  if (jobTitles.value.length < 4) {
    jobTitles.value.push('')
  }
}

function removeJobTitle(index) {
  jobTitles.value.splice(index, 1)
}

function addStopWord() {
  if (stopWords.value.length < 4) {
    stopWords.value.push('')
  }
}

function removeStopWord(index) {
  stopWords.value.splice(index, 1)
}

function addSkillWord() {
  if (skillWords.value.length < 4) {
    skillWords.value.push('')
  }
}

function removeSkillWord(index) {
  skillWords.value.splice(index, 1)
}

function addOtherRequirement() {
  if (otherRequirements.value.length < 4) {
    otherRequirements.value.push('')
  }
}

function removeOtherRequirement(index) {
  otherRequirements.value.splice(index, 1)
}

function save() {
  // TODO: Implement saving logic
  console.log('Saved:', { name: name.value, email: email.value, jobTitles: jobTitles.value, remote: remote.value, location: location.value, distance: distance.value, stopWords: stopWords.value, skillWords: skillWords.value, otherRequirements: otherRequirements.value, resume: resume.value })
  router.push('/')
}

function cancel() {
  router.push('/')
}

// onMounted(async () => {
//   const data = await fetchData();
//   jobTitles.value = data.jobTitles || [''];
//   stopWords.value = data.stopWords || [''];
//   skillWords.value = data.skillWords || [''];
//   otherRequirements.value = data.otherRequirements || [''];
// });
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
  background-color: #ccc;
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
  background-color: #455A64;
  color: #fff;
}

label {
  display: block;
  margin-right: 10px;
  margin-top: 30px;
  font-weight: 600
}


input,
select,
textarea {
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 95%;
}

select {
  width: 99%;
}

input:disabled {
  border: none;
  background: #f9f9f9;
}

.multi {
  margin-bottom: 2px;
}

button {
  margin: 10px 5px 10px 0px;
  padding: 10px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-group {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  height: 34px;
}

.input-group input {
  flex-grow: 1;
  margin-right: 5px;
}

.remove-btn,
.add-btn {
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
}

.remove-btn {
  background-color: #dc3545;
}

.add-btn {
  background-color: #28a745;
}

.remove-btn i,
.add-btn i {
  color: white;
}

.add-btn:hover {
  background-color: #19662b;
  opacity: 0.8;
}

.remove-btn:hover {
  background-color: #c82333;
  opacity: 0.8;
}
</style>
