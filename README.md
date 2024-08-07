# Job Scraper Web Application

## Overview

This is the web frontend for the [Jobs App](https://github.com/davehague/job_scraper_py), hosted at https://jobs.davehague.com

*Built using NuxtJS, Vue3, and Typescript*

## Getting Started

To run the Job Scraper Web App, ensure you have NPM installed (I'm using [nvm](https://github.com/coreybutler/nvm-windows) with Node 18.17.1), then pull the code and run:


```bash
npm install
npm run dev
```

Create a `.env` file to store your secrets

```bash
SUPABASE_URL=https://<project_url>.supabase.co
SUPABASE_KEY=eyJhbGci...
MJ_APIKEY_PUBLIC=dd2d...
MJ_APIKEY_PRIVATE=e3e4...
OPENROUTER_API_KEY=sk-...
BASE_URL=https://localhost:3000
GOOGLE_SIGNIN_CLIENT_ID=6129...
MIXPANEL_TOKEN=6af...
GOOGLE_CLOUD_FUNCTION_API_KEY=AIz...
```

## Dev Guidance
- Built using VS code
*Recommended Extensions*
    - Playwright Test for VSCode
    - Vue - Official

- Code formatting:  Use the official Vue formatter

## Running Playwright tests
- `npx playwright test` to see tests run headless
- `npx playwright test --debug` to see tests run with UI
- Right click a test and choose run or debug to run a single test