

export const MOCK_COLLECTIONS = [
  { id: 0, name: 'Từ vựng của tôi', wordCount: 12, masteredVocab: 4 },
  { id: 1, name: 'Từ vựng luyện thi TOEIC', wordCount: 150, masteredVocab: 150 }, 
  { id: 2, name: 'Communication English (Part 1)', wordCount: 85, masteredVocab: 30 }, 
  { id: 3, name: 'Từ khó nhớ - A1/A2', wordCount: 42, masteredVocab: 0 }, 
  { id: 4, name: 'Chuyên ngành Công nghệ thông tin', wordCount: 210, masteredVocab: 80 },
  { id: 5, name: 'Luyện nghe IELTS Listening', wordCount: 98, masteredVocab: 98 },
];

export const MOCK_TOPICS = [
  { 
    id: 1, title: 'Animals (Động vật)', name: 'Animals (Động vật)', totalVocab: 45, masteredVocab: 45, color: 'bg-green-100 text-green-700', 
    lessons: [{id: 11, name: 'Pets', wordCount: 20, difficulty: 1}, {id: 12, name: 'Wild Animals', wordCount: 25, difficulty: 2}] 
  },
  { 
    id: 2, title: 'Technology (Công nghệ)', name: 'Technology (Công nghệ)', totalVocab: 60, masteredVocab: 20, color: 'bg-blue-100 text-blue-700', 
    lessons: [{id: 21, name: 'Hardware', wordCount: 30, difficulty: 3}, {id: 22, name: 'Software', wordCount: 30, difficulty: 4}] 
  }
];

export const STATUS_OPTIONS = [
  { id: 'NEW', name: 'Chưa học' }, 
  { id: 'LEARNING', name: 'Đang học' }, 
  { id: 'MASTERED', name: 'Đã thuộc' }, 
];