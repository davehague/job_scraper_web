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
                        <button @click="goToJobPost" class="button-secondary">
                            <span class="go-to-job-text">Go to job post</span>
                            <i class="fas fa-external-link-alt"></i>
                        </button>
                    </div>
                    <div class="meta-info">
                        <span><b>Date:</b> {{ jobRecencyText(job.date_posted, job.date_pulled) }}</span>
                        <span><b>Salary:</b> {{ formatSalary(job.comp_min, job.comp_max, job.comp_currency,
                            job.comp_interval)
                            }}</span>
                        <span><b>Location Type:</b> {{ job.location ? 'On site' : 'Remote' }}</span>
                    </div>
                </div>
            </div>

            <div id="personalized-info" class="content-box" :style="{ borderColor: getScoreColor(job.overall_score) }">
                <div class="column scores-column">
                    <h2 class="scores-h2">Your match scores for this job</h2>
                    <div class="score-item" :style="{ background: getScoreItemStyle(job.overall_score) }">
                        <div class="score-label">
                            <span>Overall Score</span>
                            <InfoTooltip
                                text="An assessment from 1 to 100, where 1 is very little chance of this being a good match for you and for the
                                hiring manager, and 100 being a perfect match (you'll have a great chance to succeed in this role)." />
                        </div>
                        <span class="score">{{ job.overall_score }}</span>
                    </div>
                    <div class="score-item">
                        <div class="score-label">
                            <span>Desire Score</span>
                            <InfoTooltip text="How you might rate this job on a scale from 1 to 100 in terms of how well it matches your 
                                experience and the type of job you desire." />
                        </div>
                        <span class="score">{{ job.desire_score }}</span>
                    </div>
                    <div class="score-item" :style="{ background: getScoreItemStyle(job.overall_score) }">
                        <div class="score-label">
                            <span>Experience Score</span>
                            <InfoTooltip
                                text="How you might rate this job on a scale from 1 to 100 as a match for your EXPERIENCE level 
                                (you don't feel underqualified OR overqualified)." />
                        </div>
                        <span class="score">{{ job.experience_score }}</span>
                    </div>
                    <div class="score-item">
                        <div class="score-label">
                            <span>Meets Requirements Score</span>
                            <InfoTooltip
                                text="How a hiring manager for this job might rate you (on a scale from 1 to 100) on how 
                                well you meet the SKILL requirements for this job." />
                        </div>
                        <span class="score">{{ job.meets_requirements_score }}</span>
                    </div>
                    <div class="score-item" :style="{ background: getScoreItemStyle(job.overall_score) }">
                        <div class="score-label">
                            <span>Meets Experience Score</span>
                            <InfoTooltip
                                text="How a hiring manager for this job might rate you (on a scale from 1 to 100) on how 
                                well you meet the EXPERIENCE requirements for this job." />
                        </div>
                        <span class="score">{{ job.meets_experience_score }}</span>
                    </div>
                </div>
                <div class="column group">
                    <div>
                        <h2>What you may think of this job</h2>
                        <div class="rendered-content" v-html="renderMarkdown(youMayGuidance)" />
                    </div>
                    <div>
                        <h2>What the hiring manager may think</h2>
                        <div class="rendered-content" v-html="renderMarkdown(hiringManagerGuidance)" />
                    </div>
                    <div class="guidance" :style="{ background: getScoreItemStyle(job.overall_score) }">
                        <i class="far fa-lightbulb larger-icon"></i>
                        <span class="rendered-content" v-html="renderMarkdown(overallGuidance)" />
                    </div>
                </div>
            </div>

            <div id="job-and-company">
                <div class="row">
                    <div class="content-box column single-row-column"
                        :style="{ borderColor: getScoreColor(job.overall_score) }">
                        <h2>Job Post Summary</h2>
                        <div v-html="renderMarkdown(job.short_summary)" />
                    </div>
                    <div class="column">
                        <div class="content-box column single-row-column"
                            :style="{ borderColor: getScoreColor(job.overall_score) }">
                            <h2>Role Requirements</h2>
                            <div v-html="renderMarkdown(job.hard_requirements)" />
                        </div>

                        <div class="content-box column single-row-column"
                            :style="{ borderColor: getScoreColor(job.overall_score) }">
                            <h2>About {{ job.company }}</h2>
                            <p>Company information coming soon...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="job">
            <div class="actions-bar">
                <div class="actions-container">
                    <JobActionButtons :job="job" @applied-updated="appliedUpdated"
                        @interest-updated="interestUpdated" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { type Job } from '@/types/interfaces'
import { useJsaStore } from '@/stores/jsaStore'
import { renderMarkdown } from '@/utils/helpers'
import { jobRecencyText } from '@/utils/helpers'
import { setUserInterest, setHasApplied, getScoreColor } from '@/utils/jobs'
import '@/assets/buttons.css'


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

let youMayGuidance = ref('')
let hiringManagerGuidance = ref('')
let overallGuidance = ref('')

watch(
    () => job.value,
    () => {
        youMayGuidance.value = job.value?.guidance.split('The hiring manager')[0] || '';
        hiringManagerGuidance.value = job.value?.guidance.split('The hiring manager')[1] || '';
        hiringManagerGuidance.value = 'The hiring manager' + hiringManagerGuidance.value.split('Overall')[0] || '';
        overallGuidance.value = 'Overall' + job.value?.guidance.split('Overall')[1] || '';
    },
    { immediate: true }
)

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

const appliedUpdated = (jobId: string, applied: boolean) => {
    if (applied)
        router.push('/home?filter=viewApplied')
    else
        router.push('/home?filter=savedResults')
};

const interestUpdated = (jobId: string, interest: boolean | null) => {
    if (interest === null)
        router.push('/home')
    else if (interest)
        router.push('/home?filter=savedResults')
    else
        router.push('/home?filter=viewDiscards')
};

const getScoreItemStyle = (score: number | undefined) => {
    const color = getScoreColor(score);
    return `${color}22`; // Add 22 to the end of the color to make it 15% opaque
};
</script>

<style scoped>
.container {
    margin: 0 auto;
    background-color: #fff;
}

.score-circle:hover {
  box-shadow: none;
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
    margin-bottom: 8px;
    align-items: start;
}

.header-left {
    display: flex;
    flex: 0;
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

.go-to-job-text {
    margin: 0 8px;
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
    gap: 48px;
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
    flex: 1;
}

.single-row-column {
    gap: 0px;
}

.group {
    gap: 12px;
}

.scores-column {
    gap: 0px;
    flex: 0;
}

.score-item {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 332px;
    padding: 8px;
}

.score-label {
    display: flex;
    gap: 4px;
    align-items: center;
}

.score {
    font-weight: 600;
    display: flex; 
    align-items: center;
}

.guidance {
    background-color: #EEFAF6;
    display: flex;
    align-items: center;
    border-radius: 4px;
}

i {
    color: #234F5B;
}

.guidance i {
    padding: 16px;
}

.larger-icon {
    font-size: 32px;
}

.job-info {
    flex: 2;
}

h2 {
    font-size: 18px;
    margin: 0;
}

.scores-h2 {
    margin-bottom: 16px;
}

.actions-bar {
    display: flex;
    gap: 24px;
    padding: 10px 0;
    margin: 20px 0px;
    box-shadow: 4px -6px 20px 0px #0409131A;
    padding-left: 235px;
}

.actions-container {
    display: flex;
    gap: 24px;
    min-width: 400px;
}

button {
    width: 178px;
    height: 32px;
    padding: 0;
}

@media (max-width: 1200px) {
    .score-item {
        width: 100%;
    }
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

    .actions-bar {
        padding-left: 0;
        justify-content: center;
    }
    
    .actions-container {
        min-width: 0;
        flex: 1;
        padding: 0 20px;
    }
}
</style>
