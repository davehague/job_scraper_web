<template>
    <div class="container">
        <Header />
        <div v-if="job" class="job-details">
            <div class="job-header">
                <div class="header-left">
                    <ScoreCircle :overall_score="job.overall_score" />
                </div>
                <div class="header-right">
                    <div class="title-and-link">
                        <h1>{{ job.title }} - {{ job.company }} ({{ job.location || 'Location not specified' }})</h1>
                        <button @click="goToJobPost" class="go-to-job">Go to job post</button>
                    </div>
                    <div class="meta-info">
                        <span><b>Post Date:</b> {{ formatDate(job.date_posted) }}</span>
                        <span><b>Salary:</b> {{ formatSalary(job.comp_min, job.comp_max, job.comp_currency,
                            job.comp_interval)
                            }}</span>
                        <span><b>Location Type:</b> {{ job.location ? 'On site' : 'Remote' }}</span>
                    </div>

                </div>
            </div>

            <div id="personalized-info" class="content-box">
                <div class="column scores-column">
                    <h2>Your match scores for this job</h2>
                    <div class="score-item">
                        <span>Overall Score</span>
                        <span>{{ job.overall_score }}</span>
                    </div>
                    <div class="score-item">
                        <span>Desire Score</span>
                        <span>{{ job.desire_score }}</span>
                    </div>
                    <div class="score-item">
                        <span>Experience Score</span>
                        <span>{{ job.experience_score }}</span>
                    </div>
                    <div class="score-item">
                        <span>Meets Requirements Score</span>
                        <span>{{ job.meets_requirements_score }}</span>
                    </div>
                    <div class="score-item">
                        <span>Meets Experience Score</span>
                        <span>{{ job.meets_experience_score }}</span>
                    </div>
                </div>
                <div class="column group">
                    <div>
                        <h2>You may love this job because</h2>
                        <p>{{ job.guidance }}</p>
                    </div>
                    <div>
                        <h2>The hiring manager might love you for this job because</h2>
                        <p>{{ job.guidance }}</p>
                    </div>
                    <div class="guidance">
                        <p>{{ job.guidance }}</p>
                    </div>
                </div>
            </div>

            <div id="job-and-company">
                <div class="row">
                    <div class="content-box">
                        <h2>Job Post Summary</h2>
                        <p>{{ job.short_summary }}</p>
                    </div>
                    <div class="column">
                        <div class="content-box column">
                            <h2>Role Requirements</h2>
                            <p>{{ job.hard_requirements }}</p>
                        </div>

                        <div class="content-box column">
                            <h2>About {{ job.company }}</h2>
                            <p>Company information placeholder</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="actions">
                <button @click="markAsApplied" class="button-primary">Mark as applied</button>
                <button @click="discardJob" class="button-secondary">Discard</button>
            </div>

    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { type Job } from '@/types/interfaces'
import { useJsaStore } from '@/stores/jsaStore'

const route = useRoute();
const router = useRouter();
const job = ref<Job | null>(null);
const store = useJsaStore();

const fetchJobDetails = async (id: string) => {
    console.log('Store Jobs:', store.currentJobs)
    await store.refreshJobs(store.dbUser!.id);
    console.log('Store Jobs:', store.currentJobs)

    const storeJob = store.getJobById(id);
    console.log('Store Job:', storeJob)
    if (storeJob) {
        job.value = storeJob
    }
    else {
        console.log('Job not found in store.')
        router.push('/home')
    }
}

watch(
    () => store.dbUser,
    async (dbUser) => {
        if (dbUser !== null) {
            const jobId = route.params.id as string
            console.log('DB User is now available:', dbUser)
            await fetchJobDetails(jobId)
        }
    },
    { immediate: true }
)

const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString()
}

const formatSalary = (min: number | null, max: number | null, currency: string | null, interval: string | null): string => {
    if (!min && !max) return 'Not specified'
    const formatNumber = (num: number) => num.toLocaleString('en-US', { style: 'currency', currency: currency || 'USD' })
    const salaryRange = min && max ? `${formatNumber(min)} - ${formatNumber(max)}` : formatNumber(min || max || 0)
    return `${salaryRange}${interval ? ` per ${removeIntervalSuffix(interval)}` : ''}`
}

const removeIntervalSuffix = (str: string): string => {
    return str.replace(/ly$/, '')
}

const goToJobPost = () => {
    if (job.value?.url) {
        window.open(job.value.url, '_blank')
    }
}

const markAsApplied = async () => {
    if (job.value) {
        job.value.user_interested = true
        // Implement API call to update job.user_interested
        console.log('Marked as applied')
    }
}

const discardJob = async () => {
    if (job.value) {
        job.value.user_interested = false
        // Implement API call to update job.user_interested
        console.log('Job discarded')
    }
}
</script>

<style scoped>
.container {
    margin: 0 auto;
    background-color: #fff;
}

.job-details {
    max-width: 1200px;
    margin: 20px 215px;
    padding: 20px;
    font-family: Arial, sans-serif;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.job-header {
    background-color: #fff;
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
    align-items: start;
}

.header-right {
    display: flex;
    flex-direction: column;
    flex: 1;
}

.title-and-link {
    display: flex;
    color: #040913E5;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

h1 {
    display: flex;
    font-size: 24px;
    margin: 0;
    flex: 1;
}

.go-to-job {
    background-color: #DCE0E0;
    color: #040913;
    border: none;
    border-radius: 4px;
    padding: 10px 20px;
    font-weight: 400;
    cursor: pointer;
    height: 32px;
    width: 188px;
}

.meta-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.content-box {
    border: 4px solid #59C9A5;
    border-radius: 4px;
    display: flex;
    gap: 24px;
    padding: 20px;
}

.row {
    display: flex;
    flex-direction: row;
    gap: 24px;
}

.column {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.scores-column {
    gap: 0px;
}

.group {
    gap: 24px;
}

.guidance {
    background-color: #59c9a535;
}

.guidance p {
    color: #040913E5;
}

.score-item {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 10px;
    width: 332px;
}

.job-info {
    flex: 2;
}

h2 {
    font-size: 18px;
    margin-bottom: 10px;
}

.actions {
    display: flex;
    gap: 24px;
    padding: 10px 0;
    margin: 20px 0px;
    box-shadow: 4px -6px 20px 0px #0409131A;
    padding-left: 235px;
}

button {
    width: 178px;
    height: 32px;
}

@media (max-width: 1200px) {
    .title-and-link {
        flex-direction: column;
        align-items: start;
        gap: 16px;
    }
    .job-details {
        margin: 20px 20px;
    }
    .content-box {
        flex-direction: column;
    }
    .row {
        flex-direction: column;
    }
}
</style>
