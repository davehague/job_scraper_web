// types/interfaces.ts
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
    date_pulled: string
  }
  
  export interface User {
    id: string
    email: string
    location: string
    remote_preference: string
    distance: number
    results_wanted: number
    min_salary: number
    resume: string
    name: string
    is_public: boolean
  }

  export interface UserConfig {
    id: number
    key: string
    string_value: string | null
    int_value: number | null
    bool_value: boolean | null
    user_id: string
  }