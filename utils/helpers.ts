import { useJsaStore } from "@/stores/jsaStore";
import type { AuthUser } from "@supabase/supabase-js";
import { type User as DBUser, type Job } from "~/types/interfaces";
import PersistentDataService from "~/services/PersistentDataService";
import { useRouter } from "#app";
import { marked } from "marked";

export const setMixpanelUser = (dbUser: DBUser | null | undefined) => {
  if (dbUser != null && dbUser != undefined) {
    const { $mixpanel } = useNuxtApp() as any; // Mixpanel plugin
    $mixpanel.identify(dbUser.id);
    $mixpanel.people.set({
      name: dbUser.name,
      email: dbUser.email,
      is_admin: dbUser.is_admin,
    });
  }
};

export const resetMixpanelUser = () => {
  const { $mixpanel } = useNuxtApp() as any; // Mixpanel plugin
  $mixpanel.reset();
};

export const handlePostSignIn = async (user: AuthUser) => {
  try {
    const store = useJsaStore();
    const router = useRouter();

    console.log("Handling post-sign-in", user);
    store.setAuthUser(user);

    let dbUser = await store.getDBUser();
    if (dbUser === null || dbUser === undefined) {
      console.log("Creating new user in DB...");
      const baseUser = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
      };

      const result = await PersistentDataService.upsertUser(baseUser as DBUser);
      console.log("Upsert user result:", result);
      if (result.error) {
        console.error("Error creating user:", result.error);
        return;
      }

      dbUser = result;
      store.setDBUser(result);
    }

    console.log("Store auth user: ", store.authUser);
    console.log("Store db user: ", store.dbUser);

    PersistentDataService.updateLastLogin(dbUser!.id); // No need to await

    const userShouldOnboard = await shouldRedirectToOnboarding();
    if (userShouldOnboard) {
      router.push("/onboarding");
    } else {
      router.push("/home");
    }
  } catch (error) {
    console.error("Error handling post-sign-in:", error);
  }
};

export const shouldRedirectToOnboarding = async () => {
  const store = useJsaStore();

  const loggedInUser = await store.getAuthUser();
  const dbUser = await store.getDBUser();

  if (loggedInUser && dbUser && !dbUser.onboarding_complete) {
    return true;
  }
  return false;
};

export const consolidateText = (text: string): string => {
  const consolidatedText = text.replace(/\s+/g, " ").trim();
  return consolidatedText;
};

export const isNumeric = (value: any): boolean => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

export const transformDataToJobs = (data: any[]): Job[] => {
  return data.map(item => ({
    id: item.id,
    created_at: item.created_at,
    title: item.title,
    company: item.company,
    short_summary: item.short_summary,
    hard_requirements: item.hard_requirements,
    job_site: item.job_site,
    url: item.url,
    location: item.location,
    date_posted: item.date_posted,
    comp_interval: item.comp_interval,
    comp_min: item.comp_min,
    comp_max: item.comp_max,
    comp_currency: item.comp_currency,
    emails: item.emails,
    date_pulled: item.date_pulled,

    user_id: item.user_id,
    user_interested: item.interested,
    overall_score: parseInt(item.score, 10),
    desire_score: parseInt(item.desire_score, 10),
    experience_score: parseInt(item.experience_score, 10),
    meets_requirements_score: parseInt(item.meets_requirements_score, 10),
    meets_experience_score: parseInt(item.meets_experience_score, 10),
    guidance: item.guidance,
  }));
};

export const renderMarkdown = (text: string) => {
  return marked(text);
};

export const jobRecencyText = (datePosted: string, datePulled: string) => {
  const todayDate = new Date().toISOString().split('T')[0];
  const dateDiff = (date1: string, date2: string) => Math.floor((Date.parse(date1) - Date.parse(date2)) / (1000 * 60 * 60 * 24));

  const datePostedDiff = datePosted ? dateDiff(todayDate, datePosted) : null;
  const datePulledDiff = dateDiff(todayDate, datePulled);

  const dayText = (diff: number | null) => {
    if (diff === null) return '';
    if (diff === 0) return 'today!';
    if (diff === 1) return 'yesterday';
    return `${diff} days ago`;
  };

  const pulledText = `Pulled ${dayText(datePulledDiff)}`;

  if (datePosted === datePulled) {
    return pulledText;
  }

  if (datePosted) {
    const postedText = dayText(datePostedDiff);
    return `${pulledText} (posted ${postedText})`;
  }

  return pulledText;
};