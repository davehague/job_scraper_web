// types/interfaces.ts
export interface Job {
    id: string
    created_at: string
    title: string
    company: string
    short_summary: string
    hard_requirements: string
    job_site: string
    url: string
    location: string | null
    date_posted: string
    comp_interval: string | null
    comp_min: number | null
    comp_max: number | null
    comp_currency: string | null
    emails: string | null
    date_pulled: string

    user_id: string
    user_interested: boolean | null
    has_applied: boolean
    
    overall_score: number
    desire_score: number
    experience_score: number
    meets_requirements_score: number
    meets_experience_score: number
    guidance: string
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
    send_emails: string
    onboarding_complete: boolean
    is_admin: boolean
    avatar_url: string
    last_login: string
    intentions: string
  }


export interface UserPreferences {
  jobTitles: string[];
  stopWords: string[];
  skillWords: string[];
  skillStopWords: string[];
  intentions: string[];
  candidateRequirements: string[];
  resume: string;
}

  export interface UserConfig {
    id: number
    key: string
    string_value: string | null
    int_value: number | null
    bool_value: boolean | null
    user_id: string
  }

  export interface UsersJobs {
    user_id: string
    job_id: string
    interested: boolean
    has_applied: boolean
    score: number
    desire_score: number
    experience_score: number
    meets_requirements_score: number
    meets_experience_score: number
  }