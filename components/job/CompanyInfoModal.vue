<template>
  <div class="company-section text-center">
    <button @click="openModal" class="modal-trigger button-secondary">
      <i class="fas fa-building"></i>
      <span class="ml-2">Learn about {{ company }}</span>
    </button>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isOpen" class="modal-backdrop" @click="isOpen = false">
          <div class="modal-container" @click.stop>
            <div class="modal-header">
              <h2 class="modal-title">About {{ company }}</h2>
              <button @click="isOpen = false" class="modal-close">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="modal-content">
              <div v-if="error" class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                {{ error }}
              </div>

              <div v-if="loading" class="loading-state">
                <i class="fas fa-spinner fa-spin fa-2x"></i>
                <p>Loading company information...</p>
              </div>

              <div v-if="companyData" v-html="renderMarkdown(companyData)" class="company-data" />
              <div v-if="citations.length" class="citations">
                <h3>Citations</h3>
                <ol>
                  <li v-for="(citation, index) in citations" :key="index">
                    <a :href="citation">{{ citation }}</a>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { renderMarkdown } from '@/utils/helpers'

const props = defineProps<{
  company: string
  location: string
}>()

const isOpen = ref(false)
const loading = ref(false)
const companyData = ref<string | null>(null)
const citations = ref<string[]>([])
const error = ref('')

const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isOpen.value) {
    isOpen.value = false
  }
}

const openModal = async () => {
  isOpen.value = true
  if (!companyData.value) {
    await fetchCompanyInfo()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)

  watch(isOpen, (newVal) => {
    if (newVal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  })
})

onUnmounted(() => {
  document.body.style.overflow = ''
  document.removeEventListener('keydown', handleEscape)
})

const fetchCompanyInfo = async () => {
  loading.value = true
  error.value = ''

  const prompt = `I'm considering a job at ${props.company}. They've listed the location for this job as ${props.location}. I'd like you to return the following information about this company to me:

- Company Summary: Short summary about what the company does and the industry in which it operates, where it is headquartered
- Company Size: Your best guess at company size, in terms of employees
- Company Page: Direct link to company's career page, if available, or a link to the company's homepage
- Employee Sentiment: Employee reviews, work-life balance, perks for employees, what its like to work there.
    - Additionally, always return a link to a Glassdoor search for the company name in this format: '[Glassdoor](https://www.glassdoor.com/Search/results.htm?keyword=' + <company-name,HTML encoded,case-sensitive>)
- Company Stage: One of the following: pre-seed or seed stage startup, early stage startup (series A/B), growth stage startup, mature stage company, enterprise stage company
- Financial health: Company valuation, funding rounds, growth, profitabilty, etc.
`

  try {
    const response = await fetch('/api/openrouter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "perplexity/llama-3.1-sonar-small-128k-online",
        max_tokens: 1000,
        messages: [{ role: "system", content: "You only format using bullet points, no other markdown" }, { role: "user", content: prompt }],
      }),
    })

    if (!response.ok) throw new Error('Failed to fetch company info')

    const data = await response.json()
    companyData.value = data.data.choices[0].message.content

    if (data.data.citations) {
      citations.value = data.data.citations
    }

  } catch (err) {
    error.value = 'Failed to load company information'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal-trigger {
  width: auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  overflow-y: auto;
}

.modal-container {
  background: white;
  border-radius: 8px;
  width: 90%;
  margin: auto;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-close {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #6b7280;
}

.modal-close:hover {
  color: #374151;
  background: none;
}

.modal-content {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px 0;
}

.error-message {
  color: #ef4444;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.company-data {
  line-height: 1.6;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
* {
  display: block;
}

* {
  word-wrap: break-word;
  overflow-wrap: break-word;
}
</style>