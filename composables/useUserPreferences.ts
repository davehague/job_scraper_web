// composables/useUserPreferences.ts
import { ref } from "vue";
import { type UserConfig, type UserPreferences } from "@/types/interfaces";
import PersistentDataService from "@/services/PersistentDataService";

export function useUserPreferences() {
  const buildUserPreferencesFromConfigs = async (
    userId: string
  ): Promise<UserPreferences> => {
    const configs = await PersistentDataService.fetchUserConfigs(userId);
    const user = await PersistentDataService.fetchUserById(userId);

    return {
      jobTitles: getConfigValues(configs, "job_titles"),
      stopWords: getConfigValues(configs, "stop_words"),
      skillWords: getConfigValues(configs, "skill_words"),
      skillStopWords: getConfigValues(configs, "skill_stop_words"),
      intentions: user?.intentions?.split(",") || [],
      candidateRequirements: getConfigValues(configs, "candidate_requirements"),
      resume: user?.resume || "",
    };
  };

  const formatPreferencesAsXml = (prefs: UserPreferences): string => {
    return `
      <full_resume>${prefs.resume}</full_resume>
      <user_intentions>${prefs.intentions.join(",")}</user_intentions>
      <desired_job_keywords>${prefs.skillWords.join(",")}</desired_job_keywords>
      <undesired_job_keywords>${prefs.skillStopWords.join(
        ","
      )}</undesired_job_keywords>
      <desired_job_titles>${prefs.jobTitles.join(",")}</desired_job_titles>
      <undesired_job_titles>${prefs.stopWords.join(",")}</undesired_job_titles>
    `.trim();
  };

  const getConfigValues = (configs: UserConfig[], key: string): string[] => {
    return configs
      .filter((config) => config.key === key)
      .map((config) => config.string_value || "")
      .filter((value) => value !== "");
  };

  return {
    buildUserPreferencesFromConfigs,
    formatPreferencesAsXml,
  };
}
