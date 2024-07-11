import { useJsaStore } from '@/stores/jsaStore'
import PersistentDataService from '@/services/PersistentDataService';

export const getScoreColor = (score: number | undefined) => {
  if (score === undefined) return '#888888';

  return score >= 85 ? '#59C9A5' : score > 75 ? '#93c1b2' : '#888888';
};

export const setUserInterest = async (jobId: string, interested: boolean | null) => {
  const store = useJsaStore();

  try {
    const uid = store.authUser?.id || '';
    if (!uid) return;

    const result = await PersistentDataService.setUserInterest(uid, jobId, interested);
    console.log("User interest set:", result);
    
  } catch (error) {
    console.error("Failed to set user interest:", error);
  }
};