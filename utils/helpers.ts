import { useJsaStore } from "@/stores/jsaStore";
import type { AuthUser } from "@supabase/supabase-js";
import { type User as DBUser } from "~/types/interfaces";
import PersistentDataService from "~/services/PersistentDataService";
import { useRouter } from "#app";

export const setMixpanelUser = (dbUser: DBUser | null | undefined) => {
  if (dbUser != null && dbUser != undefined) {
    const { $mixpanel } = useNuxtApp() as any; // Mixpanel plugin
    $mixpanel.identify(dbUser.id);
    $mixpanel.people.set({ name: dbUser.name, email: dbUser.email, is_admin: dbUser.is_admin });
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
    await createOrSetDBUser(user);

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

const createOrSetDBUser = async (user: AuthUser) => {
  const store = useJsaStore();

  store.setAuthUser(user);
  let dbUser = await store.getDBUser();
  console.log("Create Or Set DB User:", dbUser);
  if (dbUser === null || dbUser === undefined) {
    console.log("Creating new user in DB...");
    const baseUser = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || null,
      avatar_url: user.user_metadata?.avatar_url || null,
    };

    const result = await PersistentDataService.upsertUser(baseUser as DBUser);
    if (result.error) {
      console.error("Error creating user:", result.error);
      return;
    }

    dbUser = result.data;
    store.setDBUser(result.data);
  }

  return dbUser;
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