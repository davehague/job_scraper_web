import { useJsaStore } from "@/stores/jsaStore";

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
  const consolidatedText = text.replace(/\s+/g, ' ').trim();
  return consolidatedText;
};
