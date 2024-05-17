// types/job.ts
export interface Job {
    id: string
    created_at: string
    title: string
    company: string
    short_summary: string
    hard_requirements: string
    score: string
    job_site: string
    url: string
    location: string | null
    date_posted: string
    comp_interval: string | null
    comp_min: number | null
    comp_max: number | null
    comp_currency: string | null
    emails: string | null
    description: string
    searched_title: string
    role_id: number | null
  }
  