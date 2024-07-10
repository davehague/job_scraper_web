import { useJsaStore } from '@/stores/jsaStore'
import PersistentDataService from '@/services/PersistentDataService';

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