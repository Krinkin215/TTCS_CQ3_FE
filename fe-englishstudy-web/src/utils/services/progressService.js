import { apiRequest } from '../apiClient';

export async function updateProgress(userId, vocabId, isCorrect) {
  return apiRequest(`/api/progress/update?userId=${userId}&vocabId=${vocabId}&isCorrect=${isCorrect}`, { 
    method: 'POST', 
    auth: true 
  });
}

export async function getLearnedVocabStats(userId) {
  return apiRequest(`/api/progress/learned-statistics?userId=${userId}`, { 
    method: 'GET', 
    auth: true 
  });
}
