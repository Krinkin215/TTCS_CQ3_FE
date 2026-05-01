import { apiRequest } from '../apiClient';

/**
 * Lấy danh sách collections của user hiện tại
 */
export async function fetchCollections() {
  return apiRequest('/api/collections', { method: 'GET', auth: true });
}

/**
 * Tạo collection mới
 * @param {string} name - Tên collection
 */
export async function createCollection(name) {
  return apiRequest('/api/collections', {
    method: 'POST',
    auth: true,
    body: { collectionName: name }
  });
}

/**
 * Xóa collection
 * @param {number|string} collectionId
 */
export async function deleteCollection(collectionId) {
  return apiRequest(`/api/collections/${collectionId}`, {
    method: 'DELETE',
    auth: true
  });
}

/**
 * Lấy danh sách từ vựng trong collection
 * @param {number|string} collectionId
 */
export async function fetchCollectionVocabs(collectionId) {
  return apiRequest(`/api/collections/${collectionId}/vocabs`, {
    method: 'GET',
    auth: true
  });
}

/**
 * Thêm từ vựng vào collection
 * @param {number|string} collectionId
 * @param {number|string} vocabId
 */
export async function addVocabToCollection(collectionId, vocabId) {
  return apiRequest(`/api/collections/${collectionId}/vocabs/${vocabId}`, {
    method: 'POST',
    auth: true
  });
}
